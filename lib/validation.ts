/**
 * Validation utilities for SmartMunshi Application
 * Enforces strict data constraints and input sanitization
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a person's full name.
 */
export function validateName(name: string): ValidationResult {
  const trimmed = name ? name.trim() : '';
  if (!trimmed) {
    return { isValid: false, error: 'Full name is required.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long.' };
  }
  if (trimmed.length > 50) {
    return { isValid: false, error: 'Name cannot exceed 50 characters.' };
  }
  if (!/^[a-zA-Z0-9\s._'-]+$/.test(trimmed)) {
    return { isValid: false, error: 'Name contains invalid characters.' };
  }
  return { isValid: true };
}

/**
 * Validates Indian 10-digit mobile phone numbers.
 */
export function validatePhone(phone: string): ValidationResult {
  const clean = phone ? phone.replace(/\D/g, '') : '';
  if (!clean) {
    return { isValid: false, error: 'Mobile phone number is required.' };
  }
  if (clean.length !== 10) {
    return { isValid: false, error: 'Mobile number must be exactly 10 digits.' };
  }
  if (!/^[6-9]\d{9}$/.test(clean)) {
    return { isValid: false, error: 'Enter a valid 10-digit mobile number (starting with 6-9).' };
  }
  return { isValid: true };
}

/**
 * Validates a 4-digit numeric PIN.
 */
export function validatePin(pin: string): ValidationResult {
  const clean = pin ? pin.trim() : '';
  if (!clean) {
    return { isValid: false, error: 'PIN is required.' };
  }
  if (!/^\d{4}$/.test(clean)) {
    return { isValid: false, error: 'PIN must be exactly 4 numeric digits (e.g. 1234).' };
  }
  return { isValid: true };
}

/**
 * Validates daily wage amount.
 */
export function validateDailyWage(wage: string | number): ValidationResult {
  const num = typeof wage === 'number' ? wage : parseFloat(wage);
  if (isNaN(num)) {
    return { isValid: false, error: 'Daily wage must be a valid number.' };
  }
  if (num < 50) {
    return { isValid: false, error: 'Daily wage rate must be at least ₹50/day.' };
  }
  if (num > 50000) {
    return { isValid: false, error: 'Daily wage rate cannot exceed ₹50,000/day.' };
  }
  return { isValid: true };
}

/**
 * Validates financial transaction amount (advances, expenses, payouts).
 */
export function validateAmount(amount: string | number, min = 1, max = 10000000, fieldName = 'Amount'): ValidationResult {
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a valid number.` };
  }
  if (num < min) {
    return { isValid: false, error: `${fieldName} must be at least ₹${min}.` };
  }
  if (num > max) {
    return { isValid: false, error: `${fieldName} cannot exceed ₹${max.toLocaleString('en-IN')}.` };
  }
  return { isValid: true };
}

/**
 * Validates text descriptions or reasons.
 */
export function validateText(text: string, fieldName = 'Description', minLen = 3, maxLen = 250): ValidationResult {
  const trimmed = text ? text.trim() : '';
  if (!trimmed) {
    return { isValid: false, error: `${fieldName} is required.` };
  }
  if (trimmed.length < minLen) {
    return { isValid: false, error: `${fieldName} must be at least ${minLen} characters.` };
  }
  if (trimmed.length > maxLen) {
    return { isValid: false, error: `${fieldName} cannot exceed ${maxLen} characters.` };
  }
  return { isValid: true };
}

/**
 * Validates IFSC Bank Code.
 */
export function validateIfsc(ifsc: string): ValidationResult {
  if (!ifsc || !ifsc.trim()) return { isValid: true }; // Optional field
  const clean = ifsc.trim().toUpperCase();
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(clean)) {
    return { isValid: false, error: 'Invalid IFSC Code format (e.g. SBIN0001234).' };
  }
  return { isValid: true };
}

/**
 * Validates Bank Account Number.
 */
export function validateAccountNo(acc: string): ValidationResult {
  if (!acc || !acc.trim()) return { isValid: true }; // Optional field
  const clean = acc.trim();
  if (!/^\d{9,18}$/.test(clean)) {
    return { isValid: false, error: 'Bank account number must be between 9 and 18 digits.' };
  }
  return { isValid: true };
}

/**
 * Validates UPI VPA ID.
 */
export function validateUpiId(upi: string): ValidationResult {
  if (!upi || !upi.trim()) return { isValid: true }; // Optional field
  const clean = upi.trim();
  if (!/^[\w.-]+@[\w.-]+$/.test(clean)) {
    return { isValid: false, error: 'Invalid UPI ID format (e.g. mobile@upi or name@okaxis).' };
  }
  return { isValid: true };
}
