// Notification state management

/**
 * Class to manage notification state
 */
export class NotificationState {
  constructor() {
    this.isChecking = false;
    this.notifyList = [];
  }

  /**
   * Load notification list from storage
   * @returns {Promise<Array>} - Promise resolving to notification list
   */
  async loadNotifyList() {
    try {
      const result = await chrome.storage.local.get("notify");
      this.notifyList = result.notify || [];
      return this.notifyList;
    } catch (error) {
      console.error("Error loading notify list:", error);
      return [];
    }
  }

  /**
   * Save notification list to storage
   * @returns {Promise<boolean>} - Promise resolving to success status
   */
  async saveNotifyList() {
    try {
      await chrome.storage.local.set({ "notify": this.notifyList });
      return true;
    } catch (error) {
      console.error("Error saving notify list:", error);
      return false;
    }
  }

  /**
   * Add a link to the notification list
   * @param {string} link - The link to add
   * @returns {Promise<Object>} - Promise resolving to response object
   */
  async addLink(link) {
    await this.loadNotifyList();
    
    // Check if already in list
    if (this.notifyList.includes(link)) {
      this.notifyList.splice(this.notifyList.indexOf(link), 1);
      await this.saveNotifyList();
      return { 
        success: true, 
        removed: true, 
        message: "Removed from notify list!" 
      };
    }
    
    // Add to list
    this.notifyList.push(link);
    const success = await this.saveNotifyList();
    
    return {
      success,
      message: success ? "Notify list updated!" : "Failed to update notify list!"
    };
  }

  /**
   * Remove a link from the notification list
   * @param {string} link - The link to remove
   * @returns {Promise<boolean>} - Promise resolving to success status
   */
  async removeLink(link) {
    await this.loadNotifyList();
    
    if (this.notifyList.includes(link)) {
      this.notifyList.splice(this.notifyList.indexOf(link), 1);
      return await this.saveNotifyList();
    }
    
    return true; // Nothing to remove
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NotificationState
  };
} 