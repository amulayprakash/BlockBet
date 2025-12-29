/**
 * Utility functions for error handling
 */

/**
 * Extracts a clean, user-friendly error message from various error formats
 * @param {*} error - The error object, string, or any error type
 * @param {string} fallback - Fallback message if no error message can be extracted
 * @returns {string} - Clean user-friendly error message
 */
export function getErrorMessage(error, fallback = 'Something went wrong!') {
  if (!error) return fallback;
  
  // If error is a string, return it
  if (typeof error === 'string') return error;
  
  // Extract message from error object
  if (error.message) {
    // Remove technical prefixes and stack traces
    let message = error.message;
    
    // Remove common error prefixes
    message = message.replace(/^Error:\s*/i, '');
    message = message.replace(/^Error\s+/i, '');
    
    // Check for JSON-RPC errors (common in blockchain/ethers.js)
    if (message.includes('JSON-RPC error') || message.includes('execution reverted')) {
      // Try to extract the revert reason
      const revertMatch = message.match(/reverted:\s*(.+?)(?:\n|$)/i);
      if (revertMatch && revertMatch[1]) {
        return revertMatch[1].trim();
      }
    }
    
    // If message is too technical, empty, or contains undefined/null, return fallback
    if (
      message.length < 3 || 
      message.includes('undefined') || 
      message.includes('null') ||
      message.includes('0x') // likely a hex error code
    ) {
      return fallback;
    }
    
    return message;
  }
  
  // If error.reason exists (common in ethers.js)
  if (error.reason) {
    let reason = error.reason;
    
    // Clean up the reason
    reason = reason.replace(/^Error:\s*/i, '');
    reason = reason.replace(/^execution reverted:\s*/i, '');
    
    if (reason.length > 0 && !reason.includes('0x')) {
      return reason;
    }
  }
  
  // If error.data?.message exists
  if (error.data?.message) {
    return error.data.message;
  }
  
  // If error has a code property, provide a more specific message
  if (error.code) {
    switch (error.code) {
      case 'ACTION_REJECTED':
      case 4001:
        return 'Transaction was rejected by user';
      case 'INSUFFICIENT_FUNDS':
        return 'Insufficient funds to complete transaction';
      case 'NETWORK_ERROR':
        return 'Network error. Please check your connection';
      case 'TIMEOUT':
        return 'Transaction timed out. Please try again';
      case 'UNSUPPORTED_OPERATION':
        return 'This operation is not supported';
      case -32603:
        return 'Internal error. Please try again';
      default:
        // Continue to fallback
        break;
    }
  }
  
  // Return fallback if no message found
  return fallback;
}

/**
 * Formats error for console logging (preserves full error details)
 * @param {*} error - The error object
 * @param {string} context - Context where the error occurred
 */
export function logError(error, context = '') {
  const prefix = context ? `[${context}]` : '';
  
  if (error.stack) {
    console.error(`${prefix} Error:`, error.message);
    console.error('Stack:', error.stack);
  } else {
    console.error(`${prefix} Error:`, error);
  }
}

/**
 * Checks if an error is a user rejection
 * @param {*} error - The error object
 * @returns {boolean} - True if user rejected the action
 */
export function isUserRejection(error) {
  if (!error) return false;
  
  const code = error.code;
  const message = error.message?.toLowerCase() || '';
  
  return (
    code === 'ACTION_REJECTED' ||
    code === 4001 ||
    message.includes('user rejected') ||
    message.includes('user denied') ||
    message.includes('rejected by user')
  );
}
