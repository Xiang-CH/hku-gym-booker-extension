// Sessions view component

/**
 * Class to handle the sessions view functionality
 */
export class SessionsView {
  /**
   * @param {BookingState} state - The booking state
   */
  constructor(state) {
    this.state = state;
    this.tabContent = document.getElementById('tabcontent');
    this.dateSelector = document.getElementById('dateSelector');
    this.timeSlots = document.getElementById('timeSlots');
    this.loader = document.getElementById('loader_container');
    this.clearButton = document.getElementById('clearNotifications');
    
    this.initialize();
  }

  /**
   * Initialize the sessions view with event listeners
   */
  initialize() {
    // Add event listeners for tabs
    const tabBtns = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tabBtns.length; i++) {
      tabBtns[i].addEventListener('click', (e) => {
        this.openTab(e, e.target.id);
      });
    }
    
    // Add event listener for date selector
    this.dateSelector.addEventListener('change', (e) => {
      this.showTimeSlots(e.target.value);
    });

    // Add event listener for clear notifications button
    this.clearButton.addEventListener('click', () => {
      this.clearNotifications();
    });
  }

  /**
   * Show the UI after data is loaded
   */
  showUI() {
    const tabBtns = document.getElementsByClassName('tablinks');
    this.openTab({ currentTarget: tabBtns[0] }, tabBtns[0].id);
    
    this.tabContent.style.display = "block";
    this.loader.style.display = "none";
  }

  /**
   * Hide the UI while loading
   */
  hideUI() {
    this.tabContent.style.display = "none";
    this.loader.style.display = "flex";
  }

  /**
   * Handle tab switching
   * @param {Event} evt - The click event
   * @param {string} tabName - The tab ID
   */
  openTab(evt, tabName) {
    this.state.currentTab = tabName;
    const events = this.state.getEvents();
    
    // Clear and populate date selector
    this.dateSelector.innerHTML = "";
    Object.keys(events).forEach((key) => {
      this.dateSelector.innerHTML += `<option value="${key}">${key}</option>`;
    });
    
    // Update active tab styling
    const tablinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(' active', '');
    }
    evt.currentTarget.className += ' active';
    
    // Show time slots for the first date
    if (Object.keys(events).length > 0) {
      this.showTimeSlots(Object.keys(events)[0]);
    }
  }

  /**
   * Display time slots for a specific date
   * @param {string} date - The date to show slots for
   */
  async showTimeSlots(date) {
    const events = this.state.getEvents();
    const storageData = await chrome.storage.local.get('notify');

    const notifyList = storageData.notify || [];
    const timeSlots = events[date];
    this.timeSlots.innerHTML = '';
    
    // Create and display each time slot
    timeSlots.forEach((slot) => {
      this.timeSlots.innerHTML += this.createTimeSlotHTML(slot, notifyList);
    });
    
    // Add event listeners for buttons
    this.addBookButtonListeners();
    this.addNotifyButtonListeners();
  }

  /**
   * Create HTML for a time slot
   * @param {Object} slot - The time slot data
   * @param {Array} notifyList - List of slots being watched
   * @returns {string} - HTML for the time slot
   */
  createTimeSlotHTML(slot, notifyList) {
    return `<div class="timeslot">
      <p>${slot.time_slot} (${slot.available}/${slot.total})</p>
      ${slot.available > 0
        ? `<button href="${slot.link}" class="bookBtn">Book</button>`
        : slot.cancelled
          ? `<button class="cancelledBtn">Cancelled</button>`
          : notifyList.includes(slot.link)
            ? `<button href="${slot.link}" class="nofityBtn">Checking</button>`
            : `<button href="${slot.link}" class="nofityBtn">Notify</button>`
      } 
    </div>`;
  }

  /**
   * Add event listeners to book buttons
   */
  addBookButtonListeners() {
    const bookBtns = document.getElementsByClassName('bookBtn');
    for (let i = 0; i < bookBtns.length; i++) {
      bookBtns[i].addEventListener('click', (e) => {
        const path = e.target.getAttribute('href');
        chrome.tabs.create({ url: 'https://fcbooking.cse.hku.hk' + path });
      });
    }
  }

  /**
   * Add event listeners to notify buttons
   */
  addNotifyButtonListeners() {
    const notifyBtns = document.getElementsByClassName('nofityBtn');
    for (let i = 0; i < notifyBtns.length; i++) {
      notifyBtns[i].addEventListener('click', (e) => {
        const path = e.target.getAttribute('href');
        chrome.runtime.sendMessage(
          { type: 'notify', link: path },
          (response) => {
            if (response && response.success) {
              e.target.innerText = response.removed ? 'Notify' : 'Checking';
            } else {
              console.error('Failed to update notification status:', response?.message || 'Unknown error');
            }
          }
        );
      });
    }
  }

  /**
   * Clear all notifications from storage
   */
  async clearNotifications() {
    await chrome.storage.local.set({ notify: [] });
    // Refresh the current view to update the UI
    const currentDate = this.dateSelector.value;
    if (currentDate) {
      this.showTimeSlots(currentDate);
    }
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SessionsView
  };
} 