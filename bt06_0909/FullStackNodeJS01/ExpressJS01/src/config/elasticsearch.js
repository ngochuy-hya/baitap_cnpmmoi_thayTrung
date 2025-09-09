const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

// Elasticsearch client configuration
const client = new Client({
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    // Disable auth for local development
    // auth: {
    //     username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    //     password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
    // },
    requestTimeout: 60000,
    maxRetries: 3,
    compression: true,
    ssl: {
        rejectUnauthorized: false
    }
});

// Index name for products
const PRODUCT_INDEX = process.env.ELASTICSEARCH_PRODUCT_INDEX || 'ecommerce_products';

// Test connection
const testConnection = async () => {
    try {
        const info = await client.info();
        console.log('✓ Elasticsearch connection successful:', info.version?.number || 'unknown');
        return true;
    } catch (error) {
        console.error('✗ Elasticsearch connection failed:', error.message);
        console.error('Make sure Elasticsearch is running on http://localhost:9200');
        return false;
    }
};

// Create product index with mapping
const createProductIndex = async () => {
    try {
        const exists = await client.indices.exists({ index: PRODUCT_INDEX });
        
        if (!exists) {
            await client.indices.create({
                index: PRODUCT_INDEX,
                body: {
                    settings: {
                        number_of_shards: 1,
                        number_of_replicas: 1,
                        analysis: {
                            analyzer: {
                                vietnamese_analyzer: {
                                    type: 'custom',
                                    tokenizer: 'standard',
                                    filter: [
                                        'lowercase',
                                        'asciifolding',
                                        'vietnamese_stop',
                                        'vietnamese_stemmer'
                                    ]
                                },
                                search_analyzer: {
                                    type: 'custom',
                                    tokenizer: 'standard',
                                    filter: [
                                        'lowercase',
                                        'asciifolding'
                                    ]
                                }
                            },
                            filter: {
                                vietnamese_stop: {
                                    type: 'stop',
                                    stopwords: ['của', 'và', 'với', 'cho', 'từ', 'trong', 'trên', 'dưới', 'tại', 'về']
                                },
                                vietnamese_stemmer: {
                                    type: 'stemmer',
                                    language: 'minimal_english'
                                }
                            }
                        }
                    },
                    mappings: {
                        properties: {
                            id: {
                                type: 'integer'
                            },
                            name: {
                                type: 'text',
                                analyzer: 'vietnamese_analyzer',
                                search_analyzer: 'search_analyzer',
                                fields: {
                                    keyword: {
                                        type: 'keyword'
                                    },
                                    suggest: {
                                        type: 'completion'
                                    }
                                }
                            },
                            slug: {
                                type: 'keyword'
                            },
                            description: {
                                type: 'text',
                                analyzer: 'vietnamese_analyzer',
                                search_analyzer: 'search_analyzer'
                            },
                            short_description: {
                                type: 'text',
                                analyzer: 'vietnamese_analyzer',
                                search_analyzer: 'search_analyzer'
                            },
                            price: {
                                type: 'double'
                            },
                            sale_price: {
                                type: 'double'
                            },
                            final_price: {
                                type: 'double'
                            },
                            discount_percentage: {
                                type: 'integer'
                            },
                            sku: {
                                type: 'keyword'
                            },
                            stock_quantity: {
                                type: 'integer'
                            },
                            category_id: {
                                type: 'integer'
                            },
                            category_name: {
                                type: 'text',
                                analyzer: 'vietnamese_analyzer',
                                fields: {
                                    keyword: {
                                        type: 'keyword'
                                    }
                                }
                            },
                            category_slug: {
                                type: 'keyword'
                            },
                            featured_image: {
                                type: 'keyword',
                                index: false
                            },
                            gallery: {
                                type: 'text',
                                index: false
                            },
                            status: {
                                type: 'keyword'
                            },
                            is_featured: {
                                type: 'boolean'
                            },
                            meta_title: {
                                type: 'text',
                                analyzer: 'vietnamese_analyzer'
                            },
                            meta_description: {
                                type: 'text',
                                analyzer: 'vietnamese_analyzer'
                            },
                            view_count: {
                                type: 'integer'
                            },
                            purchase_count: {
                                type: 'integer'
                            },
                            average_rating: {
                                type: 'float'
                            },
                            review_count: {
                                type: 'integer'
                            },
                            tags: {
                                type: 'keyword'
                            },
                            attributes: {
                                type: 'nested',
                                properties: {
                                    name: {
                                        type: 'keyword'
                                    },
                                    value: {
                                        type: 'text',
                                        analyzer: 'vietnamese_analyzer',
                                        fields: {
                                            keyword: {
                                                type: 'keyword'
                                            }
                                        }
                                    }
                                }
                            },
                            created_at: {
                                type: 'date',
                                format: 'yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis'
                            },
                            updated_at: {
                                type: 'date',
                                format: 'yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis'
                            },
                            boost_score: {
                                type: 'float'
                            }
                        }
                    }
                }
            });
            
            console.log(`✓ Product index '${PRODUCT_INDEX}' created successfully`);
        } else {
            console.log(`✓ Product index '${PRODUCT_INDEX}' already exists`);
        }
    } catch (error) {
        console.error('✗ Error creating product index:', error);
        throw error;
    }
};

// Delete and recreate index (useful for development)
const recreateProductIndex = async () => {
    try {
        const exists = await client.indices.exists({ index: PRODUCT_INDEX });
        
        if (exists) {
            await client.indices.delete({ index: PRODUCT_INDEX });
            console.log(`✓ Product index '${PRODUCT_INDEX}' deleted`);
        }
        
        await createProductIndex();
    } catch (error) {
        console.error('✗ Error recreating product index:', error);
        throw error;
    }
};

// Index a single product
const indexProduct = async (productData) => {
    try {
        const finalPrice = productData.sale_price || productData.price;
        const discountPercentage = productData.sale_price 
            ? Math.round(((productData.price - productData.sale_price) / productData.price) * 100)
            : 0;

        // Calculate boost score based on various factors
        const boostScore = calculateBoostScore(productData);

        const doc = {
            ...productData,
            final_price: finalPrice,
            discount_percentage: discountPercentage,
            boost_score: boostScore,
            view_count: productData.view_count || 0,
            purchase_count: productData.purchase_count || 0
        };

        const response = await client.index({
            index: PRODUCT_INDEX,
            id: productData.id,
            body: doc
        });

        return response;
    } catch (error) {
        console.error('Error indexing product:', error);
        throw error;
    }
};

// Calculate boost score for ranking
const calculateBoostScore = (product) => {
    let score = 1.0;

    // Featured products get higher score
    if (product.is_featured) {
        score *= 1.5;
    }

    // Products on sale get higher score
    if (product.sale_price && product.sale_price < product.price) {
        score *= 1.3;
    }

    // Products with high rating get higher score
    if (product.average_rating) {
        score *= (1 + (product.average_rating / 5) * 0.5);
    }

    // Products with more reviews get higher score
    if (product.review_count) {
        score *= (1 + Math.min(product.review_count / 100, 0.5));
    }

    // Products with more views get higher score
    if (product.view_count) {
        score *= (1 + Math.min(product.view_count / 1000, 0.3));
    }

    // Products in stock get higher score
    if (product.stock_quantity > 0) {
        score *= 1.2;
    }

    return parseFloat(score.toFixed(2));
};

// Bulk index products
const bulkIndexProducts = async (products) => {
    try {
        if (!products || products.length === 0) {
            return { indexed: 0, errors: [] };
        }

        const operations = [];
        
        products.forEach(product => {
            const finalPrice = product.sale_price || product.price;
            const discountPercentage = product.sale_price 
                ? Math.round(((product.price - product.sale_price) / product.price) * 100)
                : 0;

            const boostScore = calculateBoostScore(product);

            operations.push({
                index: {
                    _index: PRODUCT_INDEX,
                    _id: product.id
                }
            });

            operations.push({
                ...product,
                final_price: finalPrice,
                discount_percentage: discountPercentage,
                boost_score: boostScore,
                view_count: product.view_count || 0,
                purchase_count: product.purchase_count || 0
            });
        });

        const response = await client.bulk({
            body: operations
        });

        const errors = response.items.filter(item => item.index.error);
        
        return {
            indexed: products.length - errors.length,
            errors: errors
        };
    } catch (error) {
        console.error('Error bulk indexing products:', error);
        throw error;
    }
};

// Delete product from index
const deleteProduct = async (productId) => {
    try {
        const response = await client.delete({
            index: PRODUCT_INDEX,
            id: productId
        });
        return response;
    } catch (error) {
        if (error.meta && error.meta.statusCode === 404) {
            // Document not found, which is fine
            return null;
        }
        console.error('Error deleting product from index:', error);
        throw error;
    }
};

// Update product in index
const updateProduct = async (productId, updateData) => {
    try {
        const finalPrice = updateData.sale_price || updateData.price;
        const discountPercentage = updateData.sale_price 
            ? Math.round(((updateData.price - updateData.sale_price) / updateData.price) * 100)
            : 0;

        const boostScore = calculateBoostScore(updateData);

        const doc = {
            ...updateData,
            final_price: finalPrice,
            discount_percentage: discountPercentage,
            boost_score: boostScore
        };

        const response = await client.update({
            index: PRODUCT_INDEX,
            id: productId,
            body: {
                doc: doc
            }
        });

        return response;
    } catch (error) {
        console.error('Error updating product in index:', error);
        throw error;
    }
};

// Initialize Elasticsearch
const initializeElasticsearch = async () => {
    try {
        console.log('Initializing Elasticsearch...');
        
        const connected = await testConnection();
        if (!connected) {
            console.warn('⚠️ Elasticsearch not available - search features will be disabled');
            console.warn('To enable search: make sure Elasticsearch is running on http://localhost:9200');
            return false;
        }

        await createProductIndex();
        
        console.log('✓ Elasticsearch initialized successfully');
        return true;
    } catch (error) {
        console.warn('⚠️ Elasticsearch initialization failed:', error.message);
        console.warn('⚠️ Application will continue without search features');
        return false;
    }
};

module.exports = {
    client,
    PRODUCT_INDEX,
    testConnection,
    createProductIndex,
    recreateProductIndex,
    indexProduct,
    bulkIndexProducts,
    deleteProduct,
    updateProduct,
    initializeElasticsearch,
    calculateBoostScore
};
