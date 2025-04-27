// Message handler for extension communications

import { NotificationState } from '../models/NotificationState.js';
import { websiteChecker } from './websiteChecker.js';

// Create notification state instance
const notificationState = new NotificationState();

/**
 * Setup message listener for the extension
 */
export function setupMessageListener() {
  chrome.runtime.onMessage.addListener(handleMessages);
}

/**
 * Handle messages from the extension
 * @param {Object} request - Message request
 * @param {Object} sender - Message sender
 * @param {Function} sendResponse - Response callback
 * @returns {boolean} - Whether to keep the message channel open
 */
function handleMessages(request, sender, sendResponse) {
  // Handle notification requests
  if (request.type === "notify") {
    handleNotifyRequest(request, sendResponse);
    return true; // Keep message channel open
  }
  
  return false;
}

/**
 * Handle notification requests
 * @param {Object} request - Notification request
 * @param {Function} sendResponse - Response callback
 */
async function handleNotifyRequest(request, sendResponse) {
  try {
    // Add/remove link from notification list
    const response = await notificationState.addLink(request.link);
    console.log("Notify response:", response);
    
    // If successfully added, start checking
    if (response.success && !response.removed) {
      websiteChecker.start();
    }
    
    sendResponse(response);
  } catch (error) {
    console.error(error);
    sendResponse({success: false, message: error.message});
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    setupMessageListener,
    handleMessages
  };
} 