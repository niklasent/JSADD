(() => {
    if (globalThis.Firebug) {
        if (globalThis.Firebug.chrome) {
            const originalFirebug = globalThis.Firebug.chrome.isInitialized;
            
            Object.defineProperty(globalThis.Firebug.chrome, "isInitialized", {
                get: function () {
                    var msg = {
                        req: "ADT",
                        data: ["firebug"]
                    }
                    window.postMessage(msg);
                    return originalFirebug;
                }
            });
        }
    }
})();