import React, { useState, useEffect, useRef } from 'react';
import { Input, List, Typography, Space, Tag, Spin, AutoComplete } from 'antd';
import { SearchOutlined, ShoppingOutlined, TagOutlined } from '@ant-design/icons';
import { productAPI, debounce } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const SearchSuggestions = ({ 
  placeholder = "Tìm kiếm sản phẩm...",
  onSearch,
  onSelect,
  style,
  size = "middle",
  autoFocus = false,
  showPopular = true
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');
  const [popularTerms, setPopularTerms] = useState({ categories: [], tags: [] });
  const navigate = useNavigate();

  // Debounced search function
  const debouncedGetSuggestions = useRef(
    debounce(async (searchText) => {
      if (!searchText || searchText.length < 2) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await productAPI.getSearchSuggestions(searchText);
        if (response.success) {
          const suggestions = response.data || [];
          
          // Format suggestions for AutoComplete
          const formattedOptions = suggestions.map((suggestion, index) => ({
            value: suggestion.text,
            label: (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  {suggestion.type === 'product' ? (
                    <ShoppingOutlined style={{ color: '#1890ff' }} />
                  ) : (
                    <SearchOutlined style={{ color: '#52c41a' }} />
                  )}
                  <Text>{suggestion.text}</Text>
                  {suggestion.category && (
                    <Tag size="small" color="blue">{suggestion.category}</Tag>
                  )}
                </Space>
                {suggestion.type === 'product' && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>Sản phẩm</Text>
                )}
              </div>
            ),
            data: suggestion
          }));

          setOptions(formattedOptions);
        }
      } catch (error) {
        console.error('Error getting search suggestions:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300)
  ).current;

  useEffect(() => {
    if (showPopular) {
      loadPopularTerms();
    }
  }, [showPopular]);

  const loadPopularTerms = async () => {
    try {
      const response = await productAPI.getPopularSearchTerms();
      if (response.success) {
        setPopularTerms(response.data);
      }
    } catch (error) {
      console.error('Error loading popular terms:', error);
    }
  };

  const handleSearch = (searchText) => {
    if (searchText.trim()) {
      setValue(searchText);
      if (onSearch) {
        onSearch(searchText.trim());
      } else {
        // Default behavior: navigate to products page with search
        navigate(`/products?search=${encodeURIComponent(searchText.trim())}`);
      }
    }
  };

  const handleSelect = (selectedValue, option) => {
    setValue(selectedValue);
    
    if (onSelect) {
      onSelect(selectedValue, option.data);
    } else if (option.data?.type === 'product' && option.data?.slug) {
      // Navigate directly to product detail
      navigate(`/products/${option.data.slug}`);
    } else {
      // Search for the selected term
      handleSearch(selectedValue);
    }
  };

  const handleInputChange = (searchText) => {
    setValue(searchText);
    
    if (searchText.length >= 2) {
      debouncedGetSuggestions(searchText);
    } else {
      setOptions([]);
      
      // Show popular terms when input is empty or too short
      if (showPopular && searchText.length === 0) {
        showPopularSuggestions();
      }
    }
  };

  const showPopularSuggestions = () => {
    const popularOptions = [];
    
    // Add popular categories
    if (popularTerms.categories?.length > 0) {
      popularOptions.push({
        value: '',
        label: <Text strong style={{ color: '#1890ff' }}>Danh mục phổ biến</Text>,
        disabled: true
      });
      
      popularTerms.categories.slice(0, 5).forEach(category => {
        popularOptions.push({
          value: category.key,
          label: (
            <div style={{ paddingLeft: 16 }}>
              <Space>
                <TagOutlined style={{ color: '#52c41a' }} />
                <Text>{category.key}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  ({category.doc_count} sản phẩm)
                </Text>
              </Space>
            </div>
          )
        });
      });
    }
    
    // Add popular tags
    if (popularTerms.tags?.length > 0) {
      if (popularOptions.length > 0) {
        popularOptions.push({
          value: '',
          label: <div style={{ height: 8 }} />,
          disabled: true
        });
      }
      
      popularOptions.push({
        value: '',
        label: <Text strong style={{ color: '#fa8c16' }}>Từ khóa phổ biến</Text>,
        disabled: true
      });
      
      popularTerms.tags.slice(0, 5).forEach(tag => {
        popularOptions.push({
          value: tag.key,
          label: (
            <div style={{ paddingLeft: 16 }}>
              <Space>
                <TagOutlined style={{ color: '#fa8c16' }} />
                <Text>{tag.key}</Text>
              </Space>
            </div>
          )
        });
      });
    }
    
    setOptions(popularOptions);
  };

  const handleFocus = () => {
    if (showPopular && value.length === 0) {
      showPopularSuggestions();
    }
  };

  const handleBlur = () => {
    // Delay hiding options to allow for selection
    setTimeout(() => {
      if (value.length === 0) {
        setOptions([]);
      }
    }, 150);
  };

  return (
    <AutoComplete
      style={{ width: '100%', ...style }}
      options={options}
      value={value}
      onChange={handleInputChange}
      onSelect={handleSelect}
      onFocus={handleFocus}
      onBlur={handleBlur}
      notFoundContent={loading ? <Spin size="small" /> : null}
      placeholder={placeholder}
      size={size}
      autoFocus={autoFocus}
      allowClear
      filterOption={false} // We handle filtering ourselves
    >
      <Input.Search
        placeholder={placeholder}
        enterButton={<SearchOutlined />}
        onSearch={handleSearch}
        loading={loading}
        size={size}
      />
    </AutoComplete>
  );
};

export default SearchSuggestions;