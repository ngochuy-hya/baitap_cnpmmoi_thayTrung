import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Spin, Alert, Button, Empty, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import ProductCard from './ProductCard';
import { productAPI } from '../utils/api';

const ProductList = ({
  categorySlug = null,
  searchQuery = '',
  filters = {},
  pageSize = 12,
  gridCols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 5 },
  showLoadMore = false, // true for button load more, false for infinite scroll
  onProductClick,
  onAddToCart
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Reset data when filters change
  useEffect(() => {
    setProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    loadProducts(1, true);
  }, [categorySlug, searchQuery, JSON.stringify(filters)]);

  // Load products function
  const loadProducts = useCallback(async (page = 1, reset = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);

      const params = {
        page,
        limit: pageSize,
        ...filters
      };

      // Add search query if provided
      if (searchQuery) {
        params.search = searchQuery;
      }

      let response;
      
      if (categorySlug) {
        // Load products by category
        response = await productAPI.getProductsByCategory(categorySlug, params);
      } else if (searchQuery) {
        // Search products
        response = await productAPI.searchProducts(searchQuery, params);
      } else {
        // Load all products
        response = await productAPI.getProducts(params);
      }

      if (response.success) {
        const newProducts = response.data.products || [];
        const pagination = response.data.pagination || {};

        if (reset || page === 1) {
          setProducts(newProducts);
        } else {
          setProducts(prev => [...prev, ...newProducts]);
        }

        setTotalProducts(pagination.total_records || 0);
        setHasMore(pagination.has_next || false);
        setCurrentPage(page);
      } else {
        throw new Error(response.message || 'Failed to load products');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải sản phẩm');
      
      if (page === 1) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [categorySlug, searchQuery, filters, pageSize]);

  // Load more products
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadProducts(currentPage + 1, false);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    loadProducts(1, true);
  };

  // Handle add to cart
  const handleAddToCart = useCallback((product) => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      // Default add to cart behavior
      message.success(`Đã thêm "${product.name}" vào giỏ hàng`);
    }
  }, [onAddToCart]);

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <Row gutter={[16, 16]}>
      {Array.from({ length: pageSize }).map((_, index) => (
        <Col key={index} {...gridCols}>
          <ProductCard loading={true} />
        </Col>
      ))}
    </Row>
  );

  // Render error state
  const renderError = () => (
    <Alert
      message="Lỗi tải dữ liệu"
      description={error}
      type="error"
      showIcon
      action={
        <Button size="small" danger onClick={handleRetry}>
          <ReloadOutlined /> Thử lại
        </Button>
      }
      style={{ margin: '20px 0' }}
    />
  );

  // Render empty state
  const renderEmpty = () => (
    <Empty
      description={
        searchQuery 
          ? `Không tìm thấy sản phẩm cho "${searchQuery}"`
          : categorySlug
            ? "Không có sản phẩm trong danh mục này"
            : "Không có sản phẩm nào"
      }
      style={{ margin: '40px 0' }}
    />
  );

  // Render load more button
  const renderLoadMoreButton = () => (
    <div style={{ textAlign: 'center', marginTop: 24 }}>
      <Button
        type="primary"
        loading={loadingMore}
        onClick={loadMore}
        disabled={!hasMore}
        size="large"
      >
        {loadingMore ? 'Đang tải...' : hasMore ? 'Tải thêm sản phẩm' : 'Đã tải hết'}
      </Button>
    </div>
  );

  // Loading state
  if (loading && products.length === 0) {
    return renderLoadingSkeleton();
  }

  // Error state
  if (error && products.length === 0) {
    return renderError();
  }

  // Empty state
  if (!loading && products.length === 0) {
    return renderEmpty();
  }

  // Main render
  const content = (
    <Row gutter={[16, 16]}>
      {products.map((product, index) => (
        <Col key={`${product.id}-${index}`} {...gridCols}>
          <ProductCard
            product={product}
            onAddToCart={handleAddToCart}
            onClick={onProductClick}
          />
        </Col>
      ))}
    </Row>
  );

  return (
    <div className="product-list">
      {/* Products count info */}
      {totalProducts > 0 && (
        <div style={{ 
          marginBottom: 16, 
          color: '#666',
          fontSize: '14px'
        }}>
          Hiển thị {products.length} / {totalProducts} sản phẩm
          {searchQuery && (
            <span> cho từ khóa "<strong>{searchQuery}</strong>"</span>
          )}
        </div>
      )}

      {showLoadMore ? (
        // Button load more mode
        <div>
          {content}
          {hasMore && renderLoadMoreButton()}
        </div>
      ) : (
        // Infinite scroll mode
        <InfiniteScroll
          dataLength={products.length}
          next={loadMore}
          hasMore={hasMore}
          loader={
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="large" />
              <div style={{ marginTop: 8, color: '#666' }}>
                Đang tải thêm sản phẩm...
              </div>
            </div>
          }
          endMessage={
            products.length > 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px',
                color: '#999',
                borderTop: '1px solid #f0f0f0',
                marginTop: '20px'
              }}>
                🎉 Bạn đã xem hết tất cả sản phẩm!
              </div>
            )
          }
          scrollThreshold={0.8}
          style={{ overflow: 'visible' }}
        >
          {content}
        </InfiniteScroll>
      )}

      {/* Error alert for loading more */}
      {error && products.length > 0 && (
        <Alert
          message="Lỗi tải thêm sản phẩm"
          description={error}
          type="warning"
          showIcon
          closable
          style={{ marginTop: 16 }}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
};

export default ProductList;
