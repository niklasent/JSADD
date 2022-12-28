var scriptidentifier = 0;

// Start scripts that need to be executed BEFORE page load.
chrome.webNavigation.onCommitted.addListener((tab) => {
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
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if ((changeInfo.status == 'complete') && tab.url) {
        chrome.scripting.registerContentScripts([{
            id: scriptidentifier.toString() + "_scanTechniques",
            matches: ["<all_urls>"],
            js: ['./src/content/scanTechniques.js'],
            world: 'MAIN',
            runAt: "document_end"
        }]);
        scriptidentifier++;
    }
});
