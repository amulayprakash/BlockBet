import Swal from 'sweetalert2';

/**
 * Generates a shareable URL for a room
 * @param {string|number} roomId - The room ID
 * @returns {string} The complete shareable URL
 */
export const generateRoomShareUrl = (roomId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/dashboard/rooms/join/${roomId}`;
};

/**
 * Copies text to clipboard with fallback support
 * @param {string} text - The text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Shows a success toast notification
 * @param {string} message - The message to display
 */
export const showSuccessToast = (message) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#10b981',
    color: '#ffffff',
    iconColor: '#ffffff',
  });
};

/**
 * Shows an error toast notification
 * @param {string} message - The message to display
 */
export const showErrorToast = (message) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'error',
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#dc2626',
    color: '#ffffff',
    iconColor: '#ffffff',
  });
};

/**
 * Copies room link to clipboard and shows notification
 * @param {string|number} roomId - The room ID
 * @param {number} displayRoomId - The display room ID (roomId + 1)
 */
export const copyRoomLink = async (roomId, displayRoomId) => {
  const url = generateRoomShareUrl(roomId);
  const success = await copyToClipboard(url);
  
  if (success) {
    showSuccessToast(`Room #${displayRoomId} link copied!`);
  } else {
    showErrorToast('Failed to copy link. Please try again.');
  }
};

/**
 * Opens WhatsApp with pre-filled room share message
 * @param {string|number} roomId - The room ID
 * @param {number} displayRoomId - The display room ID (roomId + 1)
 * @param {string} totalPool - The total pool amount (optional)
 */
export const shareOnWhatsApp = (roomId, displayRoomId, totalPool = null) => {
  const url = generateRoomShareUrl(roomId);
  let message = `🎲 Check out this betting room on BlockBet!\n\n`;
  message += `🎯 Room #${displayRoomId}\n`;
  
  if (totalPool) {
    message += `💰 Total Pool: ${totalPool} USDT\n`;
  }
  
  message += `\n🔗 Join here: ${url}`;
  
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
};

/**
 * Uses native share API if available, otherwise copies to clipboard
 * @param {string|number} roomId - The room ID
 * @param {number} displayRoomId - The display room ID (roomId + 1)
 * @param {string} totalPool - The total pool amount (optional)
 */
export const shareRoom = async (roomId, displayRoomId, totalPool = null) => {
  const url = generateRoomShareUrl(roomId);
  
  // Try native share API first (mainly for mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title: `BlockBet Room #${displayRoomId}`,
        text: `Join Room #${displayRoomId} on BlockBet${totalPool ? ` - Total Pool: ${totalPool} USDT` : ''}`,
        url: url,
      });
      return;
    } catch (error) {
      // User cancelled or share failed, fall back to copy
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    }
  }
  
  // Fallback to copy to clipboard
  await copyRoomLink(roomId, displayRoomId);
};
