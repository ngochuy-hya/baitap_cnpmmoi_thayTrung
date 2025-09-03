import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Row, 
  Col, 
  Typography, 
  Card,
  Select,
  Slider,
  Checkbox,
  Button,
  Space,
  Breadcrumb,
  Drawer,
  Badge
} from 'antd';
import { 
  FilterOutlined,
  AppstoreOutlined,
  BarsOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import ProductList from '../components/ProductList';
import { categoryAPI, formatCurrency } from '../utils/api';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams();
  
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    sort_by: searchParams.get('sort_by') || 'created_at',
    sort_order: searchParams.get('sort_order') || 'DESC',
    min_price: searchParams.get('min_price') ? parseInt(searchParams.get('min_price')) : null,
    max_price: searchParams.get('max_price') ? parseInt(searchParams.get('max_price')) : null,
    is_featured: searchParams.get('featured') === 'true' || null,
  });

  // Price range
  const [priceRange, setPriceRange] = useState([
    filters.min_price || 0,
    filters.max_price || 100000000
  ]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (categorySlug) {
      loadCategoryDetail();
    } else {
      setCurrentCategory(null);
    }
  }, [categorySlug]);

  // Update filters from URL params
  useEffect(() => {
    const newFilters = {
      search: searchParams.get('search') || '',
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order: searchParams.get('sort_order') || 'DESC',
      min_price: searchParams.get('min_price') ? parseInt(searchParams.get('min_price')) : null,
      max_price: searchParams.get('max_price') ? parseInt(searchParams.get('max_price')) : null,
      is_featured: searchParams.get('featured') === 'true' || null,
    };
    
    setFilters(newFilters);
    setPriceRange([
      newFilters.min_price || 0,
      newFilters.max_price || 100000000
    ]);
  }, [searchParams]);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getRootCategories();
      if (response.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadCategoryDetail = async () => {
    try {
      const response = await categoryAPI.getCategoryDetail(categorySlug);
      if (response.success) {
        setCurrentCategory(response.data.category);
      }
    } catch (error) {
      console.error('Error loading category:', error);
      setCurrentCategory(null);
    }
  };

  // Update URL params
  const updateUrlParams = (newFilters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, value.toString());
      }
    });
    
    setSearchParams(params);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  // Handle price range change
  const handlePriceRangeChange = (range) => {
    setPriceRange(range);
    const newFilters = {
      ...filters,
      min_price: range[0] > 0 ? range[0] : null,
      max_price: range[1] < 100000000 ? range[1] : null
    };
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const newFilters = {
      search: filters.search, // Keep search query
      sort_by: 'created_at',
      sort_order: 'DESC',
      min_price: null,
      max_price: null,
      is_featured: null,
    };
    setFilters(newFilters);
    setPriceRange([0, 100000000]);
    updateUrlParams(newFilters);
  };

  // Render filter sidebar
  const renderFilters = () => (
    <div style={{ padding: '0 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16 
        }}>
          <Title level={5} style={{ margin: 0 }}>
            Bộ lọc
          </Title>
          <Button type="text" size="small" onClick={clearFilters}>
            Xóa bộ lọc
          </Button>
        </div>
      </div>

      {/* Categories Filter */}
      <Card size="small" title="Danh mục" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Link to="/products">
            <Button 
              type={!categorySlug ? "primary" : "text"} 
              block 
              style={{ textAlign: 'left' }}
            >
              Tất cả sản phẩm
            </Button>
          </Link>
          {categories.map(category => (
            <Link key={category.id} to={`/products/category/${category.slug}`}>
              <Button
                type={categorySlug === category.slug ? "primary" : "text"}
                block
                style={{ textAlign: 'left' }}
              >
                {category.name}
                {category.product_count > 0 && (
                  <Badge
                    count={category.product_count}
                    style={{ marginLeft: 8 }}
                    size="small"
                  />
                )}
              </Button>
            </Link>
          ))}
        </Space>
      </Card>

      {/* Price Range Filter */}
      <Card size="small" title="Khoảng giá" style={{ marginBottom: 16 }}>
        <div style={{ padding: '0 8px' }}>
          <Slider
            range
            min={0}
            max={100000000}
            step={100000}
            value={priceRange}
            onChange={setPriceRange}
            onAfterChange={handlePriceRangeChange}
            tooltip={{
              formatter: (value) => formatCurrency(value)
            }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: 8,
            fontSize: '12px',
            color: '#666'
          }}>
            <span>{formatCurrency(priceRange[0])}</span>
            <span>{formatCurrency(priceRange[1])}</span>
          </div>
        </div>
      </Card>

      {/* Featured Filter */}
      <Card size="small" title="Khác" style={{ marginBottom: 16 }}>
        <Space direction="vertical">
          <Checkbox
            checked={filters.is_featured === true}
            onChange={(e) => handleFilterChange('is_featured', e.target.checked || null)}
          >
            Sản phẩm nổi bật
          </Checkbox>
        </Space>
      </Card>
    </div>
  );

  // Get grid columns based on view mode
  const getGridCols = () => {
    if (viewMode === 'list') {
      return { xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 };
    }
    return { xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 };
  };

  // Get breadcrumb items
  const getBreadcrumbItems = () => {
    const items = [
      {
        title: <Link to="/"><HomeOutlined /> Trang chủ</Link>
      },
      {
        title: <Link to="/products">Sản phẩm</Link>
      }
    ];

    if (currentCategory) {
      items.push({
        title: currentCategory.name
      });
    }

    return items;
  };

  return (
    <Layout style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#f5f5f5' }}>
      {/* Desktop Sidebar */}
      <Sider 
        width={280} 
        style={{ 
          backgroundColor: '#fff',
          display: 'none'
        }}
        className="desktop-filter-sidebar"
      >
        {renderFilters()}
      </Sider>

      <Layout>
        <Content style={{ padding: '20px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          {/* Breadcrumb */}
          <Breadcrumb items={getBreadcrumbItems()} style={{ marginBottom: 16 }} />

          {/* Page Header */}
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0 }}>
              {currentCategory ? currentCategory.name : 'Tất cả sản phẩm'}
            </Title>
            {currentCategory?.description && (
              <Text type="secondary">{currentCategory.description}</Text>
            )}
          </div>

          {/* Toolbar */}
          <Card style={{ marginBottom: 20 }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  {/* Mobile Filter Button */}
                  <Button
                    icon={<FilterOutlined />}
                    onClick={() => setFilterVisible(true)}
                    className="mobile-filter-button"
                  >
                    Bộ lọc
                  </Button>
                  
                  {/* Sort Options */}
                  <Select
                    value={`${filters.sort_by}_${filters.sort_order}`}
                    onChange={(value) => {
                      const [sort_by, sort_order] = value.split('_');
                      handleFilterChange('sort_by', sort_by);
                      handleFilterChange('sort_order', sort_order);
                    }}
                    style={{ width: 180 }}
                  >
                    <Option value="created_at_DESC">Mới nhất</Option>
                    <Option value="created_at_ASC">Cũ nhất</Option>
                    <Option value="price_ASC">Giá thấp đến cao</Option>
                    <Option value="price_DESC">Giá cao đến thấp</Option>
                    <Option value="name_ASC">Tên A-Z</Option>
                    <Option value="name_DESC">Tên Z-A</Option>
                    <Option value="average_rating_DESC">Đánh giá cao nhất</Option>
                  </Select>
                </Space>
              </Col>
              
              <Col>
                <Space>
                  {/* View Mode Toggle */}
                  <Button.Group>
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
                  </Button.Group>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Products List */}
          <ProductList
            categorySlug={categorySlug}
            searchQuery={filters.search}
            filters={{
              sort_by: filters.sort_by,
              sort_order: filters.sort_order,
              min_price: filters.min_price,
              max_price: filters.max_price,
              is_featured: filters.is_featured,
            }}
            gridCols={getGridCols()}
            showLoadMore={false} // Use infinite scroll
          />
        </Content>
      </Layout>

      {/* Mobile Filter Drawer */}
      <Drawer
        title="Bộ lọc sản phẩm"
        placement="left"
        onClose={() => setFilterVisible(false)}
        open={filterVisible}
        width={280}
      >
        {renderFilters()}
      </Drawer>

      {/* Responsive CSS */}
      <style jsx>{`
        @media (min-width: 992px) {
          .desktop-filter-sidebar {
            display: block !important;
          }
          .mobile-filter-button {
            display: none !important;
          }
        }
        
        @media (max-width: 991px) {
          .mobile-filter-button {
            display: inline-flex !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Products;
