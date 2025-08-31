import React, { useState, useRef, useEffect } from 'react'
import { Input } from 'antd'
import './OTPInput.css'

const OTPInput = ({ length = 6, value = '', onChange, onComplete, disabled = false }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''))
  const inputRefs = useRef([])

  useEffect(() => {
    if (value) {
      const otpArray = value.split('').slice(0, length)
      const newOtp = [...otpArray, ...new Array(length - otpArray.length).fill('')]
      setOtp(newOtp)
    }
  }, [value, length])

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (element, index) => {
    if (isNaN(element.target.value)) return false

    const newOtp = [...otp.map((d, idx) => (idx === index ? element.target.value : d))]
    setOtp(newOtp)

    const otpValue = newOtp.join('')
    onChange && onChange(otpValue)

    // Focus next input
    if (element.target.value && index < length - 1) {
      inputRefs.current[index + 1].focus()
    }

    // Check if OTP is complete
    if (otpValue.length === length && !otpValue.includes('')) {
      onComplete && onComplete(otpValue)
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current input is empty and backspace is pressed, focus previous input
        inputRefs.current[index - 1].focus()
      } else {
        // Clear current input
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
        onChange && onChange(newOtp.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text/plain')
    const pasteArray = pasteData.replace(/\D/g, '').split('').slice(0, length)
    
    if (pasteArray.length > 0) {
      const newOtp = [...pasteArray, ...new Array(length - pasteArray.length).fill('')]
      setOtp(newOtp)
      
      const otpValue = newOtp.join('')
      onChange && onChange(otpValue)
      
      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex(val => val === '')
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex].focus()
      }
      
      // Check if OTP is complete
      if (otpValue.length === length && !otpValue.includes('')) {
        onComplete && onComplete(otpValue)
      }
    }
  }

  return (
    <div className="otp-input-container">
      {otp.map((data, index) => (
        <Input
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          type="text"
          maxLength={1}
          value={data}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          className="otp-input"
          style={{
            width: '50px',
            height: '50px',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            margin: '0 5px',
            borderRadius: '8px'
          }}
        />
      ))}
    </div>
  )
}

export default OTPInput
