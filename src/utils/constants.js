// Constants used throughout the extension

// URLs
export const TARGET_URL = "https://fcbooking.cse.hku.hk/";

// Time between checks (in milliseconds)
export const CHECK_INTERVAL = 5000;

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TARGET_URL,
    CHECK_INTERVAL
  };
} 