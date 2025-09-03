import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Card, 
  Space,
  Carousel,
  Divider,
  Spin,
  Alert
} from 'antd';
import { 
  ArrowRightOutlined,
  FireOutlined,
  ClockCircleOutlined,
  TagOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { homeAPI, categoryAPI } from '../utils/api';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load data parallel để tối ưu performance
      const [homeResponse, categoriesResponse] = await Promise.all([
        homeAPI.getHomeData(),
        categoryAPI.getRootCategories()
      ]);

      if (homeResponse.success) {
        setFeaturedProducts(homeResponse.data.featured_products || []);
        setLatestProducts(homeResponse.data.latest_products || []);
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data.categories || []);
      }

    } catch (err) {
      console.error('Error loading home data:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu trang chủ');
    } finally {
      setLoading(false);
    }
  };

  // Hero Carousel
  const renderHeroSection = () => (
    <div style={{ marginBottom: 40 }}>
      <Carousel
        autoplay
        effect="fade"
        style={{ 
          backgroundColor: '#f5f5f5',
          borderRadius: 8,
          overflow: 'hidden'
        }}
      >
        <div>
          <div style={{
            height: 400,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            padding: '0 20px'
          }}>
            <div>
              <Title level={1} style={{ color: 'white', fontSize: '3rem', marginBottom: 16 }}>
                🛒 Chào mừng đến EcommerceShop
              </Title>
              <Paragraph style={{ color: 'white', fontSize: '1.2rem', marginBottom: 24 }}>
                Khám phá hàng ngàn sản phẩm chất lượng với giá tốt nhất
              </Paragraph>
              <Link to="/products">
                <Button type="primary" size="large" icon={<ArrowRightOutlined />}>
                  Khám phá ngay
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div>
          <div style={{
            height: 400,
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            padding: '0 20px'
          }}>
            <div>
              <Title level={1} style={{ color: 'white', fontSize: '3rem', marginBottom: 16 }}>
                🔥 Sale Khủng
              </Title>
              <Paragraph style={{ color: 'white', fontSize: '1.2rem', marginBottom: 24 }}>
                Giảm giá lên đến 50% cho tất cả sản phẩm
              </Paragraph>
              <Link to="/products?sale=true">
                <Button type="primary" size="large" icon={<TagOutlined />}>
                  Mua ngay
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div>
          <div style={{
            height: 400,
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            padding: '0 20px'
          }}>
            <div>
              <Title level={1} style={{ color: 'white', fontSize: '3rem', marginBottom: 16 }}>
                📱 Công nghệ mới nhất
              </Title>
              <Paragraph style={{ color: 'white', fontSize: '1.2rem', marginBottom: 24 }}>
                Cập nhật những xu hướng công nghệ mới nhất
              </Paragraph>
              <Link to="/products/category/dien-thoai">
                <Button type="primary" size="large" icon={<AppstoreOutlined />}>
                  Xem ngay
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Carousel>
    </div>
  );

  // Categories Section
  const renderCategoriesSection = () => (
    <div style={{ marginBottom: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2}>
          <AppstoreOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Danh mục sản phẩm
        </Title>
        <Paragraph type="secondary">
          Khám phá các danh mục sản phẩm đa dạng
        </Paragraph>
      </div>
      
      <Row gutter={[16, 16]}>
        {categories.slice(0, 6).map((category) => (
          <Col xs={12} sm={8} md={6} lg={4} key={category.id}>
            <Link to={`/products/category/${category.slug}`}>
              <Card
                hoverable
                style={{ textAlign: 'center', height: 120 }}
                bodyStyle={{ 
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  height: '100%'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: 8 }}>
                  📱
                </div>
                <Title level={5} style={{ margin: 0, fontSize: '14px' }}>
                  {category.name}
                </Title>
                {category.product_count > 0 && (
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                    {category.product_count} sản phẩm
                  </Paragraph>
                )}
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
      
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Link to="/categories">
          <Button type="default" icon={<ArrowRightOutlined />}>
            Xem tất cả danh mục
          </Button>
        </Link>
      </div>
    </div>
  );

  // Product Section
  const renderProductSection = (title, products, icon, link, color = '#1890ff') => (
    <div style={{ marginBottom: 40 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24 
      }}>
        <Title level={2} style={{ margin: 0 }}>
          {React.cloneElement(icon, { style: { marginRight: 8, color } })}
          {title}
        </Title>
        <Link to={link}>
          <Button type="text" icon={<ArrowRightOutlined />}>
            Xem tất cả
          </Button>
        </Link>
      </div>
      
      {products.length > 0 ? (
        <Row gutter={[16, 16]}>
          {products.slice(0, 8).map((product) => (
            <Col xs={12} sm={8} md={6} lg={6} xl={4} key={product.id}>
              <ProductCard 
                product={product}
                size="default"
              />
            </Col>
          ))}
        </Row>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Paragraph type="secondary">Chưa có sản phẩm nào</Paragraph>
        </div>
      )}
    </div>
  );

  // Stats Section
  const renderStatsSection = () => (
    <div style={{ 
      backgroundColor: '#f5f5f5',
      padding: '40px 0',
      marginBottom: 40,
      borderRadius: 8
    }}>
      <Row gutter={[32, 32]} justify="center">
        <Col xs={12} sm={6} md={6} lg={6}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ color: '#1890ff', margin: 0 }}>
              1000+
            </Title>
            <Paragraph type="secondary">Sản phẩm</Paragraph>
          </div>
        </Col>
        <Col xs={12} sm={6} md={6} lg={6}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ color: '#52c41a', margin: 0 }}>
              500+
            </Title>
            <Paragraph type="secondary">Khách hàng</Paragraph>
          </div>
        </Col>
        <Col xs={12} sm={6} md={6} lg={6}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ color: '#faad14', margin: 0 }}>
              99%
            </Title>
            <Paragraph type="secondary">Hài lòng</Paragraph>
          </div>
        </Col>
        <Col xs={12} sm={6} md={6} lg={6}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ color: '#f5222d', margin: 0 }}>
              24/7
            </Title>
            <Paragraph type="secondary">Hỗ trợ</Paragraph>
          </div>
        </Col>
      </Row>
    </div>
  );

  if (loading) {
    return (
      <Content style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#666' }}>
            Đang tải dữ liệu...
          </div>
        </div>
      </Content>
    );
  }

  if (error) {
    return (
      <Content style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={loadHomeData}>
              Thử lại
            </Button>
          }
        />
      </Content>
    );
  }

  return (
    <Content style={{ 
      padding: '20px',
      maxWidth: 1200,
      margin: '0 auto',
      minHeight: 'calc(100vh - 64px)'
    }}>
      {/* Hero Section */}
      {renderHeroSection()}
      
      {/* Categories Section */}
      {renderCategoriesSection()}
      
      {/* Featured Products */}
      {renderProductSection(
        'Sản phẩm nổi bật',
        featuredProducts,
        <FireOutlined />,
        '/products?featured=true',
        '#f5222d'
      )}
      
      <Divider />
      
      {/* Latest Products */}
      {renderProductSection(
        'Sản phẩm mới nhất',
        latestProducts,
        <ClockCircleOutlined />,
        '/products?sort=latest',
        '#52c41a'
      )}
      
      {/* Stats Section */}
      {renderStatsSection()}
      
      {/* CTA Section */}
      <div style={{
        backgroundColor: '#001529',
        color: 'white',
        padding: '40px',
        borderRadius: 8,
        textAlign: 'center',
        marginBottom: 40
      }}>
        <Title level={2} style={{ color: 'white', marginBottom: 16 }}>
          Bạn chưa tìm thấy sản phẩm ưng ý?
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 24 }}>
          Khám phá thêm hàng ngàn sản phẩm khác trong cửa hàng của chúng tôi
        </Paragraph>
        <Space>
          <Link to="/products">
            <Button type="primary" size="large" icon={<AppstoreOutlined />}>
              Xem tất cả sản phẩm
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="large" style={{ color: 'white', borderColor: 'white' }}>
              Liên hệ hỗ trợ
            </Button>
          </Link>
        </Space>
      </div>
    </Content>
  );
};

export default Home;
