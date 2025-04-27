// Notifications utilities

/**
 * Create a notification for an available session
 * @param {string} url - The booking URL to open when clicked
 */
export function notifyAvailableSession(url) {
  chrome.notifications.create(
    url,
    {
      type: "basic",
      iconUrl: "../../logo.png",
      title: "Gym Session Available!",
      message: "Click here to book the session!",
      requireInteraction: true,
    },
    function () {
      console.log("Notification created for:", url);
    }
  );
}

/**
 * Setup notification click handler to open the booking page
 */
export function setupNotificationClickHandler() {
  chrome.notifications.onClicked.addListener(function (notificationId) {
    const link = "https://fcbooking.cse.hku.hk" + notificationId;
    chrome.tabs.create({ url: link });
    chrome.notifications.clear(notificationId);
  });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    notifyAvailableSession,
    setupNotificationClickHandler
  };
} 