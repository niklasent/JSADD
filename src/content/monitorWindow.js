(() => {
    const originalWindow = { ...window };
    const monitoredProperties = ["innerWidth", "outerWidth", "innerHeight", "outerHeight"];

    var monitoringStatus = {
        "innerWidth": false,
        "outerWidth": false,
        "innerHeight": false,
        "outerHeight": false
    };
  
    monitoredProperties.forEach((prop) => {
        Object.defineProperty(window, prop, {
            get: function () {
                monitoringStatus[prop] = true;
                if (monitoringStatus["innerWidth"] && monitoringStatus["outerWidth"] && monitoringStatus["innerHeight"] && monitoringStatus["outerHeight"]) {
                    var msg = {
                        req: "ADT",
                        data: ["widthdiff"]
                    };
                    window.postMessage(msg);
                }
                return originalWindow[prop];
            },
        });
    });
})();