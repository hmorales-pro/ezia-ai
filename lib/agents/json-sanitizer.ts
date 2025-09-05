/**
 * Utility functions for sanitizing AI-generated JSON responses
 * Handles common issues like markdown formatting, special characters, and malformed JSON
 */

/**
 * Sanitize a string value to be JSON-safe
 * Removes markdown formatting and escapes special characters
 */
function sanitizeJsonString(str: string): string {
  if (typeof str !== 'string') return str;
  
  return str
    // Remove markdown bold/italic formatting
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold** -> bold
    .replace(/\*([^*]+)\*/g, '$1')      // *italic* -> italic
    .replace(/__([^_]+)__/g, '$1')      // __bold__ -> bold
    .replace(/_([^_]+)_/g, '$1')        // _italic_ -> italic
    // Remove markdown links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // [text](url) -> text
    // Remove markdown headers
    .replace(/^#+\s+/gm, '')            // ### header -> header
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')    // Remove control characters
    // Remove any remaining problematic characters
    .replace(/[\u0000-\u0019]+/g, '')   // Remove additional control characters
    .trim();
}

/**
 * Deep sanitize an object, handling all string values recursively
 */
function deepSanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeJsonString(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(item => deepSanitizeObject(item));
  } else if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = deepSanitizeObject(value);
    }
    return sanitized;
  }
  return obj;
}

/**
 * Extract and clean JSON from AI response
 * Handles various formatting issues and extracts JSON from surrounding text
 */
export function extractAndCleanJson(content: string): string {
  let jsonContent = content;
  
  // Remove code block markers
  jsonContent = jsonContent
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();
  
  // Try to extract JSON object or array (non-greedy to get the first complete JSON)
  const jsonMatch = jsonContent.match(/(\{[\s\S]*?\}(?=\s*$)|\[[\s\S]*?\](?=\s*$)|\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    jsonContent = jsonMatch[0];
  }
  
  // Basic syntax fixes
  jsonContent = jsonContent
    .replace(/,\s*}/g, '}')           // Remove trailing commas in objects
    .replace(/,\s*]/g, ']')           // Remove trailing commas in arrays
    .replace(/}\s*{/g, '},{')         // Add comma between adjacent objects
    .replace(/]\s*\[/g, '],[')        // Add comma between adjacent arrays
    .replace(/,\s*,+/g, ',')          // Remove duplicate commas
    .replace(/:\s*,/g, ': null,')     // Replace empty values with null
    .replace(/:\s*}/g, ': null}')     // Replace empty values at end of object
    .replace(/"\s*\n\s*"/g, '",\n"'); // Add missing commas between strings
  
  return jsonContent;
}

/**
 * Parse AI-generated JSON with comprehensive error handling and sanitization
 */
export function parseAIGeneratedJson(content: string, removeMarkdown: boolean = true): any {
  if (!content || typeof content !== 'string') {
    throw new Error('Invalid content: expected non-empty string');
  }
  
  // First attempt: try to parse as-is
  try {
    const parsed = JSON.parse(content);
    // If successful and removeMarkdown is true, sanitize the result
    return removeMarkdown ? deepSanitizeObject(parsed) : parsed;
  } catch (firstError) {
    console.log('[JSON Sanitizer] Direct parse failed, attempting cleanup...');
  }
  
  // Second attempt: extract and clean JSON
  let cleanedContent = extractAndCleanJson(content);
  
  try {
    const parsed = JSON.parse(cleanedContent);
    return removeMarkdown ? deepSanitizeObject(parsed) : parsed;
  } catch (secondError) {
    console.log('[JSON Sanitizer] Cleaned parse failed, attempting deep sanitization...');
  }
  
  // Third attempt: parse then deep sanitize
  try {
    // Try to parse with a more lenient approach
    // Replace problematic patterns before parsing
    const lenientContent = cleanedContent
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure keys are quoted
      .replace(/:\s*'([^']*)'/g, ': "$1"')                  // Replace single quotes with double
      .replace(/\\'/g, "'")                                  // Unescape single quotes
      .replace(/[\u0000-\u0019]+/g, '');                    // Remove control characters
    
    const parsed = JSON.parse(lenientContent);
    return removeMarkdown ? deepSanitizeObject(parsed) : parsed;
  } catch (thirdError) {
    console.log('[JSON Sanitizer] Lenient parse failed, attempting reconstruction...');
  }
  
  // Fourth attempt: try to reconstruct valid JSON
  try {
    // This is a last resort - try to eval the content as JavaScript object literal
    // and then stringify/parse to get valid JSON
    const evalContent = cleanedContent
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '$2:')  // Remove quotes from keys for eval
      .replace(/:\s*"([^"]*)"/g, (match, p1) => `: "${sanitizeJsonString(p1)}"`)  // Sanitize string values
      .replace(/:\s*'([^']*)'/g, (match, p1) => `: "${sanitizeJsonString(p1)}"`); // Convert single to double quotes
    
    // Use Function constructor instead of eval for safety
    const func = new Function('return ' + evalContent);
    const obj = func();
    
    // Convert to JSON and back to ensure valid JSON
    const finalObj = removeMarkdown ? deepSanitizeObject(obj) : obj;
    return JSON.parse(JSON.stringify(finalObj));
  } catch (fourthError) {
    console.error('[JSON Sanitizer] All parsing attempts failed');
    console.error('Original content (first 500 chars):', content.substring(0, 500));
    console.error('Cleaned content (first 500 chars):', cleanedContent.substring(0, 500));
    throw new Error(`Failed to parse AI-generated JSON: ${fourthError.message}`);
  }
}

/**
 * Validate that required fields exist in the parsed object
 */
export function validateRequiredFields(obj: any, requiredFields: string[]): boolean {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  for (const field of requiredFields) {
    if (!(field in obj)) {
      console.warn(`[JSON Sanitizer] Missing required field: ${field}`);
      return false;
    }
  }
  
  return true;
}