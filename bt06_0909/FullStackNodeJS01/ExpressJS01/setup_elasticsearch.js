require('dotenv').config();
const { initializeElasticsearch } = require('./src/config/elasticsearch');
const ProductService = require('./src/services/productService');
const mysql = require('mysql2/promise');

async function setupElasticsearch() {
  try {
    console.log('🚀 Starting Elasticsearch setup...\n');

    // 1. Initialize Elasticsearch
    console.log('📦 Step 1: Initialize Elasticsearch...');
    const esInitialized = await initializeElasticsearch();
    
    if (!esInitialized) {
      throw new Error('Failed to initialize Elasticsearch');
    }
    console.log('✅ Elasticsearch initialized successfully\n');

    // 2. Test database connection
    console.log('📦 Step 2: Testing database connection...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ecommerce_db'
    });

    // Test connection
    await connection.ping();
    console.log('✅ Database connection successful\n');

    // 3. Check if the database has the required updates
    console.log('📦 Step 3: Checking database schema...');
    try {
      const [rows] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'products' 
        AND COLUMN_NAME IN ('view_count', 'purchase_count')
      `);

      if (rows.length < 2) {
        console.log('⚠️  Database schema needs to be updated. Please run the following SQL:');
        console.log('\n--- SQL Update Script ---');
        console.log('ALTER TABLE products ADD COLUMN view_count INT DEFAULT 0;');
        console.log('ALTER TABLE products ADD COLUMN purchase_count INT DEFAULT 0;');
        console.log('\nOr run the complete update script: database_update_views.sql');
        console.log('--- End SQL Script ---\n');
        throw new Error('Database schema is not up to date');
      }
      console.log('✅ Database schema is up to date\n');
    } catch (error) {
      if (error.message.includes('Database schema is not up to date')) {
        throw error;
      }
      console.log('⚠️  Could not verify database schema. Please make sure you have run the database update scripts.\n');
    }

    // 4. Sync products to Elasticsearch
    console.log('📦 Step 4: Syncing products to Elasticsearch...');
    const syncResult = await ProductService.syncAllProductsToElasticsearch();
    console.log(`✅ Synced ${syncResult.synced} products to Elasticsearch`);
    
    if (syncResult.errors && syncResult.errors.length > 0) {
      console.log(`⚠️  ${syncResult.errors.length} errors occurred during sync`);
      syncResult.errors.forEach((error, index) => {
        console.log(`   Error ${index + 1}: ${error.error || 'Unknown error'}`);
      });
    }
    console.log('');

    // 5. Test search functionality
    console.log('📦 Step 5: Testing search functionality...');
    
    try {
      // Test basic search
      const searchResult = await ProductService.searchProducts('phone', { limit: 3 });
      console.log(`✅ Basic search test passed - found ${searchResult.products?.length || 0} products`);
      
      // Test advanced search
      const advancedResult = await ProductService.advancedSearch({
        query: 'laptop',
        min_price: 1000000,
        sort_by: 'price',
        limit: 3
      });
      console.log(`✅ Advanced search test passed - found ${advancedResult.products?.length || 0} products`);
      
      // Test suggestions
      const suggestions = await ProductService.getSearchSuggestions('iphone', 5);
      console.log(`✅ Search suggestions test passed - found ${suggestions?.length || 0} suggestions`);
      
    } catch (searchError) {
      console.log('⚠️  Search functionality test failed:', searchError.message);
      console.log('This might be normal if you don\'t have Elasticsearch running or no products in database');
    }

    await connection.end();

    console.log('\n🎉 Elasticsearch setup completed successfully!\n');
    console.log('📋 What\'s configured:');
    console.log('   ✅ Elasticsearch connection and index');
    console.log('   ✅ Database schema updates');
    console.log('   ✅ Product data synchronization');
    console.log('   ✅ Search functionality');
    console.log('\n🔗 You can now:');
    console.log('   • Use fuzzy search with typo tolerance');
    console.log('   • Filter by multiple criteria');
    console.log('   • Get search suggestions');
    console.log('   • Track product views');
    console.log('   • See trending and popular products');
    console.log('\n📡 API Endpoints:');
    console.log('   GET /api/products/search?q=query');
    console.log('   GET /api/products/advanced-search');
    console.log('   GET /api/products/suggestions?q=query');
    console.log('   GET /api/products/popular');
    console.log('   GET /api/products/trending');
    console.log('\n🎯 Frontend:');
    console.log('   Visit /search or /advanced-search for the new UI');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Make sure Elasticsearch is running on http://localhost:9200');
    console.error('   2. Check your database connection settings in .env');
    console.error('   3. Run the database update script: database_update_views.sql');
    console.error('   4. Install Elasticsearch dependencies: npm install @elastic/elasticsearch');
    console.error('\n📚 For help, check the setup documentation or logs above.');
    process.exit(1);
  }
}

if (require.main === module) {
  setupElasticsearch();
}

module.exports = setupElasticsearch;
