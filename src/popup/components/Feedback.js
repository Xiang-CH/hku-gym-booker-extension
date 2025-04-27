// Feedback component

/**
 * Class to handle the feedback link functionality
 */
export class FeedbackLink {
  constructor() {
    this.feedbackLink = document.getElementsByClassName('feedback')[0];
    this.initialize();
  }

  /**
   * Initialize the feedback link with event listeners
   */
  initialize() {
    this.feedbackLink.addEventListener('click', this.handleClick.bind(this));
  }

  /**
   * Handle click on the feedback link
   * @param {Event} event - The click event
   */
  handleClick(event) {
    event.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/Xiang-CH/hku-gym-booker-extension/issues' });
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FeedbackLink
  };
} 