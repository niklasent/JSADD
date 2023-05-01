var active = true;
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

// Update extension badge of the current tab after tab activation and update.
chrome.tabs.onActivated.addListener((activeInfo) => {
    updateBadge(activeInfo.tabId);
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === "complete") updateBadge(tabId);
});

// Handle requests from content scripts.
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (active) {
        // Respond the tab ID whenever requested.
        if (msg.req === "tabId") {
            sendResponse({tabId: sender.tab.id});
        }
        // Update badge whenever requested.
        else if (msg.req === "badgeUpdate") {
            updateBadge(sender.tab.id);
        }
    }
});

// Register event listener for triggered breakpoints.
chrome.debugger.onEvent.addListener((src, method, params) => {
    if (active) {
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
    }
});

// Set up long-lived connection for ADT background check.
chrome.runtime.onConnect.addListener(async function(port) {
    if (port.name === "adt_background_check") {
        port.onMessage.addListener(async function(msg) {
            portTabMap[msg.tabId] = port;
            if (msg.req === "trigbreak") {
                var debuggerDisabled = (await chrome.storage.sync.get({ noDebugger: false })).noDebugger;
                if (!debuggerDisabled) checkTrigBreak(msg.tabId);
            }
        });
    }
    else if (port.name === "popup_port") {
        port.onMessage.addListener(async function(msg) {
            active = msg.state;
            await updateBadge(msg.tabId);
        });
    }
});

// Register content scripts before page load.
chrome.webNavigation.onCommitted.addListener((tab) => {
    if (tab.frameId === 0 && active) {
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
        }, {
            id: (scriptidentifier++).toString() + "_monitorFirebug",
            matches: ["http://*/*", "https://*/*"],
            js: ['./src/content/monitorFirebug.js'],
            world: 'MAIN',
            runAt: "document_end"
        }]);
    }
});

// Register content scripts after page load.
chrome.webNavigation.onCompleted.addListener((tab) => {
    if (tab.frameId === 0 && active) {
        // Register content scripts.
        chrome.scripting.registerContentScripts([{
            id: (scriptidentifier++).toString() + "_scanTechniques",
            matches: ["http://*/*", "https://*/*"],
            js: ['./src/content/scanTechniques.js'],
            world: 'MAIN'
        }]);
    }
});

/* Functions for ADT detection */
function checkTrigBreak(tabId) {
    // Attach and enable debugger.
    chrome.debugger.attach({ tabId: tabId }, "1.3", () => {
        // console.log("Attaching...", tabId);
        if (chrome.runtime.lastError) {
            console.log('runtime.lastError', tabId, chrome.runtime.lastError.message);
            return;
        }
        // console.log("Debugger attached", tabId);
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
async function updateBadge(tabId) {
    var badgeText = "";
    var showBadge = (await chrome.storage.sync.get({ showBadge: true })).showBadge;
    active = (await chrome.storage.sync.get({ active: true })).active;
    if (active) {
        chrome.tabs.sendMessage(tabId, { req: "badge" }, (response) => {
            if (response) {
                if (showBadge) badgeText = response.count.toString();
                chrome.action.setBadgeText({text: badgeText, tabId: tabId});
                if (response.count === 0) {
                    chrome.action.setBadgeBackgroundColor({color: 'green', tabId: tabId});
                    chrome.action.setIcon({path: '../assets/icons/benign_16.png', tabId: tabId});
                }
                else {
                    if (response.count === 1) chrome.action.setBadgeBackgroundColor({color: 'yellow', tabId: tabId});
                    else chrome.action.setBadgeBackgroundColor({color: 'red', tabId: tabId});
                    chrome.action.setIcon({path: '../assets/icons/malicious_16.png', tabId: tabId});
                }
            }
            else if (chrome.runtime.lastError) {
                if (showBadge) badgeText = "?";
                chrome.action.setBadgeText({text: badgeText, tabId: tabId});
                chrome.action.setBadgeBackgroundColor({color: 'blue', tabId: tabId});
            }
            return true;
        });
    }
    else {
        chrome.action.setBadgeText({text: badgeText, tabId: tabId});
        chrome.action.setIcon({path: '../assets/icons/jsadd_16.png', tabId: tabId});
    }
}