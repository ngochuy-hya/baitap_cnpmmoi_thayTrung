import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Form, 
  Input, 
  Select, 
  Slider, 
  Switch, 
  Button, 
  Space, 
  Checkbox, 
  Rate, 
  Divider,
  Tag,
  InputNumber,
  Collapse,
  Typography,
  Badge
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  ClearOutlined,
  DownOutlined,
  UpOutlined
} from '@ant-design/icons';
import { categoryAPI, formatCurrency } from '../utils/api';

const { Option } = Select;
const { Search } = Input;
const { Text, Title } = Typography;
const { Panel } = Collapse;

const AdvancedFilters = ({ 
  onSearch, 
  onFilterChange, 
  loading = false,
  initialFilters = {},
  showQuickFilters = true,
  compact = false 
}) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
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
    ...initialFilters
  });

  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [filtersExpanded, setFiltersExpanded] = useState(!compact);

  // Popular tags (you can fetch this from API)
  const popularTags = [
    'flagship', 'premium', 'gaming', 'camera', 'wireless', 
    'fast-charging', 'waterproof', 'lightweight', 'professional',
    'budget-friendly', 'high-performance', 'portable'
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Độ liên quan' },
    { value: 'price', label: 'Giá' },
    { value: 'name', label: 'Tên A-Z' },
    { value: 'created_at', label: 'Mới nhất' },
    { value: 'view_count', label: 'Lượt xem' },
    { value: 'rating', label: 'Đánh giá' },
    { value: 'popularity', label: 'Phổ biến' }
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    updateActiveFiltersCount();
  }, [filters]);

  useEffect(() => {
    form.setFieldsValue(filters);
    if (priceRange[0] !== filters.min_price || priceRange[1] !== filters.max_price) {
      setPriceRange([filters.min_price || 0, filters.max_price || 100000000]);
    }
  }, [filters, form]);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getRootCategories();
      if (response.success) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const updateActiveFiltersCount = () => {
    let count = 0;
    
    if (filters.query) count++;
    if (filters.category_id) count++;
    if (filters.min_price !== null || filters.max_price !== null) count++;
    if (filters.min_rating !== null) count++;
    if (filters.is_featured !== null) count++;
    if (filters.in_stock_only) count++;
    if (filters.on_sale_only) count++;
    if (filters.tags?.length > 0) count++;
    if (filters.view_count_min !== null) count++;
    
    setActiveFiltersCount(count);
  };

  const handleSearch = (value) => {
    const newFilters = { ...filters, query: value };
    setFilters(newFilters);
    onSearch && onSearch(newFilters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange && onFilterChange(newFilters);
  };

  const handlePriceRangeChange = (range) => {
    setPriceRange(range);
    const newFilters = { 
      ...filters, 
      min_price: range[0] === 0 ? null : range[0],
      max_price: range[1] === 100000000 ? null : range[1]
    };
    setFilters(newFilters);
    onFilterChange && onFilterChange(newFilters);
  };

  const handleTagChange = (tag, checked) => {
    const newTags = checked 
      ? [...(filters.tags || []), tag]
      : (filters.tags || []).filter(t => t !== tag);
    
    handleFilterChange('tags', newTags);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
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
      view_count_min: null
    };
    
    setFilters(clearedFilters);
    setPriceRange([0, 100000000]);
    form.setFieldsValue(clearedFilters);
    onFilterChange && onFilterChange(clearedFilters);
  };

  const quickFilters = [
    { key: 'is_featured', label: 'Nổi bật', checked: filters.is_featured === true },
    { key: 'on_sale_only', label: 'Đang giảm giá', checked: filters.on_sale_only },
    { key: 'in_stock_only', label: 'Còn hàng', checked: filters.in_stock_only },
  ];

  const handleQuickFilterChange = (key) => {
    if (key === 'is_featured') {
      handleFilterChange('is_featured', filters.is_featured === true ? null : true);
    } else {
      handleFilterChange(key, !filters[key]);
    }
  };

  const filterContent = (
    <Card>
      <Form form={form} layout="vertical">
        {/* Search Input */}
        <Form.Item label="Tìm kiếm sản phẩm">
          <Search
            placeholder="Nhập tên sản phẩm, thương hiệu..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            onSearch={handleSearch}
            loading={loading}
            allowClear
            enterButton={<SearchOutlined />}
          />
        </Form.Item>

        {/* Quick Filters */}
        {showQuickFilters && (
          <Form.Item label="Bộ lọc nhanh">
            <Space wrap>
              {quickFilters.map(filter => (
                <Tag.CheckableTag
                  key={filter.key}
                  checked={filter.checked}
                  onChange={() => handleQuickFilterChange(filter.key)}
                >
                  {filter.label}
                </Tag.CheckableTag>
              ))}
            </Space>
          </Form.Item>
        )}

        <Row gutter={16}>
          {/* Category Filter */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Danh mục">
              <Select
                placeholder="Chọn danh mục"
                value={filters.category_id}
                onChange={(value) => handleFilterChange('category_id', value)}
                allowClear
              >
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Sort Options */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Sắp xếp theo">
              <Select
                value={`${filters.sort_by}-${filters.sort_order}`}
                onChange={(value) => {
                  const [sort_by, sort_order] = value.split('-');
                  handleFilterChange('sort_by', sort_by);
                  handleFilterChange('sort_order', sort_order);
                }}
              >
                {sortOptions.map(option => (
                  <React.Fragment key={option.value}>
                    <Option value={`${option.value}-DESC`}>
                      {option.label} (Cao đến thấp)
                    </Option>
                    <Option value={`${option.value}-ASC`}>
                      {option.label} (Thấp đến cao)
                    </Option>
                  </React.Fragment>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Rating Filter */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Đánh giá tối thiểu">
              <Select
                placeholder="Chọn đánh giá"
                value={filters.min_rating}
                onChange={(value) => handleFilterChange('min_rating', value)}
                allowClear
              >
                {[5, 4, 3, 2, 1].map(rating => (
                  <Option key={rating} value={rating}>
                    <Rate disabled defaultValue={rating} />
                    <span style={{ marginLeft: 8 }}>từ {rating} sao</span>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Price Range */}
        <Form.Item label={`Khoảng giá: ${formatCurrency(priceRange[0])} - ${formatCurrency(priceRange[1])}`}>
          <Slider
            range
            min={0}
            max={100000000}
            step={100000}
            value={priceRange}
            onChange={handlePriceRangeChange}
            tipFormatter={(value) => formatCurrency(value)}
          />
          <Row gutter={8} style={{ marginTop: 8 }}>
            <Col span={12}>
              <InputNumber
                placeholder="Giá từ"
                value={priceRange[0]}
                onChange={(value) => handlePriceRangeChange([value || 0, priceRange[1]])}
                formatter={value => formatCurrency(value)}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <InputNumber
                placeholder="Giá đến"
                value={priceRange[1]}
                onChange={(value) => handlePriceRangeChange([priceRange[0], value || 100000000])}
                formatter={value => formatCurrency(value)}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </Form.Item>

        {/* Tags Filter */}
        <Form.Item label="Thẻ sản phẩm">
          <div style={{ maxHeight: 120, overflowY: 'auto' }}>
            <Space wrap>
              {popularTags.map(tag => (
                <Checkbox
                  key={tag}
                  checked={(filters.tags || []).includes(tag)}
                  onChange={(e) => handleTagChange(tag, e.target.checked)}
                >
                  {tag}
                </Checkbox>
              ))}
            </Space>
          </div>
        </Form.Item>

        {/* Action Buttons */}
        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={() => onSearch && onSearch(filters)}
              loading={loading}
            >
              Tìm kiếm
            </Button>
            <Button 
              icon={<ClearOutlined />}
              onClick={clearAllFilters}
            >
              Xóa bộ lọc
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  if (compact) {
    return (
      <Card size="small">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button 
              type="text"
              icon={filtersExpanded ? <UpOutlined /> : <DownOutlined />}
              onClick={() => setFiltersExpanded(!filtersExpanded)}
            >
              <Badge count={activeFiltersCount} size="small">
                <FilterOutlined /> Bộ lọc
              </Badge>
            </Button>
            {activeFiltersCount > 0 && (
              <Button 
                type="link" 
                size="small"
                onClick={clearAllFilters}
              >
                Xóa tất cả
              </Button>
            )}
          </Space>
        </div>
        
        <Collapse 
          ghost 
          activeKey={filtersExpanded ? ['1'] : []}
          onChange={(keys) => setFiltersExpanded(keys.includes('1'))}
        >
          <Panel key="1" showArrow={false}>
            {filterContent}
          </Panel>
        </Collapse>
      </Card>
    );
  }

  return (
    <div>
      {activeFiltersCount > 0 && (
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Text type="secondary">
            Đang áp dụng {activeFiltersCount} bộ lọc
          </Text>
          <Button 
            type="link" 
            size="small"
            onClick={clearAllFilters}
          >
            Xóa tất cả
          </Button>
        </div>
      )}
      {filterContent}
    </div>
  );
};

export default AdvancedFilters;