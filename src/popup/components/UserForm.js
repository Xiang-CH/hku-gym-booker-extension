// User form component

/**
 * Class to handle user form functionality
 */
export class UserForm {
  constructor() {
    this.formElement = document.getElementById('user_data');
    this.nameInput = document.getElementById('name');
    this.emailInput = document.getElementById('email');
    this.studentNumberInput = document.getElementById('studentNumber');
    this.saveButton = document.getElementById('savebutton');
    
    this.initialize();
  }

  /**
   * Initialize the form with event listeners and load saved data
   */
  initialize() {
    // Load saved user data
    this.loadSavedData();
    
    // Add event listeners
    this.formElement.addEventListener('submit', this.handleSubmit.bind(this));
    
    const inputElements = document.getElementsByClassName('user_input');
    for (let i = 0; i < inputElements.length; i++) {
      inputElements[i].addEventListener('input', this.enableSaveButton.bind(this));
    }
  }

  /**
   * Load saved user data from storage
   */
  loadSavedData() {
    chrome.storage.sync.get("user_data", (data) => {
      if (!data || !data.user_data) return;
      
      const userData = data.user_data;
      this.nameInput.value = userData.name || '';
      this.emailInput.value = userData.email || '';
      this.studentNumberInput.value = userData.studentNumber || '';
      this.disableSaveButton();
    });
  }

  /**
   * Handle form submission
   * @param {Event} event - The submit event
   */
  handleSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const formEntries = Object.fromEntries(formData.entries());
    
    chrome.storage.sync.set({ user_data: formEntries }, () => {
      this.disableSaveButton();
      this.sendFillMessage();
    });
  }

  /**
   * Send a message to fill the form on the active tab
   */
  sendFillMessage() {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      (tabs) => {
        if (!tabs || !tabs[0] || !tabs[0].id) return;
        
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "fill" },
          (response) => {
            // Handle response if needed
          }
        );
      }
    );
  }

  /**
   * Disable the save button and update its text
   */
  disableSaveButton() {
    this.saveButton.disabled = true;
    this.saveButton.innerText = "🥳 Saved!";
  }

  /**
   * Enable the save button and update its text
   */
  enableSaveButton() {
    this.saveButton.disabled = false;
    this.saveButton.innerText = "Save and Fill";
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    UserForm
  };
} 