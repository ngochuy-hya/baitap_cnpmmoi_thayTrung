const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: 'http://localhost:9200'
});

async function testElasticsearch() {
    try {
        console.log('🔍 Testing Elasticsearch connection...');
        
        // Test connection
        const info = await client.info();
        console.log('✅ Connection successful:', info.version.number);
        
        // Test index creation
        console.log('📦 Creating test index...');
        const indexExists = await client.indices.exists({ index: 'test-index' });
        
        if (!indexExists) {
            await client.indices.create({
                index: 'test-index',
                body: {
                    mappings: {
                        properties: {
                            title: { type: 'text' },
                            content: { type: 'text' }
                        }
                    }
                }
            });
            console.log('✅ Test index created');
        } else {
            console.log('✅ Test index already exists');
        }
        
        // Test document indexing
        console.log('📝 Testing document indexing...');
        await client.index({
            index: 'test-index',
            id: '1',
            body: {
                title: 'Test Document',
                content: 'This is a test document for Elasticsearch'
            }
        });
        console.log('✅ Document indexed');
        
        // Wait for indexing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test search
        console.log('🔍 Testing search...');
        const searchResult = await client.search({
            index: 'test-index',
            body: {
                query: {
                    match: {
                        content: 'test'
                    }
                }
            }
        });
        
        console.log('✅ Search successful, found:', searchResult.hits.total.value, 'documents');
        
        // Cleanup
        await client.indices.delete({ index: 'test-index' });
        console.log('🗑️ Test index deleted');
        
        console.log('\n🎉 Elasticsearch is working perfectly!');
        console.log('Now you can run: npm run setup-elasticsearch');
        
    } catch (error) {
        console.error('❌ Elasticsearch test failed:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('1. Make sure Elasticsearch is running on http://localhost:9200');
        console.error('2. Check if you can access http://localhost:9200 in browser');
        console.error('3. Try restarting Elasticsearch');
        
        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 Elasticsearch seems to be down. Start it with:');
            console.error('   elasticsearch.bat (from C:\\elasticsearch-9.1.3\\bin)');
        }
    }
}

testElasticsearch();
