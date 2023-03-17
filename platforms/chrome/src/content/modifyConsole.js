(() => {
    // Modify console.clear function for ConClear detection.
    const CONSOLE_CLEAR_TIME_THRESHOLD_MS = 2000;
    var lastCallTime = undefined;

    console.clear = (function(originalConsoleClear) {
        function extendsConsoleClear() {
            var thisCallTime = performance.now();
            if (lastCallTime) {
                if ((thisCallTime - lastCallTime) < CONSOLE_CLEAR_TIME_THRESHOLD_MS) {
                    var msg = {
                        req: "ADT",
                        data: ["conclear"]
                    };
                    window.postMessage(msg);
                }
            }
            originalConsoleClear();
            lastCallTime = thisCallTime;
        }
        return extendsConsoleClear;
    })(console.clear);

    // Modify console functions for LogGet detection.
    const EXCLUDED_FUNCTIONS = ["clear", "count", "countReset", "group", "groupCollapsed", "groupEnd", "time", "timeEnd"];

    for (let key in console) {
        if (typeof console[key] === "function" && !(EXCLUDED_FUNCTIONS.includes(key))) {
            console.log(key);
            var originalConsoleFunction = console[key];
            console[key] = function(...args) {
                args.forEach((argument) => {
                    if (argument !== undefined) {
                        if (argument.toString !== undefined) {
                            if (argument.hasOwnProperty("toString")) {
                                var msg = {
                                    req: "ADT",
                                    data: ["logget"]
                                };
                                window.postMessage(msg);
                            }
                        }
                        if (typeof argument.id === "function") {
                            var msg = {
                                req: "ADT",
                                data: ["logget"]
                            };
                            window.postMessage(msg);
                        }
                    }
                });
                try {originalConsoleFunction.apply(console, args);}
                catch(e){}
            }
        };
    };
})();
