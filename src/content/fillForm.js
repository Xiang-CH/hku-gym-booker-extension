// Form filling content script

/**
 * Fill the booking form with user data
 */
function fillPage() {
  chrome.storage.sync.get("user_data", function (data) {
    if (!data || !data.user_data) return;
    
    const userData = data.user_data;
    
    // Set form field values
    document.getElementById("FirstName").value = userData.name || '';
    document.getElementById("Email").value = userData.email || '';
    document.getElementById("MemberID").value = userData.studentNumber || '';
    document.getElementById("dataCollection").checked = true;
    
    // Scroll to the captcha after filling the form
    setTimeout(function () {
      const captchaElement = document.getElementById("gCaptcha");
      if (captchaElement) {
        captchaElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
  });
}

/**
 * Listen for messages from the popup
 */
function setupMessageListener() {
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "fill") {
      fillPage();
      sendResponse({ success: true });
    }
    return true;
  });
}

// Run on page load
fillPage();
setupMessageListener();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fillPage,
    setupMessageListener
  };
} 