var scriptidentifier = 0;
var portTabMap = {};
var callFrameIDsTabMap = {};

// Clear variables at startup.
chrome.runtime.onStartup.addListener(() => {
    scriptidentifier = 0;
    portTabMap = {};
    callFrameIDsTabMap = {};
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

// Tell content scripts the tab ID whenever requested.
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.req === "tabId") {
        sendResponse({tabId: sender.tab.id});
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
        id: scriptidentifier.toString() + "_modifyEventTargets",
        matches: ["<all_urls>"],
        js: ['./src/content/modifyEventTargets.js'],
        world: 'MAIN',
        runAt: "document_start"
    }]);
    scriptidentifier++;
});

// Start scripts that need to be executed AFTER page load.
chrome.webNavigation.onCompleted.addListener((tab) => {
    // Register content scripts.
    chrome.scripting.registerContentScripts([{
        id: scriptidentifier.toString() + "_scanTechniques",
        matches: ["<all_urls>"],
        js: ['./src/content/scanTechniques.js'],
        world: 'MAIN',
        runAt: "document_end"
    }]);
    scriptidentifier++;
});

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
    // Detach debugger after *2 seconds* and return result.
    setTimeout(() => {
        chrome.debugger.detach({ tabId: tabId });
    }, 2000);
}
