// Handles your frontend UI logic.

function disableSaveButton() {
  document.getElementById("savebutton").disabled = true;
  document.getElementById("savebutton").innerText = "🥳 Saved!";
}

function enableSaveButton() {
  document.getElementById("savebutton").disabled = false;
  document.getElementById("savebutton").innerText = "Save and Fill";
}

window.addEventListener("DOMContentLoaded", async function () {
  console.log("DOM is ready");

  chrome.storage.sync.get("user_data", function (data) {
    if (!data) {
      location.href = chrome.runtime.getURL("index.html");
    }

    console.log("Data retrieved", data);
    if (data.user_data) {
      const user_data = data.user_data;
      document.getElementById("name").value = user_data.name;
      document.getElementById("email").value = user_data.email;
      document.getElementById("studentNumber").value = user_data.studentNumber;
      disableSaveButton();
    }
  });

  document
    .getElementById("user_data")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const formEntries = Object.fromEntries(formData.entries());
      console.log("Form submitted", formEntries);

      chrome.storage.sync.set({ user_data: formEntries }, function () {
        console.log("Data saved");
        disableSaveButton();
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.sendMessage(
              tabs[0].id,
              { action: "fill" },
              function (response) {
                console.log(response);
              }
            );
          }
        );
      });
    });

  const input_elements = document.getElementsByClassName("user_input");
  for (let i = 0; i < input_elements.length; i++) {
    input_elements[i].addEventListener("input", function () {
      enableSaveButton();
    });
  }

  // scrape data
  const scraper = new BookingScraper();
  await scraper.scrapeEvents();

  const tabBtns = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tabBtns.length; i++) {
    tabBtns[i].addEventListener("click", function (e) {
      openTab(e, e.target.id, scraper.state);
    });
  }

  document
    .getElementById("dateSelector")
    .addEventListener("change", function (e) {
      showTimeSlots(e.target.value, scraper.state);
    });
});


function openTab(evt, tabName, state) {
  console.log("Tab clicked", evt, tabName);
  state.currentTab = tabName;
  events = state.getEvents();

  const dateSelector = document.getElementById("dateSelector");
  dateSelector.innerHTML = "";
  Object.keys(events).forEach(function (key) {
    console.log(events[key]);
    dateSelector.innerHTML += `<option value="${key}">${key}</option>`;
  });

  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  evt.currentTarget.className += " active";

  showTimeSlots(Object.keys(events)[0], state);
}

async function showTimeSlots(date, state) {
  events = state.getEvents();
  nofityList = (await chrome.storage.local.get("notify")).notify;
  console.log("Notify list", nofityList);

  // console.log("Date selected", date);
  // events[date][0].available = 0; // testing
  const timeSlots = events[date];
  // console.log("Time slots", timeSlots);

  const timeSlotContainer = document.getElementById("timeSlots");
  timeSlotContainer.innerHTML = "";

  timeSlots.forEach(function (slot) {
    timeSlotContainer.innerHTML += `<div class="timeslot">
      <p>${slot.time_slot} (${slot.available}/${slot.total})</p>
      ${
        slot.available > 0
          ? `<button href="${slot.link}" class="bookBtn">Book</button>`
          : slot.cancelled
          ? `<button class="cancelledBtn">Cancelled</button>`
          : nofityList.includes(slot.link)
          ? `<button href="${slot.link}" class="nofityBtn">Checking</button>`
          : `<button href="${slot.link}" class="nofityBtn">Notify</button>`
      } 
    </div>
    `;
  });

  const bookBtns = document.getElementsByClassName("bookBtn");
  for (let i = 0; i < bookBtns.length; i++) {
    bookBtns[i].addEventListener("click", function (e) {
      const path = e.target.getAttribute("href");
      console.log("Redirecting to", path);
      chrome.tabs.create({ url: "https://fcbooking.cse.hku.hk" + path });
    });
  }

  const notifyBtns = document.getElementsByClassName("nofityBtn");
  for (let i = 0; i < notifyBtns.length; i++) {
    notifyBtns[i].addEventListener("click", function (e) {
      const path = e.target.getAttribute("href");
      chrome.runtime.sendMessage({ type: "notify",  link: path}, function (response) {
        console.log(response);
        if (response.success) {
          e.target.innerText = "Checking";
        }
      })
    });
  }
}

// Constants
const LOCATIONS = {
  CSE: {
    id: "c10001Content",
    key: "cse-active",
  },
  B: {
    id: "c10002Content",
    key: "b-active",
  },
};

const TARGET_URL = "https://fcbooking.cse.hku.hk/";

// State management
class BookingState {
  constructor() {
    this.events = {
      "b-active": {},
      "cse-active": {},
    };
    this.currentTab = "b-active";
  }

  setEvents(locationKey, date, sessions) {
    this.events[locationKey][date] = sessions;
  }

  getEvents() {
    return this.events[this.currentTab];
  }
}

class SessionParser {
  static parseAvailability(text, link = null) {
    if (text.length > 20) {
      return null;
    }

    if (text.includes("FULL")) {
      return { available: 0, total: 0 };
    }

    if (text.includes("Session Cancelled")) {
      return { available: 0, total: 0, cancelled: true };
    }

    if (text.includes("/")) {
      const [available, total] = text.split("/").map((num) => parseInt(num));
      return { available: available, total: total, link };
    }

    return null;
  }

  static isDateHeader(text) {
    return text.includes(" (") && text.length < 40;
  }

  static isTimeSlot(text) {
    return text.includes("-") && text.length < 10;
  }
}

class BookingDataExtractor {
  constructor() {
    this.gymPlace = [];
    this.dayFromToday = -1;
  }

  processLine(line, link = null) {
    line = line.trim();

    if (SessionParser.isDateHeader(line)) {
      this.dayFromToday++;
      this.gymPlace.push({ date: line, id: this.dayFromToday });
      return;
    }

    if (SessionParser.isTimeSlot(line)) {
      if (!this.gymPlace[this.dayFromToday].sessions) {
        this.gymPlace[this.dayFromToday].sessions = [];
      }
      this.gymPlace[this.dayFromToday].sessions.push({ time_slot: line });
      return;
    }

    const availability = SessionParser.parseAvailability(line, link);
    if (availability) {
      console.log("Availability", line);
      const currentSession =
        this.gymPlace[this.dayFromToday].sessions[
          this.gymPlace[this.dayFromToday].sessions.length - 1
        ];
      Object.assign(currentSession, availability);
    }
  }

  extract(lines, links) {
    this.gymPlace = [];
    this.dayFromToday = -1;

    lines.forEach((line) => {
      const link =
        links.length > 0 ? links[links.length - 1].getAttribute("href") : null;
      this.processLine(line, link);
      if (SessionParser.parseAvailability(line)) {
        links.pop();
      }
    });

    return this.gymPlace;
  }
}

class BookingScraper {
  constructor() {
    this.state = new BookingState();
    this.extractor = new BookingDataExtractor();
  }

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

  getContentData(doc, locationId) {
    const content = doc.getElementById(locationId);
    return {
      lines: content.textContent.split("\n"),
      links: Array.from(content.querySelectorAll("a")),
    };
  }

  async scrapeEvents() {
    try {
      const doc = await this.fetchAndParse(TARGET_URL);

      for (const location of Object.values(LOCATIONS)) {
        const { lines, links } = this.getContentData(doc, location.id);
        const data = this.extractor.extract(lines, [...links].reverse());

        for (const dayEntry of data) {
          this.state.setEvents(location.key, dayEntry.date, dayEntry.sessions);
        }
      }

      this.updateUI();
    } catch (error) {
      console.error("Error scraping events:", error);
      throw error;
    }
  }

  updateUI() {
    const tabBtns = document.getElementsByClassName("tablinks");
    openTab({ currentTarget: tabBtns[0] }, tabBtns[0].id, this.state);

    document.getElementById("tabcontent").style.display = "block";
    document.getElementById("loader_container").style.display = "none";
  }
}
