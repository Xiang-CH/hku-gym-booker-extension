// Booking model that defines the data structure for booking information

// Constants for locations
export const LOCATIONS = {
  CSE: {
    id: "10001",
    htmlId: "c10001Content",
    key: "cse-active",
  },
  B: {
    id: "10002",
    htmlId: "c10002Content",
    key: "b-active",
  },
};

// Time slot mappings
export const HourIdEncoding = {
  "1700-1830": "10140",
  "1845-2015": "10141",
  "2030-2200": "10142",
  "1715-1845": "10124",
};

// URL for the booking site
export const TARGET_URL = "https://fcbooking.cse.hku.hk/";

/**
 * Class that manages the booking state
 */
export class BookingState {
  constructor() {
    this.events = {
      "b-active": {},
      "cse-active": {},
    };
    this.currentTab = "b-active";
  }

  /**
   * Set events for a specific location and date
   * @param {string} locationKey - The location key
   * @param {string} date - The date string
   * @param {Array} sessions - Array of session data
   */
  setEvents(locationKey, date, sessions) {
    this.events[locationKey][date] = sessions;
  }

  /**
   * Get events for the current tab
   * @returns {Object} - Events for the current tab
   */
  getEvents() {
    return this.events[this.currentTab];
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LOCATIONS,
    HourIdEncoding,
    TARGET_URL,
    BookingState
  };
} 