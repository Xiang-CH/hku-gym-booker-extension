// background.js

const TARGET_URL = "https://fcbooking.cse.hku.hk/";

chrome.runtime.onInstalled.addListener(async () => {
    console.log("Extension installed!");


    // Create an alarm to refresh the page every 5 minutes
    
    // notifyPopup("/Form/SignUpPs?CenterID=10001&Date=2024%2F12%2F23&HourID=10124")
    chrome.storage.session.set({"checking": false});
    checkWebsite();
});

chrome.notifications.onClicked.addListener(function (notificationId) {
    const link = "https://fcbooking.cse.hku.hk" + notificationId;
    chrome.tabs.create({ url: link });
    chrome.notifications.clear(notificationId);
});

function notifyPopup(url) {
    chrome.notifications.create(
        url,
        {
            type: "basic",
            iconUrl: "logo.png",
            title: "Gym Session Available!",
            message: "Click here to book the session!",
            requireInteraction: true,
        },
        function () {
            console.log("Notification created!");
        }
    );
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type == "notify") {
            // Keep message channel open

            (async () => {
                try {
                    const notifyList = (await chrome.storage.local.get("notify")).notify;
                    const notify = notifyList || [];

                    if (notify.includes(request.link)) {
                        console.log("Already in notify list!");
                        sendResponse({success: false, message: "Already in notify list!"});
                        return;
                    }

                    notify.push(request.link);
                    await chrome.storage.local.set({"notify": notify });
                    console.log("Notify list updated!", notify);
                    sendResponse({success: true, message: "Notify list updated!"});
                    checkWebsite();
                } catch (error) {
                    console.error(error);
                    sendResponse({success: false, message: error.message});
                }
            })();
            return true; // Keep message channel open
        }
    }
);

async function checkWebsite() {
    let CHECKING = (await chrome.storage.session.get("checking")).checking;
    console.log("Checking website...", CHECKING);
    if (CHECKING) {
        return;
    }

    chrome.storage.local.get("notify", function (notifyList) {
        if (!notifyList) {
            chrome.storage.session.set({"checking": false});
            return;
        }

        chrome.storage.session.set({"checking": true});
        const notify = notifyList.notify || [];
        
        fetch(TARGET_URL)
            .then(response => response.text())
            .then(html => {
                notify.forEach(link => {
                    const matches = matchHtml(html, link);
                    console.log(matches);
                    if (matches) {
                        available = parseInt(matches.split("/")[0]);
                        if (available > 0) {
                            notifyPopup(link);
                            notify.splice(notify.indexOf(link), 1);
                            chrome.storage.local.set({"notify": notify});
                            if (notify.length === 0) {
                                chrome.storage.session.set({"checking": false});
                                return
                            }
                        }
                    } else {
                        notify.splice(notify.indexOf(link), 1);
                        chrome.storage.local.set({"notify": notify});
                        if (notify.length === 0) {
                            chrome.storage.session.set({"checking": false});
                            return
                        }
                    }
                    setTimeout(() => {
                        checkWebsite();
                    }, 5000);
                });
            })
            .catch(error => {
                console.error('Error fetching the page:', error);
            })

    });
}

function matchHtml(htmlString, href) {
    // <a class="text-default" href="${link}">
    //     <div class="row py-2 list-hover">
    //          <div class="col text-center">1715-1845</div>
    //          <div class="col text-center">TO_MATCH</div>
    //     </div>
    // </a>
    href = href.replaceAll("/", "\\/").replaceAll("?", "\\?").replaceAll("&", "&amp;");
    console.log(href);

    const pattern = new RegExp(`<a class="text-default" href="${href}">[\\s\\S]*?<div class="row py-2 list-hover">[\\s\\S]*?<div class="col text-center">(.*?)<\\/div>[\\s\\S]*?<div class="col text-center">(.*?)<\\/div>[\\s\\S]*?<\\/div>[\\s\\S]*?<\\/a>`, 'gm');
    // const matches = htmlString.match(pattern);
    const matches = pattern.exec(htmlString);
    return matches ? matches[2] : "";
}

