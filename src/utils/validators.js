// src/utils/validators.js

/**
 * Validate an email address
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validate a password meets security requirements
   * 
   * @param {string} password - Password to validate
   * @returns {Object} Validation result and any error messages
   */
  export const validatePassword = (password) => {
    if (!password) {
      return {
        isValid: false,
        message: 'Password is required'
      };
    }
    
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    
    if (password.length < minLength) {
      return {
        isValid: false,
        message: `Password must be at least ${minLength} characters long`
      };
    }
    
    // Check for at least 3 of the 4 requirements
    const requirements = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars];
    const metRequirements = requirements.filter(Boolean).length;
    
    if (metRequirements < 3) {
      return {
        isValid: false,
        message: 'Password must include at least 3 of the following: uppercase letters, lowercase letters, numbers, and special characters'
      };
    }
    
    return {
      isValid: true,
      message: ''
    };
  };
  
  /**
   * Validate a UK postcode
   * 
   * @param {string} postcode - Postcode to validate
   * @returns {boolean} True if postcode is valid
   */
  export const isValidUKPostcode = (postcode) => {
    if (!postcode) return false;
    
    // UK postcode regex pattern
    const pattern = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    return pattern.test(postcode);
  };
  
  /**
   * Validate a UK phone number
   * 
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if phone number is valid
   */
  export const isValidUKPhoneNumber = (phone) => {
    if (!phone) return false;
    
    // Remove spaces, dashes, and parentheses
    const cleaned = phone.replace(/[\s\-()]/g, '');
    
    // Check if it starts with +44 or 0
    if (cleaned.startsWith('+44')) {
      // Convert +44 to 0
      const ukFormat = '0' + cleaned.substring(3);
      return /^0[1-9]\d{8,9}$/.test(ukFormat);
    }
    
    // Check UK format starting with 0
    return /^0[1-9]\d{8,9}$/.test(cleaned);
  };
  
  /**
   * Validate a UK National Insurance Number
   * 
   * @param {string} nino - National Insurance Number to validate
   * @returns {boolean} True if NINO is valid
   */
  export const isValidNINO = (nino) => {
    if (!nino) return false;
    
    // Remove spaces
    const cleaned = nino.replace(/\s/g, '').toUpperCase();
    
    // UK NINO pattern: 2 letters, 6 numbers, and 1 letter
    const pattern = /^[A-Z]{2}[0-9]{6}[A-Z]$/;
    
    // Check for disallowed first two letters
    const disallowedPrefixes = ['DA', 'FN', 'GB', 'NK', 'TN', 'ZZ'];
    
    if (disallowedPrefixes.includes(cleaned.substring(0, 2))) {
      return false;
    }
    
    // Check against the pattern
    return pattern.test(cleaned);
  };
  
  /**
   * Validate a UK vehicle registration number
   * 
   * @param {string} reg - Vehicle registration to validate
   * @returns {boolean} True if registration is valid
   */
  export const isValidVehicleReg = (reg) => {
    if (!reg) return false;
    
    // Remove spaces
    const cleaned = reg.replace(/\s/g, '').toUpperCase();
    
    // UK vehicle registration patterns
    // Current format: AB12 ABC
    const currentPattern = /^[A-Z]{2}[0-9]{2}[A-Z]{3}$/;
    
    // Previous format: A123 ABC
    const previousPattern = /^[A-Z][0-9]{3}[A-Z]{3}$/;
    
    // Old format: ABC 123A
    const oldPattern = /^[A-Z]{3}[0-9]{3}[A-Z]$/;
    
    // Even older formats
    const datelessPattern = /^[A-Z]{1,3}[0-9]{1,4}$/;
    
    return (
      currentPattern.test(cleaned) ||
      previousPattern.test(cleaned) ||
      oldPattern.test(cleaned) ||
      datelessPattern.test(cleaned)
    );
  };
  
  /**
   * Validate a UK driver license number
   * 
   * @param {string} license - Driver license number to validate
   * @returns {boolean} True if license is valid
   */
  export const isValidUKDriverLicense = (license) => {
    if (!license) return false;
    
    // Remove spaces
    const cleaned = license.replace(/\s/g, '').toUpperCase();
    
    // UK Driver License pattern: AAAAA999999AA9AA
    // 5 letters (surname) + 6 numbers (date of birth) + 2 letters + 1 number + 2 letters
    const pattern = /^[A-Z]{5}[0-9]{6}[A-Z]{2}[0-9][A-Z]{2}$/;
    
    return pattern.test(cleaned);
  };
  
  /**
   * Validate form fields with custom validation rules
   * 
   * @param {Object} values - Form field values
   * @param {Object} validationRules - Validation rules for each field
   * @returns {Object} Validation errors for each field
   */
  export const validateForm = (values, validationRules) => {
    const errors = {};
    
    Object.keys(validationRules).forEach(fieldName => {
      const value = values[fieldName];
      const rules = validationRules[fieldName];
      
      // Required field validation
      if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        errors[fieldName] = rules.requiredMessage || 'This field is required';
        return;
      }
      
      // Skip remaining validations if field is empty and not required
      if (!value && !rules.required) {
        return;
      }
      
      // Email validation
      if (rules.isEmail && !isValidEmail(value)) {
        errors[fieldName] = rules.emailMessage || 'Please enter a valid email address';
        return;
      }
      
      // Password validation
      if (rules.isPassword) {
        const { isValid, message } = validatePassword(value);
        if (!isValid) {
          errors[fieldName] = message;
          return;
        }
      }
      
      // UK postcode validation
      if (rules.isUKPostcode && !isValidUKPostcode(value)) {
        errors[fieldName] = rules.postcodeMessage || 'Please enter a valid UK postcode';
        return;
      }
      
      // UK phone validation
      if (rules.isUKPhone && !isValidUKPhoneNumber(value)) {
        errors[fieldName] = rules.phoneMessage || 'Please enter a valid UK phone number';
        return;
      }
      
      // Min length validation
      if (rules.minLength && value.length < rules.minLength) {
        errors[fieldName] = rules.minLengthMessage || `Must be at least ${rules.minLength} characters`;
        return;
      }
      
      // Max length validation
      if (rules.maxLength && value.length > rules.maxLength) {
        errors[fieldName] = rules.maxLengthMessage || `Must be no more than ${rules.maxLength} characters`;
        return;
      }
      
      // Custom validation function
      if (rules.validate && typeof rules.validate === 'function') {
        const customError = rules.validate(value, values);
        if (customError) {
          errors[fieldName] = customError;
          return;
        }
      }
    });
    
    return errors;
  };
  
  /**
   * Check if a string is a valid UTR (Unique Taxpayer Reference) number
   * 
   * @param {string} utr - UTR number to validate
   * @returns {boolean} True if UTR is valid
   */
  export const isValidUTR = (utr) => {
    if (!utr) return false;
    
    // Remove spaces
    const cleaned = utr.replace(/\s/g, '');
    
    // UK UTR should be 10 digits
    const pattern = /^\d{10}$/;
    
    return pattern.test(cleaned);
  };
  
  /**
   * Check if a string is a valid VAT number
   * 
   * @param {string} vat - VAT number to validate
   * @returns {boolean} True if VAT number is valid
   */
  export const isValidVAT = (vat) => {
    if (!vat) return false;
    
    // Remove spaces and convert to uppercase
    const cleaned = vat.replace(/\s/g, '').toUpperCase();
    
    // UK VAT number pattern: 9 digits, or GB + 9 digits
    const patternUK = /^(?:GB)?\d{9}$/;
    
    // UK VAT number with prefix pattern: GB + 12 digits
    const patternUKPrefix = /^GB\d{12}$/;
    
    return patternUK.test(cleaned) || patternUKPrefix.test(cleaned);
  };