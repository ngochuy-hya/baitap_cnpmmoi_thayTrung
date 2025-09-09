import React, { useState } from 'react';
import { Card, Button, Tag, Image, Typography, Space, Tooltip } from 'antd';
import { 
  ShoppingCartOutlined, 
  EyeOutlined, 
  HeartOutlined,
  StarFilled 
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatCurrency, calculateDiscount } from '../utils/api';

const { Meta } = Card;
const { Text, Title } = Typography;

const ProductCard = ({ 
  product, 
  loading = false, 
  size = 'default', // 'small', 'default', 'large'
  showQuickActions = true,
  onAddToCart,
  onToggleFavorite 
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);

  if (loading) {
    return (
      <Card
        hoverable
        loading={true}
        style={{ 
          width: '100%',
          height: size === 'small' ? 300 : size === 'large' ? 450 : 380 
        }}
      />
    );
  }

  const {
    id,
    name,
    slug,
    price,
    sale_price,
    featured_image,
    short_description,
    stock_quantity,
    is_featured,
    average_rating,
    review_count,
    category_name
  } = product;

  // Calculate discount percentage
  const discountPercent = calculateDiscount(price, sale_price);
  const currentPrice = sale_price || price;
  const isOnSale = sale_price && sale_price < price;
  const isOutOfStock = stock_quantity === 0;

  // Handle add to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setFavorited(!favorited);
    if (onToggleFavorite) {
      onToggleFavorite(product, !favorited);
    }
  };

  // Card actions
  const actions = showQuickActions ? [
    <Tooltip title="Xem chi tiết" key="view">
      <Link to={`/products/${slug}`}>
        <EyeOutlined style={{ fontSize: '16px' }} />
      </Link>
    </Tooltip>,
    
    <Tooltip title={favorited ? "Bỏ yêu thích" : "Yêu thích"} key="favorite">
      <HeartOutlined 
        style={{ 
          fontSize: '16px',
          color: favorited ? '#ff4d4f' : undefined 
        }}
        onClick={handleToggleFavorite}
      />
    </Tooltip>,
    
    <Tooltip title="Thêm vào giỏ hàng" key="cart">
      <ShoppingCartOutlined 
        style={{ fontSize: '16px' }}
        onClick={handleAddToCart}
      />
    </Tooltip>,
  ] : undefined;

  return (
    <Card
      hoverable
      style={{ 
        width: '100%',
        height: size === 'small' ? 300 : size === 'large' ? 450 : 380,
        position: 'relative'
      }}
      cover={
        <div style={{ 
          position: 'relative',
          height: size === 'small' ? 150 : size === 'large' ? 250 : 200,
          overflow: 'hidden'
        }}>
          <Link to={`/products/${slug}`}>
            <Image
              alt={name}
              src={featured_image}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              loading="lazy"
              onLoad={() => setImageLoading(false)}
              placeholder={
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  Loading...
                </div>
              }
            />
          </Link>
          
          {/* Badges */}
          <div style={{
            position: 'absolute',
            top: 8,
            left: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}>
            {is_featured && (
              <Tag color="gold" style={{ margin: 0, fontSize: '10px' }}>
                NỔI BẬT
              </Tag>
            )}
            
            {isOnSale && discountPercent > 0 && (
              <Tag color="red" style={{ margin: 0, fontSize: '10px' }}>
                -{discountPercent}%
              </Tag>
            )}
            
            {isOutOfStock && (
              <Tag color="default" style={{ margin: 0, fontSize: '10px' }}>
                HẾT HÀNG
              </Tag>
            )}
          </div>
        </div>
      }
      actions={actions}
    >
      <Link to={`/products/${slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
        <Meta
          title={
            <Title 
              level={size === 'small' ? 5 : 4} 
              ellipsis={{ rows: 2 }}
              style={{ 
                margin: 0,
                fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
                fontWeight: 500
              }}
            >
              {name}
            </Title>
          }
          description={
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {/* Category */}
              {category_name && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {category_name}
                </Text>
              )}
              
              {/* Description */}
              {short_description && size !== 'small' && (
                <Text 
                  ellipsis={{ rows: 2 }}
                  style={{ 
                    fontSize: '13px',
                    color: '#666',
                    lineHeight: '1.4'
                  }}
                >
                  {short_description}
                </Text>
              )}
              
              {/* Rating */}
              {average_rating > 0 && (
                <Space size="small">
                  <StarFilled style={{ color: '#faad14', fontSize: '12px' }} />
                  <Text style={{ fontSize: '12px' }}>
                    {average_rating.toFixed(1)}
                  </Text>
                  {review_count > 0 && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      ({review_count} đánh giá)
                    </Text>
                  )}
                </Space>
              )}
              
              {/* Price */}
              <Space direction="vertical" size={0} style={{ width: '100%' }}>
                <Space size="small" align="baseline">
                  <Text 
                    strong 
                    style={{ 
                      fontSize: size === 'small' ? '16px' : '18px',
                      color: '#d32f2f'
                    }}
                  >
                    {formatCurrency(currentPrice)}
                  </Text>
                  
                  {isOnSale && (
                    <Text 
                      delete 
                      type="secondary"
                      style={{ fontSize: '14px' }}
                    >
                      {formatCurrency(price)}
                    </Text>
                  )}
                </Space>
                
                {/* Stock status */}
                <Text 
                  style={{ 
                    fontSize: '12px',
                    color: isOutOfStock ? '#ff4d4f' : stock_quantity <= 10 ? '#faad14' : '#52c41a'
                  }}
                >
                  {isOutOfStock 
                    ? 'Hết hàng' 
                    : stock_quantity <= 10 
                      ? `Chỉ còn ${stock_quantity} sản phẩm`
                      : 'Còn hàng'
                  }
                </Text>
              </Space>
            </Space>
          }
        />
      </Link>
      
      {/* Quick Add to Cart Button */}
      {showQuickActions && (
        <div style={{
          position: 'absolute',
          bottom: 60,
          left: 8,
          right: 8,
          opacity: 0,
          transition: 'opacity 0.3s ease'
        }}
        className="quick-actions"
        >
          <Button
            type="primary"
            block
            icon={<ShoppingCartOutlined />}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            size="small"
          >
            {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
          </Button>
        </div>
      )}
      
      {/* Hover effect CSS */}
      <style jsx>{`
        .ant-card:hover .quick-actions {
          opacity: 1;
        }
      `}</style>
    </Card>
  );
};

export default ProductCard;
