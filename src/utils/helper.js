// src/utils/helpers.js

/**
 * Format a date string to a readable format
 * 
 * @param {string|Date} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return '';
    
    const defaultOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    return new Intl.DateTimeFormat('en-GB', defaultOptions).format(dateObj);
  };
  
  /**
   * Format a currency value
   * 
   * @param {number} value - Amount to format
   * @param {string} currency - Currency code (default: GBP)
   * @returns {string} Formatted currency string
   */
  export const formatCurrency = (value, currency = 'GBP') => {
    if (value === undefined || value === null) return '';
    
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency
    }).format(value);
  };
  
  /**
   * Truncate text to a specified length
   * 
   * @param {string} text - Text to truncate
   * @param {number} length - Maximum length
   * @returns {string} Truncated text
   */
  export const truncateText = (text, length = 100) => {
    if (!text) return '';
    if (text.length <= length) return text;
    
    return text.slice(0, length) + '...';
  };
  
  /**
   * Generate a random ID
   * 
   * @param {number} length - Length of ID
   * @returns {string} Random ID
   */
  export const generateId = (length = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  };
  
  /**
   * Calculate the difference between two dates in days
   * 
   * @param {string|Date} date1 - First date
   * @param {string|Date} date2 - Second date
   * @returns {number} Difference in days
   */
  export const daysBetweenDates = (date1, date2) => {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    
    // Convert to UTC to avoid timezone issues
    const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
    
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    
    return Math.floor((utc2 - utc1) / MS_PER_DAY);
  };
  
  /**
   * Check if a date is in the past
   * 
   * @param {string|Date} date - Date to check
   * @returns {boolean} True if date is in the past
   */
  export const isDateInPast = (date) => {
    if (!date) return false;
    
    const checkDate = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    
    // Set both dates to midnight to compare only dates
    today.setHours(0, 0, 0, 0);
    checkDate.setHours(0, 0, 0, 0);
    
    return checkDate < today;
  };
  
  /**
   * Check if a date is within a specified range of days from now
   * 
   * @param {string|Date} date - Date to check
   * @param {number} days - Number of days
   * @returns {boolean} True if date is within range
   */
  export const isDateWithinDays = (date, days) => {
    if (!date) return false;
    
    const checkDate = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    
    // Set both dates to midnight to compare only dates
    today.setHours(0, 0, 0, 0);
    checkDate.setHours(0, 0, 0, 0);
    
    const differenceInDays = daysBetweenDates(today, checkDate);
    
    return differenceInDays >= 0 && differenceInDays <= days;
  };
  
  /**
   * Format a phone number to a standard format
   * 
   * @param {string} phoneNumber - Phone number to format
   * @returns {string} Formatted phone number
   */
  export const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a UK number
    if (cleaned.startsWith('44') || cleaned.startsWith('0')) {
      // UK format: XXXXX XXXXXX
      if (cleaned.startsWith('44')) {
        // Remove country code and add 0
        const withoutCode = '0' + cleaned.substring(2);
        
        // Format as UK number
        if (withoutCode.length === 11) {
          return withoutCode.replace(/(\d{5})(\d{6})/, '$1 $2');
        }
        
        return withoutCode;
      }
      
      // Already starts with 0
      if (cleaned.length === 11) {
        return cleaned.replace(/(\d{5})(\d{6})/, '$1 $2');
      }
      
      return cleaned;
    }
    
    // Default format for other numbers
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  };
  
  /**
   * Generate a random access number for drivers
   * 
   * @returns {string} Random access number
   */
  export const generateAccessNumber = () => {
    const randomNum = Math.floor(1000000 + Math.random() * 9000000);
    return randomNum.toString();
  };
  
  /**
   * Calculate age from date of birth
   * 
   * @param {string|Date} dateOfBirth - Date of birth
   * @returns {number} Age in years
   */
  export const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    
    const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    const today = new Date();
    
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  };
  
  /**
   * Get current week number and date range
   * 
   * @returns {Object} Week information
   */
  export const getCurrentWeekInfo = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now - startOfYear) / 86400000;
    
    // Calculate current week number
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    
    // Calculate week start (Sunday) and end (Saturday)
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return {
      weekNumber,
      weekStart,
      weekEnd,
      dateRange: `${formatDate(weekStart, { weekday: undefined, year: 'numeric', month: '2-digit', day: '2-digit' })} - ${formatDate(weekEnd, { weekday: undefined, year: 'numeric', month: '2-digit', day: '2-digit' })}`
    };
  };
  
  /**
   * Capitalize the first letter of each word in a string
   * 
   * @param {string} text - Text to capitalize
   * @returns {string} Capitalized text
   */
  export const capitalizeWords = (text) => {
    if (!text) return '';
    
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };