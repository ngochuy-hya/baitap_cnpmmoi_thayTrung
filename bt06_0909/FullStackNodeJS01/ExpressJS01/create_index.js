const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: 'http://localhost:9200'
});

async function createIndex() {
    try {
        console.log('🔧 Creating Elasticsearch index...');
        
        // Delete index if exists
        try {
            await client.indices.delete({ index: 'ecommerce_products' });
            console.log('🗑️ Deleted existing index');
        } catch (e) {
            console.log('ℹ️ No existing index to delete');
        }
        
        // Create new index
        await client.indices.create({
            index: 'ecommerce_products',
            body: {
                settings: {
                    number_of_shards: 1,
                    number_of_replicas: 0,
                    analysis: {
                        analyzer: {
                            vietnamese_analyzer: {
                                type: 'standard'
                            }
                        }
                    }
                },
                mappings: {
                    properties: {
                        id: { type: 'integer' },
                        name: { 
                            type: 'text',
                            analyzer: 'vietnamese_analyzer',
                            fields: {
                                keyword: { type: 'keyword' },
                                suggest: { type: 'completion' }
                            }
                        },
                        slug: { type: 'keyword' },
                        description: { 
                            type: 'text',
                            analyzer: 'vietnamese_analyzer'
                        },
                        short_description: { 
                            type: 'text',
                            analyzer: 'vietnamese_analyzer'
                        },
                        price: { type: 'double' },
                        sale_price: { type: 'double' },
                        final_price: { type: 'double' },
                        category_id: { type: 'integer' },
                        category_name: { 
                            type: 'text',
                            fields: { keyword: { type: 'keyword' } }
                        },
                        is_featured: { type: 'boolean' },
                        view_count: { type: 'integer' },
                        average_rating: { type: 'float' },
                        created_at: { type: 'date' }
                    }
                }
            }
        });
        
        console.log('✅ Index created successfully!');
        
        // Add a test document
        await client.index({
            index: 'ecommerce_products',
            id: '1',
            body: {
                id: 1,
                name: 'iPhone 15 Pro Max Test',
                description: 'Test product for search',
                price: 29999000,
                final_price: 29999000,
                category_name: 'Điện thoại',
                is_featured: true,
                view_count: 100
            }
        });
        
        console.log('📝 Test document added');
        
        // Wait for indexing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test search
        const result = await client.search({
            index: 'ecommerce_products',
            body: {
                query: { match_all: {} }
            }
        });
        
        console.log('🔍 Search test successful! Found:', result.hits.total.value, 'documents');
        console.log('🎉 Setup complete! Now you can test search features.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createIndex();
