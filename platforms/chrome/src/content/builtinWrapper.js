(() => {
    // Use JS Proxies for ModBuilt.
    const modbuiltHandler = {
        set(target, prop, receiver) {
            if (typeof receiver === 'function') {
                var msg = {
                    req: "ADT",
                    data: ["modbuilt"]
                };
                window.postMessage(msg);
            }
        }
    };

    console = new Proxy(console, modbuiltHandler);
    String = new Proxy(String, modbuiltHandler);
    JSON = new Proxy(JSON, modbuiltHandler);
})();