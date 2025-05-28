// Main background script

import { setupNotificationClickHandler } from './utils/notifications.js';
import { setupMessageListener } from './background/messageHandler.js';
import { websiteChecker } from './background/websiteChecker.js';

// Always register listeners and start checker on service worker startup
setupNotificationClickHandler();
setupMessageListener();
websiteChecker.start();

/**
 * Initialize the extension
 */
function init() {
  console.log("Extension installed!");
}

// Run initialization when extension is installed or updated
chrome.runtime.onInstalled.addListener(init);

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init
  };
}