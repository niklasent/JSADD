const antiDebuggingTechniqueChecks = {
    "shortcut": checkShortCut,
    "trigbreak": checkTrigBreak,
    "conclear": checkShortCut,
    "modbuilt": checkModBuilt,
    "widthdiff": checkWidthDiff,
    "logget": checkLogGet
};

(() => {
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const webURL = obj.url;
        console.log(webURL);
        var detectedADTs = [];
        Object.keys(antiDebuggingTechniqueChecks).forEach((key) => {
            if (antiDebuggingTechniqueChecks[key]()) {
                detectedADTs.push(key);
            }
        })
        chrome.storage.sync.set({[webURL]: detectedADTs});
    });
})();

function checkShortCut() {
    var detected = true;

    return detected;
};

function checkTrigBreak() {
    var detected = true;

    return detected;
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
