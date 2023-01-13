(async () => {
    var siteADTs = [];

    // Obtain tab ID.
    const tab = await chrome.runtime.sendMessage({ req: "tabId" });
    const tabIdentifier = tab.tabId;

    // Set up communication with background script. Update storage for reported ADTs.
    var port = chrome.runtime.connect({name: "adt_background_check"});
    port.onMessage.addListener(function(msg) {
        if (!siteADTs.includes(msg.adt)) {
            siteADTs.push(msg.adt);
            updateStorage(siteADTs);
        }
    });

    // Communication with other content scritps.
    window.onmessage = (msg) => {
        // Update storage for reported ADTs.
        if (msg.data.req === "ADT") {
            for (adt of msg.data.data) {
                if (!siteADTs.includes(adt)) {
                    siteADTs.push(adt);
                    updateStorage(siteADTs);
                }
            }
        }
        // Forward ADT check requests to background.
        else {
            let adt = msg.data.req;
            port.postMessage({req: adt, tabId: tabIdentifier});
        }
    };
})();

function updateStorage(data) {
    let key = location.href + "_ADT";
    let storage = chrome.storage.local;
    // let storage = chrome.storage.sync;
    storage.get(key, (items) => {
        if (items[key] != undefined) storage.remove(key);
        storage.set({[key]: data})
    });
}