// Main popup script

import { BookingState } from './models/BookingModel.js';
import { BookingScraper } from './services/DataFetcher.js';
import { UserForm } from './components/UserForm.js';
import { SessionsView } from './components/SessionsView.js';
import { FeedbackLink } from './components/Feedback.js';

/**
 * Initialize the popup UI when the DOM is loaded
 */
async function initializePopup() {
  // Initialize components
  const feedbackLink = new FeedbackLink();
  const userForm = new UserForm();
  
  // Initialize booking state and services
  const bookingState = new BookingState();
  const dataScraper = new BookingScraper(bookingState);
  
  // Initialize sessions view and hide UI while loading
  const sessionsView = new SessionsView(bookingState);
  sessionsView.hideUI();
  
  // Fetch booking data
  try {
    const success = await dataScraper.scrapeEvents();
    
    if (success) {
      sessionsView.showUI();
    } else {
      // Handle error state
      console.error('Failed to load booking data');
    }
  } catch (error) {
    console.error('Error initializing popup:', error);
  }
}

// Initialize popup when DOM is fully loaded
window.addEventListener('DOMContentLoaded', initializePopup);

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializePopup
  };
} 