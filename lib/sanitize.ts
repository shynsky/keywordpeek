/**
 * Input Sanitization Utilities
 *
 * Sanitizes user input to prevent XSS and injection attacks.
 * Uses regex-based sanitization to avoid external dependencies.
 */

/**
 * HTML entities to escape
 */
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Remove all HTML tags from a string
 */
export function stripHtml(str: string): string {
  return str
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&[a-z]+;/gi, " ") // Replace HTML entities with space
    .replace(/&#\d+;/g, " ") // Replace numeric HTML entities
    .trim();
}

/**
 * Sanitize a keyword string
 * - Strips HTML
 * - Removes special characters except basic punctuation
 * - Normalizes whitespace
 * - Limits length
 */
export function sanitizeKeyword(keyword: string, maxLength = 80): string {
  return (
    stripHtml(keyword)
      // Keep alphanumeric, spaces, hyphens, and common punctuation
      .replace(/[^\w\s\-'.]/gi, "")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength)
  );
}

/**
 * Sanitize an array of keywords
 */
export function sanitizeKeywords(
  keywords: string[],
  maxLength = 80
): string[] {
  return keywords
    .map((kw) => sanitizeKeyword(kw, maxLength))
    .filter((kw) => kw.length > 0);
}

/**
 * Sanitize a description or text field
 * - Strips HTML
 * - Allows more punctuation than keywords
 * - Normalizes whitespace
 */
export function sanitizeDescription(
  description: string,
  maxLength = 500
): string {
  return (
    stripHtml(description)
      // Keep alphanumeric, spaces, and common punctuation
      .replace(/[^\w\s\-'".,:;!?()]/gi, "")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength)
  );
}

/**
 * Sanitize a domain name
 * - Removes protocol
 * - Removes paths
 * - Validates format
 */
export function sanitizeDomain(domain: string): string {
  let clean = domain.toLowerCase().trim();

  // Remove protocol
  clean = clean.replace(/^https?:\/\//, "");

  // Remove www
  clean = clean.replace(/^www\./, "");

  // Remove path, query, hash
  clean = clean.split("/")[0].split("?")[0].split("#")[0];

  // Basic domain validation
  const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/;
  if (!domainRegex.test(clean)) {
    return "";
  }

  return clean;
}

/**
 * Sanitize a project name
 */
export function sanitizeProjectName(name: string, maxLength = 100): string {
  return (
    stripHtml(name)
      // Keep alphanumeric, spaces, hyphens, underscores
      .replace(/[^\w\s\-_]/gi, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength)
  );
}

/**
 * Validate and sanitize an email address
 */
export function sanitizeEmail(email: string): string | null {
  const clean = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(clean)) {
    return null;
  }

  return clean;
}

/**
 * Sanitize for safe inclusion in JSON
 * Escapes control characters and problematic sequences
 */
export function sanitizeForJson(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/[\x00-\x1f\x7f]/g, "");
}

/**
 * Check if a string contains potentially malicious content
 */
export function containsMaliciousContent(str: string): boolean {
  const maliciousPatterns = [
    /<script\b/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /on\w+\s*=/i, // onclick=, onerror=, etc.
    /expression\s*\(/i, // CSS expression()
    /url\s*\(/i, // CSS url()
  ];

  return maliciousPatterns.some((pattern) => pattern.test(str));
}
