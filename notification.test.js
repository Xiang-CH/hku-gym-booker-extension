// notification_test.js - Jest tests for notification functionality

// Mock Chrome API
global.chrome = {
  runtime: {
    onInstalled: {
      addListener: jest.fn()
    },
    onMessage: {
      addListener: jest.fn()
    }
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined)
    },
    session: {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined)
    }
  },
  notifications: {
    create: jest.fn(),
    clear: jest.fn(),
    onClicked: {
      addListener: jest.fn()
    }
  },
  tabs: {
    create: jest.fn()
  }
};

// Import functions to test
// Note: You'll need to modify background.js to export these functions
const { matchHtml, notifyPopup, checkWebsite } = require('./background');

// Mock HTML responses
const mockHtmlWithAvailability = `
<a class="text-default" href="/Form/SignUpPs?CenterID=10001&Date=2024%2F12%2F23&HourID=10124">
    <div class="row py-2 list-hover">
        <div class="col text-center">1715-1845</div>
        <div class="col text-center">5/20</div>
    </div>
</a>`;

// Mock HTML response with no availability
const mockHtmlNoAvailability = `
<a class="text-default" href="/Form/SignUpPs?CenterID=10001&Date=2024%2F12%2F23&HourID=10124">
    <div class="row py-2 list-hover">
        <div class="col text-center">1715-1845</div>
        <div class="col text-center">0/20</div>
    </div>
</a>`;

describe('Notification System Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default storage values
    chrome.storage.local.get.mockImplementation((key, callback) => {
      if (key === 'notify') {
        return Promise.resolve({ notify: ['/Form/SignUpPs?CenterID=10001&Date=2024%2F12%2F23&HourID=10124'] });
      }
      return Promise.resolve({});
    });
    
    chrome.storage.session.get.mockImplementation((key) => {
      if (key === 'checking') {
        return Promise.resolve({ checking: false });
      }
      return Promise.resolve({});
    });
    
    // Mock fetch for checkWebsite tests
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        text: () => Promise.resolve(mockHtmlWithAvailability)
      })
    );
  });

  test('matchHtml should extract availability from HTML with available slots', () => {
    const link = '/Form/SignUpPs?CenterID=10001&Date=2024%2F12%2F23&HourID=10124';
    const result = matchHtml(mockHtmlWithAvailability, link);
    expect(result).toBe('5/20');
  });

  test('matchHtml should extract availability from HTML with no available slots', () => {
    const link = '/Form/SignUpPs?CenterID=10001&Date=2024%2F12%2F23&HourID=10124';
    const result = matchHtml(mockHtmlNoAvailability, link);
    expect(result).toBe('0/20');
  });

  test('notifyPopup should create a notification with correct parameters', () => {
    const testUrl = '/Form/SignUpPs?CenterID=10001&Date=2024%2F12%2F23&HourID=10124';
    notifyPopup(testUrl);
    
    expect(chrome.notifications.create).toHaveBeenCalledWith(
      testUrl,
      {
        type: 'basic',
        iconUrl: 'logo.png',
        title: 'Gym Session Available!',
        message: 'Click here to book the session!',
        requireInteraction: true,
      },
      expect.any(Function)
    );
  });

  test('checkWebsite should process notification list and create notifications for available sessions', async () => {
    // Setup specific mocks for this test
    chrome.storage.session.get.mockImplementation((key) => {
      if (key === 'checking') {
        return Promise.resolve({ checking: false });
      }
      return Promise.resolve({});
    });
    
    chrome.storage.local.get.mockImplementation((key, callback) => {
      if (key === 'notify') {
        return Promise.resolve({ 
          notify: ['/Form/SignUpPs?CenterID=10001&Date=2024%2F12%2F23&HourID=10124'] 
        });
      }
      return Promise.resolve({});
    });
    
    // Call the function
    await checkWebsite();
    
    // Should set checking flag to true during execution
    expect(chrome.storage.session.set).toHaveBeenCalledWith({ checking: true });
    
    // Should create notification for available session
    expect(chrome.notifications.create).toHaveBeenCalled();
    
    // Should update notify list after processing
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ notify: [] });
  });
});
