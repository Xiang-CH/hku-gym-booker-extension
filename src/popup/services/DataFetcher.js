// Data fetcher service

import { TARGET_URL, LOCATIONS } from '../models/BookingModel.js';
import { BookingDataExtractor } from './DataParser.js';

/**
 * Class to handle fetching and parsing booking data
 */
export class BookingScraper {
  /**
   * @param {BookingState} state - The booking state to update
   */
  constructor(state) {
    this.state = state;
    this.extractor = new BookingDataExtractor();
  }

  /**
   * Fetch and parse HTML from a URL
   * @param {string} url - The URL to fetch
   * @returns {Document} - The parsed HTML document
   */
  async fetchAndParse(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      return parser.parseFromString(html, "text/html");
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }

  /**
   * Get content data from a document
   * @param {Document} doc - The document to extract from
   * @param {string} locationId - The location ID selector
   * @returns {Object} - The extracted content data
   */
  getContentData(doc, locationId) {
    const content = doc.getElementById(locationId);
    return {
      lines: content.textContent.split("\n"),
    };
  }

  /**
   * Scrape events from the booking site
   */
  async scrapeEvents() {
    try {
      const doc = await this.fetchAndParse(TARGET_URL);

      for (const location of Object.values(LOCATIONS)) {
        const { lines } = this.getContentData(doc, location.htmlId);
        const data = this.extractor.extract(
          location.id,
          lines,
        );

        for (const dayEntry of data) {
          this.state.setEvents(
            location.key,
            dayEntry.date,
            dayEntry.sessions
          );
        }
      }

      return true;
    } catch (error) {
      console.error("Error scraping events:", error);
      return false;
    }
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BookingScraper
  };
} 