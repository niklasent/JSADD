(() => {
    const CONSOLE_CLEAR_TIME_THRESHOLD_MS = 2000;
    var lastCallTime = undefined;

    console.clear = (function(old_console_clear) {
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
            old_console_clear();
            lastCallTime = thisCallTime;
        }
        return extendsConsoleClear;
    })(console.clear);
})();
