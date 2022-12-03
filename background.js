chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if ((changeInfo.status == 'complete') && tab.url) {
        chrome.tabs.sendMessage(tabId, {
            url: tab.url
        });
    }
});

