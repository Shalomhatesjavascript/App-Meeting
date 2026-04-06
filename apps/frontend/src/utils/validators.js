// ============================================
// Validators — BU Connect
// ============================================

const ALLOWED_DOMAINS = [
  'student.babcock.edu.ng',
  'babcock.edu.ng',
];

/**
 * Validates university email addresses.
 * Accepts .edu domains or specific Babcock domains.
 */
export function isValidUniversityEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const lower = email.toLowerCase().trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(lower)) return false;

  const domain = lower.split('@')[1];

  // Accept specific Babcock domains
  if (ALLOWED_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
    return true;
  }

  // Accept any .edu domain (for flexibility in testing)
  if (domain.endsWith('.edu') || domain.endsWith('.edu.ng')) {
    return true;
  }

  return false;
}

export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

export function isValidName(name) {
  return typeof name === 'string' && name.trim().length >= 2;
}

export function getEmailError(email) {
  if (!email) return 'Email is required';
  if (!isValidUniversityEmail(email)) {
    return 'Must be a valid university email (e.g. name@student.babcock.edu.ng)';
  }
  return null;
}

export function getPasswordError(password) {
  if (!password) return 'Password is required';
  if (!isValidPassword(password)) return 'Password must be at least 8 characters';
  return null;
}
