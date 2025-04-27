// Data parser for booking data

import { HourIdEncoding } from '../models/BookingModel.js';

/**
 * Class to parse session data from raw text
 */
export class SessionParser {
  /**
   * Parse availability information from text
   * @param {string} text - The text to parse
   * @param {string} link - The booking link
   * @returns {Object|null} - Parsed availability data or null
   */
  static parseAvailability(text, link = null) {
    if (text.length > 20) {
      return null;
    }

    if (text.includes("FULL")) {
      return { available: 0, total: 0, link };
    }

    if (text.includes("Session Cancelled")) {
      return { available: 0, total: 0, cancelled: true };
    }

    if (text.includes("/")) {
      const [available, total] = text
        .split("/")
        .map((num) => parseInt(num));
      return { available: available, total: total, link };
    }

    return null;
  }

  /**
   * Check if text is a date header
   * @param {string} text - The text to check
   * @returns {boolean} - Whether the text is a date header
   */
  static isDateHeader(text) {
    return text.includes(" (") && text.length < 40;
  }

  /**
   * Check if text is a time slot
   * @param {string} text - The text to check
   * @returns {boolean} - Whether the text is a time slot
   */
  static isTimeSlot(text) {
    return text.includes("-") && text.length < 10;
  }
}

/**
 * Class to extract booking data from HTML content
 */
export class BookingDataExtractor {
  constructor() {
    this.gymPlace = [];
    this.dayFromToday = -1;
    this.CenterId = null;
  }

  /**
   * Process a line of text
   * @param {string} line - The line to process
   */
  processLine(line) {
    line = line.trim();

    if (SessionParser.isDateHeader(line)) {
      this.dayFromToday++;
      const dateComponents = line.split(" ");
      const date = dateComponents[0].split("/").reverse().join("/");
      const weekDay = dateComponents[1];

      this.gymPlace.push({
        date: date + " " + weekDay,
        id: this.dayFromToday,
        date_encoding: encodeURIComponent(date),
      });
      return;
    }

    if (SessionParser.isTimeSlot(line)) {
      if (!this.gymPlace[this.dayFromToday].sessions) {
        this.gymPlace[this.dayFromToday].sessions = [];
      }
      this.gymPlace[this.dayFromToday].sessions.push({
        time_slot: line,
        hour_id: HourIdEncoding[line],
        link: `/Form/SignUpPs?CenterID=${this.CenterId}&Date=${this.gymPlace[this.dayFromToday].date_encoding
        }&HourID=${HourIdEncoding[line]}`
      });
      return;
    }

    if (this.dayFromToday < 0 || !this.gymPlace[this.dayFromToday].sessions) {
      return;
    }

    const currentSessionId =
      this.gymPlace[this.dayFromToday].sessions.length - 1;
    const link = this.gymPlace[this.dayFromToday].sessions[currentSessionId].link;
    const availability = SessionParser.parseAvailability(line, link);
    if (availability) {
      const currentSession =
        this.gymPlace[this.dayFromToday].sessions[currentSessionId];
      Object.assign(currentSession, availability);
    }
  }

  /**
   * Extract booking data from lines of text
   * @param {string} CenterId - The center ID
   * @param {Array<string>} lines - The lines to extract from
   * @returns {Array} - Extracted booking data
   */
  extract(CenterId, lines) {
    this.gymPlace = [];
    this.dayFromToday = -1;
    this.CenterId = CenterId;

    lines.forEach((line) => {
      this.processLine(line);
    });

    return this.gymPlace;
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SessionParser,
    BookingDataExtractor
  };
} 