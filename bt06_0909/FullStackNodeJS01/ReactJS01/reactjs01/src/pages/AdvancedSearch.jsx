import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Row, 
  Col, 
  Typography, 
  Card,
  Button,
  Space,
  Breadcrumb,
  Tabs,
  Result
} from 'antd';
import { 
  SearchOutlined,
  AppstoreOutlined,
  BarsOutlined,
  HomeOutlined,
  FireOutlined,
  EyeOutlined,
  StarOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useSearchParams, Link } from 'react-router-dom';
import ProductList from '../components/ProductList';
import AdvancedFilters from '../components/AdvancedFilters';
import { productAPI } from '../utils/api';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [activeTab, setActiveTab] = useState('search');
  const [viewMode, setViewMode] = useState('grid');

  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || searchParams.get('search') || '',
    category_id: searchParams.get('category_id') ? parseInt(searchParams.get('category_id')) : null,
    min_price: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')) : null,
    max_price: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')) : null,
    min_rating: searchParams.get('min_rating') ? parseFloat(searchParams.get('min_rating')) : null,
    is_featured: searchParams.get('featured') === 'true' ? true : null,
    in_stock_only: searchParams.get('in_stock') === 'true',
    on_sale_only: searchParams.get('on_sale') === 'true',
    tags: searchParams.get('tags') ? searchParams.get('tags').split(',') : [],
    sort_by: searchParams.get('sort_by') || 'relevance',
    sort_order: searchParams.get('sort_order') || 'DESC',
    view_count_min: searchParams.get('view_count_min') ? parseInt(searchParams.get('view_count_min')) : null,
  });

  useEffect(() => {
    // Perform search if there are initial search parameters
    if (filters.query || hasActiveFilters()) {
      handleSearch(filters);
    }
  }, []);

  const hasActiveFilters = () => {
    return (
      filters.category_id ||
      filters.min_price !== null ||
      filters.max_price !== null ||
      filters.min_rating !== null ||
      filters.is_featured !== null ||
      filters.in_stock_only ||
      filters.on_sale_only ||
      filters.tags?.length > 0 ||
      filters.view_count_min !== null
    );
  };

  const updateUrlParams = (newFilters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && value !== false) {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','));
        } else if (value !== false) {
          params.set(key, value.toString());
        }
      }
    });
    
    setSearchParams(params);
  };

  const handleSearch = async (searchFilters) => {
    setLoading(true);
    try {
      let response;
      
      if (activeTab === 'search') {
        response = await productAPI.advancedSearch({
          ...searchFilters,
          page: 1,
          limit: 20
        });
      } else if (activeTab === 'popular') {
        response = await productAPI.getPopularProducts({
          limit: 20,
          category_id: searchFilters.category_id
        });
      } else if (activeTab === 'trending') {
        response = await productAPI.getTrendingProducts({
          limit: 20,
          days: 7,
          category_id: searchFilters.category_id
        });
      } else if (activeTab === 'featured') {
        response = await productAPI.getProducts({
          ...searchFilters,
          is_featured: true,
          page: 1,
          limit: 20
        });
      }

      if (response?.success) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    updateUrlParams(newFilters);
    
    if (newFilters.query || hasActiveFiltersInObject(newFilters)) {
      handleSearch(newFilters);
    } else {
      setSearchResults(null);
    }
  };

  const hasActiveFiltersInObject = (filterObj) => {
    return (
      filterObj.category_id ||
      filterObj.min_price !== null ||
      filterObj.max_price !== null ||
      filterObj.min_rating !== null ||
      filterObj.is_featured !== null ||
      filterObj.in_stock_only ||
      filterObj.on_sale_only ||
      filterObj.tags?.length > 0 ||
      filterObj.view_count_min !== null
    );
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key !== 'search') {
      handleSearch(filters);
    }
  };

  const renderSearchResults = () => {
    if (!searchResults) {
      return (
        <Result
          icon={<SearchOutlined />}
          title="Sử dụng bộ lọc để tìm kiếm sản phẩm"
          subTitle="Nhập từ khóa hoặc chọn các tiêu chí lọc để bắt đầu tìm kiếm"
        />
      );
    }

    if (searchResults.products?.length === 0) {
      return (
        <Result
          title="Không tìm thấy sản phẩm"
          subTitle="Hãy thử thay đổi tiêu chí tìm kiếm hoặc bộ lọc"
          extra={
            <Button type="primary" onClick={() => setFilters({
              query: '',
              category_id: null,
              min_price: null,
              max_price: null,
              min_rating: null,
              is_featured: null,
              in_stock_only: false,
              on_sale_only: false,
              tags: [],
              sort_by: 'relevance',
              sort_order: 'DESC',
              view_count_min: null,
            })}>
              Xóa bộ lọc
            </Button>
          }
        />
      );
    }

    return (
      <div>
        {/* Search Results Summary */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Text strong>
                  Tìm thấy {searchResults.pagination?.total_records || searchResults.products?.length || 0} sản phẩm
                </Text>
                {filters.query && (
                  <Text type="secondary">
                    cho "{filters.query}"
                  </Text>
                )}
                {searchResults.query_info && (
                  <Text type="secondary">
                    (Thời gian: {searchResults.query_info.took}ms)
                  </Text>
                )}
              </Space>
            </Col>
            <Col>
              <Space>
                <Button
                  type={viewMode === 'grid' ? 'primary' : 'default'}
                  icon={<AppstoreOutlined />}
                  onClick={() => setViewMode('grid')}
                />
                <Button
                  type={viewMode === 'list' ? 'primary' : 'default'}
                  icon={<BarsOutlined />}
                  onClick={() => setViewMode('list')}
                />
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Search Suggestions */}
        {searchResults.suggestions?.name_suggestions?.length > 0 && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Text type="secondary">Có phải bạn muốn tìm: </Text>
            <Space wrap>
              {searchResults.suggestions.name_suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  type="link"
                  size="small"
                  onClick={() => handleFilterChange({ ...filters, query: suggestion.text })}
                >
                  {suggestion.text}
                </Button>
              ))}
            </Space>
          </Card>
        )}

        {/* Aggregations/Facets */}
        {searchResults.aggregations && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              {searchResults.aggregations.categories?.length > 0 && (
                <Col span={8}>
                  <Text strong>Danh mục:</Text>
                  <div style={{ marginTop: 8 }}>
                    {searchResults.aggregations.categories.slice(0, 5).map(cat => (
                      <div key={cat.key} style={{ marginBottom: 4 }}>
                        <Button
                          type="link"
                          size="small"
                          onClick={() => handleFilterChange({ 
                            ...filters, 
                            category_id: cat.key 
                          })}
                        >
                          {cat.key} ({cat.doc_count})
                        </Button>
                      </div>
                    ))}
                  </div>
                </Col>
              )}
              
              {searchResults.aggregations.price_stats && (
                <Col span={8}>
                  <Text strong>Thông tin giá:</Text>
                  <div style={{ marginTop: 8, fontSize: '12px' }}>
                    <div>Thấp nhất: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(searchResults.aggregations.price_stats.min)}</div>
                    <div>Cao nhất: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(searchResults.aggregations.price_stats.max)}</div>
                    <div>Trung bình: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(searchResults.aggregations.price_stats.avg)}</div>
                  </div>
                </Col>
              )}

              {searchResults.aggregations.avg_rating && (
                <Col span={8}>
                  <Text strong>Đánh giá trung bình:</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text>{searchResults.aggregations.avg_rating.toFixed(1)} ⭐</Text>
                  </div>
                </Col>
              )}
            </Row>
          </Card>
        )}

        {/* Products Grid */}
        <ProductList
          products={searchResults.products}
          loading={loading}
          gridCols={viewMode === 'grid' ? { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 } : { xs: 1 }}
          showLoadMore={false}
        />
      </div>
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'search') {
      return renderSearchResults();
    }

    return (
      <ProductList
        products={searchResults?.products || []}
        loading={loading}
        gridCols={viewMode === 'grid' ? { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 } : { xs: 1 }}
        showLoadMore={false}
      />
    );
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ padding: '24px' }}>
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: 24 }}>
          <Breadcrumb.Item>
            <Link to="/">
              <HomeOutlined /> Trang chủ
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/products">Sản phẩm</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Tìm kiếm nâng cao</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={24}>
          {/* Filters Sidebar */}
          <Col xs={24} lg={6}>
            <AdvancedFilters
              onSearch={handleFilterChange}
              onFilterChange={handleFilterChange}
              loading={loading}
              initialFilters={filters}
              showQuickFilters={true}
              compact={false}
            />
          </Col>

          {/* Main Content */}
          <Col xs={24} lg={18}>
            <Card>
              <Title level={3}>
                <SearchOutlined /> Tìm kiếm nâng cao
              </Title>
              
              <Tabs activeKey={activeTab} onChange={handleTabChange}>
                <TabPane 
                  tab={
                    <span>
                      <SearchOutlined />
                      Tìm kiếm
                    </span>
                  } 
                  key="search"
                >
                  {renderTabContent()}
                </TabPane>
                
                <TabPane 
                  tab={
                    <span>
                      <EyeOutlined />
                      Phổ biến
                    </span>
                  } 
                  key="popular"
                >
                  {renderTabContent()}
                </TabPane>
                
                <TabPane 
                  tab={
                    <span>
                      <FireOutlined />
                      Xu hướng
                    </span>
                  } 
                  key="trending"
                >
                  {renderTabContent()}
                </TabPane>
                
                <TabPane 
                  tab={
                    <span>
                      <StarOutlined />
                      Nổi bật
                    </span>
                  } 
                  key="featured"
                >
                  {renderTabContent()}
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default AdvancedSearch;
