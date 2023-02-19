var scriptidentifier = 0;
var portTabMap = {};
var callFrameIDsTabMap = {};

// Clear variables at startup.
chrome.runtime.onStartup.addListener(() => {
    scriptidentifier = 0;
    portTabMap = {};
    callFrameIDsTabMap = {};
    chrome.storage.local.clear();
    chrome.storage.sync.clear();
});

// Get extension badge of the current tab after tab activation and update.
chrome.tabs.onActivated.addListener((activeInfo) => {
    updateBadge(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === "complete") updateBadge(tabId);
});


// Handle requests from content scripts.
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    // Tell content scripts the tab ID whenever requested.
    if (msg.req === "tabId") {
        sendResponse({tabId: sender.tab.id});
    }
    else if (msg.req === "badgeUpdate") {
        updateBadge(sender.tab.id);
    }
});

// Register event listener for triggered breakpoints.
chrome.debugger.onEvent.addListener((src, method, params) => {
    if (method === "Debugger.paused") {
        for (const callFrame of params.callFrames) {
            if (!callFrameIDsTabMap[src.tabId]) callFrameIDsTabMap[src.tabId] = [];
            if (callFrameIDsTabMap[src.tabId].includes(callFrame.callFrameId)) {
                portTabMap[src.tabId].postMessage({adt: "trigbreak"});
                return;
            }
            else (callFrameIDsTabMap[src.tabId].push(callFrame.callFrameId));
        }
        chrome.debugger.sendCommand(src, "Debugger.resume");
    }
});


// Set up long-lived connection.
chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name === "adt_background_check");
    port.onMessage.addListener(function(msg) {
        portTabMap[msg.tabId] = port;
        if (msg.req === "trigbreak") {
            checkTrigBreak(msg.tabId);
        }
    });
});

// Start scripts that need to be executed BEFORE page load.
chrome.webNavigation.onCommitted.addListener((tab) => {
    // Register content scripts.
    chrome.scripting.registerContentScripts([{
        id: (scriptidentifier++).toString() + "_modifyEventTargets",
        matches: ["http://*/*", "https://*/*"],
        js: ['./src/content/modifyEventTargets.js'],
        world: 'MAIN',
        runAt: "document_start"
    }, {
        id: (scriptidentifier++).toString() + "_modifyConsole",
        matches: ["http://*/*", "https://*/*"],
        js: ['./src/content/modifyConsole.js'],
        world: 'MAIN',
        runAt: "document_start"
    }, {
        id: (scriptidentifier++).toString() + "_builtinWrapper",
        matches: ["http://*/*", "https://*/*"],
        js: ['./src/content/builtinWrapper.js'],
        world: 'MAIN',
        runAt: "document_start"
    }, {
        id: (scriptidentifier++).toString() + "_monitorWindow",
        matches: ["http://*/*", "https://*/*"],
        js: ['./src/content/monitorWindow.js'],
        world: 'MAIN',
        runAt: "document_start"
    }]);
});

// Start scripts that need to be executed AFTER page load.
chrome.webNavigation.onCompleted.addListener((tab) => {
    // Register content scripts.
    chrome.scripting.registerContentScripts([{
        id: (scriptidentifier++).toString() + "_scanTechniques",
        matches: ["http://*/*", "https://*/*"],
        js: ['./src/content/scanTechniques.js'],
        world: 'MAIN'
    }]);
});

/* Functions for ADT detection */
function checkTrigBreak(tabId) {
    // Attach and enable debugger.
    chrome.debugger.attach({ tabId: tabId }, "1.3", () => {
        console.log("Attaching...", tabId);
        if (chrome.runtime.lastError) {
            console.log('runtime.lastError', tabId, chrome.runtime.lastError.message);
            return;
        }
        console.log("Debugger attached", tabId);
        chrome.debugger.sendCommand({
            tabId: tabId
        }, "Debugger.enable", {}, (result) => {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError.message);
            }
        });
    });
    // Detach debugger after *2 seconds*.
    setTimeout(() => {
        chrome.debugger.detach({ tabId: tabId });
    }, 2000);
}

/* Functions for message handling */
function updateBadge(tabId) {
    chrome.tabs.sendMessage(tabId, { req: "badge" }, (response) => {
        if (response) {
            if (response.count === 0) {
                chrome.action.setBadgeBackgroundColor({color: 'green'});
                chrome.action.setIcon({path: '../assets/icons/benign_16.png', tabId: tabId});
            }
            else {
                if (response.count === 1) chrome.action.setBadgeBackgroundColor({color: 'yellow'});
                else chrome.action.setBadgeBackgroundColor({color: 'red'});
                chrome.action.setIcon({path: '../assets/icons/malicious_16.png', tabId: tabId});
            }
            chrome.action.setBadgeText({text: response.count.toString()});
        }
        else if (chrome.runtime.lastError) {
            chrome.action.setBadgeBackgroundColor({color: 'blue'});
            chrome.action.setBadgeText({text: "?"});
        }
        return true;
    });
}