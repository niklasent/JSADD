const antiDebuggingTechniqueChecks = {
    "shortcut": checkShortCut,
    "trigbreak": checkTrigBreak,
    "conclear": checkConClear,
    "modbuilt": checkModBuilt,
    "widthdiff": checkWidthDiff,
    "logget": checkLogGet
};

(() => {
    var detectedADTs = [];
    Object.keys(antiDebuggingTechniqueChecks).forEach((key) => {
        if (antiDebuggingTechniqueChecks[key]()) {
            detectedADTs.push(key);
        }
    });
    var msg = {
        req: "ADT",
        data: detectedADTs
    };
    window.postMessage(msg);
})();

/* Anti-Debugging Detection functions */
function checkShortCut() {
    var detected = false;

    // Collect all event listeners
    let eventListeners = listAllEventListeners();

    // Check event behavior for applicable event listeners.
    eventListeners.forEach((eventListener) => {
        if(eventListener.type === "keydown") {
            eventListener.node.addEventListener("keydown", function(e) {
                detected = e.defaultPrevented ? true : detected;
            });
            var evt = new Event("keydown", {cancelable: true});
            // Simulate F12 key press.
            evt.code = "F12";
            evt.ctrlKey = false;
            evt.altKey = false;
            eventListener.node.dispatchEvent(evt);
            // Simulate Ctrl-I key press.
            evt.code = "KeyI";
            evt.ctrlKey = true;
            evt.altKey = false;
            eventListener.node.dispatchEvent(evt);
            // Simulate Alt-I key press.
            evt.code = "KeyI";
            evt.ctrlKey = false;
            evt.altKey = true;
            eventListener.node.dispatchEvent(evt);
            // Simulate Ctrl-J key press.
            evt.code = "KeyJ";
            evt.ctrlKey = true;
            evt.altKey = false;
            eventListener.node.dispatchEvent(evt);
            // Simulate Alt-J key press.
            evt.code = "KeyJ";
            evt.ctrlKey = false;
            evt.altKey = true;
            eventListener.node.dispatchEvent(evt);
            // Simulate Ctrl-U key press.
            evt.code = "KeyU";
            evt.ctrlKey = true;
            evt.altKey = false;
            eventListener.node.dispatchEvent(evt);
            // Simulate Alt-U key press.
            evt.code = "KeyU";
            evt.ctrlKey = false;
            evt.altKey = true;
            eventListener.node.dispatchEvent(evt);
        }
        else if (eventListener.type === "contextmenu") {
            eventListener.node.addEventListener("contextmenu", function(e) {
                detected = e.defaultPrevented ? true : detected;
            });
            var evt = new Event("contextmenu", {cancelable: true});
            // Simulate right click.
            eventListener.node.dispatchEvent(evt);
        }
        else {
            return;
        }
    });

    return detected;
};

function checkTrigBreak() {
    var msg = {
        req: "trigbreak"
    };
    window.postMessage(msg);

    return undefined; // Checked by background script.
};

function checkConClear() {
    var detected = true;

    return detected;
};

function checkModBuilt() {
    var detected = true;

    return detected;   
}

function checkWidthDiff() {
    var detected = true;

    return detected;
};

function checkLogGet() {
    var detected = true;

    return detected;
};

/* Helper functions */
// Source: https://www.sqlpac.com/en/documents/javascript-listing-active-event-listeners.html
function listAllEventListeners() {
    const allElements = Array.prototype.slice.call(document.querySelectorAll('*'));
    allElements.push(document);
    allElements.push(window);
  
    const types = [];
  
    for (let ev in window) {
        if (/^on/.test(ev)) types[types.length] = ev;
    }
  
    let elements = [];
    for (let i = 0; i < allElements.length; i++) {
        const currentElement = allElements[i];
  
        // Events defined in attributes
        for (let j = 0; j < types.length; j++) {
            if (typeof currentElement[types[j]] === 'function') {
                elements.push({
                    "node": currentElement,
                    "type": types[j],
                    "func": currentElement[types[j]]
                });
            }
        }

        if (typeof currentElement._getEventListeners === 'function') {
            var evts = currentElement._getEventListeners();
            if (Object.keys(evts).length >0) {
                for (let evt of Object.keys(evts)) {
                    for (k=0; k < evts[evt].length; k++) {
                        elements.push({
                            "node": currentElement,
                            "type": evt,
                            "func": evts[evt][k].listener
                        });
                    }
                }
            }
        }
    }
  
    return elements.sort();
}