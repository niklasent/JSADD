(() => {
    window.onmessage = (msg) => {
        chrome.storage.sync.set({[location.href + "_ADT"]: msg.data});
    };
})();