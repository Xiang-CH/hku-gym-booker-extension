// Main background script

import { setupNotificationClickHandler } from './utils/notifications.js';
import { setupMessageListener } from './background/messageHandler.js';
import { websiteChecker } from './background/websiteChecker.js';

/**
 * Initialize the extension
 */
function init() {
  console.log("Extension installed!");
  
  // Setup notification click handler
  setupNotificationClickHandler();
  
  // Setup message listener
  setupMessageListener();
  
  // Start website checker
  websiteChecker.start();
}

// Run initialization when extension is installed or updated
chrome.runtime.onInstalled.addListener(init);

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init
  };
} 