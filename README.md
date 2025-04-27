# HKU Gym Booker Chrome Extension

A Chrome extension to automatically fill HKU gym booking forms and notify when sessions become available.

<img width="1125" alt="Screenshot 2025-01-31 at 12 17 46 AM" src="https://github.com/user-attachments/assets/92ba3e0a-9ea7-494c-abae-e47ef545f3a2" />

## Features

- Automatically fill HKU gym booking forms with saved user data
- Notify when gym sessions become available
- User-friendly interface for selecting and monitoring sessions


## Project Structure

The extension is organized into a modular structure for better maintainability:

```
.
├── src/                         # Source code directory
│   ├── background.js            # Main entry point for background script
│   ├── background/              # Background services
│   │   ├── messageHandler.js    # Handles extension messages
│   │   └── websiteChecker.js    # Checks website for availability
│   ├── content/                 # Content scripts
│   │   └── fillForm.js          # Form filling functionality
│   ├── models/                  # Data models
│   │   └── NotificationState.js # Manages notification state
│   ├── popup/                   # Popup UI components
│   │   ├── components/          # UI components
│   │   │   ├── Feedback.js      # Feedback link component
│   │   │   ├── SessionsView.js  # Sessions display component
│   │   │   └── UserForm.js      # User form component
│   │   ├── models/              # Popup models
│   │   │   └── BookingModel.js  # Booking data model
│   │   ├── services/            # Popup services
│   │   │   ├── DataFetcher.js   # Data fetching service
│   │   │   └── DataParser.js    # Data parsing service
│   │   └── popup.js             # Main popup script
│   └── utils/                   # Utility functions
│       ├── constants.js         # Global constants
│       ├── htmlParser.js        # HTML parsing utilities
│       └── notifications.js     # Notification utilities
├── index.html                   # Popup UI
├── logo.png                     # Extension icon
├── manifest.json                # Extension configuration
├── style.css                    # CSS styling
└── package.json                 # Development dependencies
```