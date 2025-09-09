-- Update database schema to add view tracking and other features for Elasticsearch

USE ecommerce_db_bt06;

-- Add view count and purchase count to products table
ALTER TABLE products 
ADD COLUMN view_count INT DEFAULT 0 AFTER meta_description,
ADD COLUMN purchase_count INT DEFAULT 0 AFTER view_count;

-- Create indexes for better performance
CREATE INDEX idx_products_view_count ON products(view_count);
CREATE INDEX idx_products_purchase_count ON products(purchase_count);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_sale_price ON products(sale_price);

-- Create table for product views tracking (for analytics)
CREATE TABLE product_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for product views
CREATE INDEX idx_product_views_product ON product_views(product_id);
CREATE INDEX idx_product_views_user ON product_views(user_id);
CREATE INDEX idx_product_views_date ON product_views(created_at);
CREATE INDEX idx_product_views_ip ON product_views(ip_address);

-- Create table for product tags (for better categorization)
CREATE TABLE product_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    tag_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create indexes for product tags
CREATE INDEX idx_product_tags_product ON product_tags(product_id);
CREATE INDEX idx_product_tags_name ON product_tags(tag_name);

-- Update existing products with random view counts for testing
UPDATE products SET 
    view_count = FLOOR(RAND() * 5000) + 10,
    purchase_count = FLOOR(RAND() * 500) + 1
WHERE id > 0;

-- Insert some sample tags for products
INSERT INTO product_tags (product_id, tag_name) VALUES
(1, 'flagship'), (1, 'premium'), (1, 'camera'), (1, 'gaming'),
(2, 'flagship'), (2, 'premium'), (2, 's-pen'), (2, 'productivity'),
(3, 'laptop'), (3, 'apple'), (3, 'creative'), (3, 'professional'),
(4, 'laptop'), (4, 'ultrabook'), (4, 'business'), (4, 'portable'),
(5, 'tablet'), (5, 'apple'), (5, 'creative'), (5, 'drawing'),
(6, 'smartwatch'), (6, 'fitness'), (6, 'health'), (6, 'apple'),
(7, 'headphones'), (7, 'wireless'), (7, 'noise-cancelling'), (7, 'premium');
