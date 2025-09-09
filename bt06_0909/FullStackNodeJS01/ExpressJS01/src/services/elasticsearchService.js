const { 
    client, 
    PRODUCT_INDEX, 
    indexProduct, 
    bulkIndexProducts, 
    deleteProduct, 
    updateProduct 
} = require('../config/elasticsearch');
const Product = require('../models/product');
const db = require('../config/database');

class ElasticsearchService {
    
    // Sync all products from MySQL to Elasticsearch
    static async syncAllProducts() {
        try {
            console.log('Starting full product sync...');
            
            // Get all active products from MySQL with full details
            const sql = `
                SELECT p.*, c.name as category_name, c.slug as category_slug,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(r.id) as review_count,
                GROUP_CONCAT(DISTINCT pt.tag_name) as tags
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = 1
                LEFT JOIN product_tags pt ON p.id = pt.product_id
                WHERE p.status = 'active'
                GROUP BY p.id
                ORDER BY p.id
            `;

            const products = await db.query(sql);
            
            if (products.length === 0) {
                console.log('No products found to sync');
                return { synced: 0, errors: [] };
            }

            // Prepare products for Elasticsearch
            const esProducts = products.map(product => ({
                ...product,
                tags: product.tags ? product.tags.split(',') : [],
                final_price: product.sale_price || product.price,
                discount_percentage: product.sale_price 
                    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
                    : 0
            }));

            // Bulk index products to Elasticsearch
            const result = await bulkIndexProducts(esProducts);
            
            console.log(`Sync completed: ${result.indexed} products indexed, ${result.errors.length} errors`);
            
            if (result.errors.length > 0) {
                console.error('Sync errors:', result.errors);
            }

            return {
                synced: result.indexed,
                errors: result.errors,
                total: products.length
            };
        } catch (error) {
            console.error('Error syncing all products:', error);
            throw error;
        }
    }

    // Sync single product to Elasticsearch
    static async syncProduct(productId) {
        try {
            const product = await ElasticsearchService.getProductForSync(productId);
            
            if (!product) {
                // Product not found or inactive, remove from ES if exists
                await deleteProduct(productId);
                return { action: 'deleted' };
            }

            const result = await indexProduct(product);
            return { action: 'indexed', result };
        } catch (error) {
            console.error(`Error syncing product ${productId}:`, error);
            throw error;
        }
    }

    // Get product with all required data for Elasticsearch
    static async getProductForSync(productId) {
        try {
            const sql = `
                SELECT p.*, c.name as category_name, c.slug as category_slug,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(r.id) as review_count,
                GROUP_CONCAT(DISTINCT pt.tag_name) as tags
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = 1
                LEFT JOIN product_tags pt ON p.id = pt.product_id
                WHERE p.id = ? AND p.status = 'active'
                GROUP BY p.id
            `;

            const products = await db.query(sql, [productId]);
            
            if (products.length === 0) {
                return null;
            }

            const product = products[0];
            return {
                ...product,
                tags: product.tags ? product.tags.split(',') : [],
                final_price: product.sale_price || product.price,
                discount_percentage: product.sale_price 
                    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
                    : 0
            };
        } catch (error) {
            console.error(`Error getting product ${productId} for sync:`, error);
            throw error;
        }
    }

    // Remove product from Elasticsearch
    static async removeProduct(productId) {
        try {
            const result = await deleteProduct(productId);
            return result;
        } catch (error) {
            console.error(`Error removing product ${productId} from Elasticsearch:`, error);
            throw error;
        }
    }

    // Fuzzy search products with advanced filtering
    static async fuzzySearch(options = {}) {
        try {
            const {
                query = '',
                category_id = null,
                category_slug = null,
                min_price = null,
                max_price = null,
                is_featured = null,
                tags = [],
                sort_by = '_score',
                sort_order = 'DESC',
                page = 1,
                limit = 12,
                min_rating = null,
                in_stock_only = false,
                view_count_min = null,
                on_sale_only = false
            } = options;

            const from = (page - 1) * limit;

            // Build the search query
            const searchBody = {
                query: {
                    bool: {
                        must: [],
                        filter: [
                            { term: { status: 'active' } }
                        ],
                        should: [],
                        minimum_should_match: 0
                    }
                },
                sort: [],
                from: from,
                size: limit,
                highlight: {
                    fields: {
                        name: { fragment_size: 150, number_of_fragments: 1 },
                        description: { fragment_size: 200, number_of_fragments: 1 },
                        short_description: { fragment_size: 150, number_of_fragments: 1 }
                    }
                },
                aggs: {
                    categories: {
                        terms: {
                            field: 'category_name.keyword',
                            size: 20
                        }
                    },
                    price_stats: {
                        stats: {
                            field: 'final_price'
                        }
                    },
                    avg_rating: {
                        avg: {
                            field: 'average_rating'
                        }
                    }
                }
            };

            // Add search query
            if (query && query.trim()) {
                const searchQuery = {
                    multi_match: {
                        query: query,
                        fields: [
                            'name^3',
                            'name.keyword^4',
                            'description^1.5',
                            'short_description^2',
                            'category_name^2',
                            'tags^1.5',
                            'sku^2',
                            'meta_title^1.2',
                            'meta_description'
                        ],
                        type: 'best_fields',
                        fuzziness: 'AUTO',
                        operator: 'or',
                        minimum_should_match: '50%'
                    }
                };
                searchBody.query.bool.must.push(searchQuery);

                // Add suggestion query for did-you-mean
                searchBody.suggest = {
                    text: query,
                    name_suggestion: {
                        term: {
                            field: 'name',
                            suggest_mode: 'popular',
                            min_word_length: 3
                        }
                    }
                };
            } else {
                // If no search query, boost featured products and sort by relevance
                searchBody.query.bool.should.push({
                    term: { is_featured: { value: true, boost: 2.0 } }
                });
                searchBody.query.bool.should.push({
                    range: { view_count: { gte: 100, boost: 1.5 } }
                });
                searchBody.query.bool.should.push({
                    range: { average_rating: { gte: 4.0, boost: 1.3 } }
                });
            }

            // Apply filters
            if (category_id) {
                searchBody.query.bool.filter.push({
                    term: { category_id: category_id }
                });
            }

            if (category_slug) {
                searchBody.query.bool.filter.push({
                    term: { category_slug: category_slug }
                });
            }

            if (min_price !== null || max_price !== null) {
                const priceRange = {};
                if (min_price !== null) priceRange.gte = min_price;
                if (max_price !== null) priceRange.lte = max_price;
                
                searchBody.query.bool.filter.push({
                    range: { final_price: priceRange }
                });
            }

            if (is_featured !== null) {
                searchBody.query.bool.filter.push({
                    term: { is_featured: is_featured }
                });
            }

            if (tags && tags.length > 0) {
                searchBody.query.bool.filter.push({
                    terms: { tags: tags }
                });
            }

            if (min_rating !== null) {
                searchBody.query.bool.filter.push({
                    range: { average_rating: { gte: min_rating } }
                });
            }

            if (in_stock_only) {
                searchBody.query.bool.filter.push({
                    range: { stock_quantity: { gt: 0 } }
                });
            }

            if (view_count_min !== null) {
                searchBody.query.bool.filter.push({
                    range: { view_count: { gte: view_count_min } }
                });
            }

            if (on_sale_only) {
                searchBody.query.bool.filter.push({
                    range: { discount_percentage: { gt: 0 } }
                });
            }

            // Apply sorting
            const sortField = this.getSortField(sort_by);
            const sortDirection = sort_order.toLowerCase() === 'asc' ? 'asc' : 'desc';

            if (sortField === '_score') {
                searchBody.sort.push({ 
                    _score: { order: sortDirection },
                    boost_score: { order: 'desc' },
                    view_count: { order: 'desc' }
                });
            } else {
                searchBody.sort.push({ 
                    [sortField]: { order: sortDirection },
                    _score: { order: 'desc' }
                });
            }

            // Execute search
            const response = await client.search({
                index: PRODUCT_INDEX,
                body: searchBody
            });

            // Process results
            const hits = response.body.hits;
            const aggregations = response.body.aggregations;
            const suggestions = response.body.suggest;

            const products = hits.hits.map(hit => ({
                ...hit._source,
                _score: hit._score,
                highlight: hit.highlight
            }));

            return {
                products: products,
                pagination: {
                    current_page: page,
                    total_pages: Math.ceil(hits.total.value / limit),
                    total_records: hits.total.value,
                    limit: limit,
                    has_next: page < Math.ceil(hits.total.value / limit),
                    has_prev: page > 1
                },
                aggregations: {
                    categories: aggregations.categories.buckets,
                    price_stats: aggregations.price_stats,
                    avg_rating: aggregations.avg_rating.value
                },
                suggestions: suggestions ? {
                    name_suggestions: suggestions.name_suggestion
                } : null,
                query_info: {
                    query: query,
                    took: response.body.took,
                    timed_out: response.body.timed_out
                }
            };

        } catch (error) {
            console.error('Elasticsearch fuzzy search error:', error);
            throw error;
        }
    }

    // Auto-complete search suggestions
    static async getSearchSuggestions(query, limit = 10) {
        try {
            if (!query || query.length < 2) {
                return [];
            }

            const searchBody = {
                suggest: {
                    product_suggestions: {
                        prefix: query,
                        completion: {
                            field: 'name.suggest',
                            size: limit,
                            skip_duplicates: true,
                            contexts: {
                                status: ['active']
                            }
                        }
                    }
                },
                query: {
                    bool: {
                        must: {
                            multi_match: {
                                query: query,
                                fields: ['name^3', 'category_name^2', 'tags'],
                                type: 'phrase_prefix',
                                max_expansions: 5
                            }
                        },
                        filter: [
                            { term: { status: 'active' } }
                        ]
                    }
                },
                _source: ['name', 'category_name', 'slug'],
                size: Math.min(limit, 10)
            };

            const response = await client.search({
                index: PRODUCT_INDEX,
                body: searchBody
            });

            const suggestions = [];
            
            // Add completion suggestions
            if (response.body.suggest && response.body.suggest.product_suggestions) {
                response.body.suggest.product_suggestions.forEach(suggestion => {
                    suggestion.options.forEach(option => {
                        suggestions.push({
                            text: option.text,
                            type: 'completion'
                        });
                    });
                });
            }

            // Add search results as suggestions
            if (response.body.hits && response.body.hits.hits) {
                response.body.hits.hits.forEach(hit => {
                    suggestions.push({
                        text: hit._source.name,
                        category: hit._source.category_name,
                        slug: hit._source.slug,
                        type: 'product'
                    });
                });
            }

            return suggestions;
        } catch (error) {
            console.error('Error getting search suggestions:', error);
            return [];
        }
    }

    // Get sort field mapping
    static getSortField(sortBy) {
        const sortMapping = {
            'name': 'name.keyword',
            'price': 'final_price',
            'created_at': 'created_at',
            'updated_at': 'updated_at',
            'view_count': 'view_count',
            'purchase_count': 'purchase_count',
            'rating': 'average_rating',
            'popularity': 'view_count',
            'relevance': '_score',
            '_score': '_score'
        };

        return sortMapping[sortBy] || '_score';
    }

    // Get popular search terms
    static async getPopularSearchTerms(days = 7, limit = 20) {
        try {
            // This would typically require logging search queries
            // For now, return static popular terms based on product data
            const searchBody = {
                aggs: {
                    popular_categories: {
                        terms: {
                            field: 'category_name.keyword',
                            size: limit,
                            order: { avg_views: 'desc' }
                        },
                        aggs: {
                            avg_views: {
                                avg: { field: 'view_count' }
                            }
                        }
                    },
                    popular_tags: {
                        terms: {
                            field: 'tags',
                            size: limit,
                            order: { avg_views: 'desc' }
                        },
                        aggs: {
                            avg_views: {
                                avg: { field: 'view_count' }
                            }
                        }
                    }
                },
                size: 0
            };

            const response = await client.search({
                index: PRODUCT_INDEX,
                body: searchBody
            });

            return {
                categories: response.body.aggregations.popular_categories.buckets,
                tags: response.body.aggregations.popular_tags.buckets
            };
        } catch (error) {
            console.error('Error getting popular search terms:', error);
            return { categories: [], tags: [] };
        }
    }

    // Health check for Elasticsearch
    static async healthCheck() {
        try {
            const health = await client.cluster.health();
            const indexStats = await client.indices.stats({ index: PRODUCT_INDEX });
            
            return {
                status: health.status,
                cluster_name: health.cluster_name,
                number_of_nodes: health.number_of_nodes,
                active_shards: health.active_shards,
                index_health: {
                    total_docs: indexStats.body.indices[PRODUCT_INDEX]?.total?.docs?.count || 0,
                    index_size: indexStats.body.indices[PRODUCT_INDEX]?.total?.store?.size_in_bytes || 0
                }
            };
        } catch (error) {
            console.error('Elasticsearch health check failed:', error);
            return {
                status: 'red',
                error: error.message
            };
        }
    }
}

module.exports = ElasticsearchService;
