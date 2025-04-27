// Website availability checker

import { TARGET_URL, CHECK_INTERVAL } from '../utils/constants.js';
import { matchHtml } from '../utils/htmlParser.js';
import { notifyAvailableSession } from '../utils/notifications.js';
import { NotificationState } from '../models/NotificationState.js';

class WebsiteChecker {
  constructor() {
    this.notificationState = new NotificationState();
    this.isChecking = false;
  }

  /**
   * Start the checking process
   */
  async start() {
    await this.checkWebsite();
  }

  /**
   * Check the website for available slots
   */
  async checkWebsite() {
    // console.log("Checking website...", this.isChecking);
    
    // Don't start a new check if already checking
    if (this.isChecking) {
      return;
    }

    // Load the notification list
    await this.notificationState.loadNotifyList();
    // console.log("url to check for", this.notificationState.notifyList)
    
    // If there's nothing to check, stop
    if (this.notificationState.notifyList.length === 0) {
      this.isChecking = false;
      console.log("No notify list! Checking flag set to false!");
      return;
    }

    this.isChecking = true;
    
    try {
      // Fetch the website content
      // const response = await fetch(TARGET_URL);
      // const html = await response.text();
      const html = `<div><a class="text-default" href="/Form/SignUpPs?CenterID=10002&Date=2025%2F04%2F28&HourID=10140">
                                                <div class="row py-2 list-hover">
                                                    <div class="col text-center">1845-2015</div>
                                                        <div class="col text-center">44/80</div>
                                                </div>
                                            </a></div>`
                                              

      // Check each link in the notification list
      for (const link of [...this.notificationState.notifyList]) {

        // Extract date from link URL parameter
        const dateMatch = link.match(/Date=(\d{4})%2F(\d{2})%2F(\d{2})/);

        if (dateMatch) {
          const [_, year, month, day] = dateMatch;
          const linkDate = new Date(year, month - 1, day); // month is 0-based
          const today = new Date();
          today.setHours(0,0,0,0); // Reset time portion for date comparison
          
          // Skip checking if date is before today
          if (linkDate < today) {
            await this.notificationState.removeLink(link);
          }
        } else {

          const matches = matchHtml(html, link);
          console.log(`Checking ${link}: ${matches}`);
          
          if (matches) {
            const [available, total] = matches.split("/");
            if (parseInt(available) > 0) {
              // Notify the user
              notifyAvailableSession(link);
              
              // Remove from the notification list
              await this.notificationState.removeLink(link);
            }
          } 
        }
        
        // If the notification list is now empty, stop checking
        if (this.notificationState.notifyList.length === 0) {
          this.isChecking = false;
          return;
        }
      }
      
      // Schedule the next check
      setTimeout(() => {
        this.isChecking = false;
        this.checkWebsite();
      }, CHECK_INTERVAL);
      
    } catch (error) {
      console.error('Error fetching the page:', error);
      this.isChecking = false;
    }
  }
}

// Export
export const websiteChecker = new WebsiteChecker();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    WebsiteChecker
  };
} 