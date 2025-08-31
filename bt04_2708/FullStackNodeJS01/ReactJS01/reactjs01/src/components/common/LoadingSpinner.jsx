import React from 'react'
import { Spin } from 'antd'

const LoadingSpinner = ({ size = 'large', tip = 'Đang tải...' }) => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <Spin size={size} tip={tip} />
      </div>
    </div>
  )
}

export default LoadingSpinner