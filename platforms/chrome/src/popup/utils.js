// Constants
const referenceLinks = {
    "musch": "https://www.usenix.org/conference/usenixsecurity21/presentation/musch",
    "sorhus": "https://github.com/sindresorhus/devtools-detect"
}

export const antiDebuggingTechniques = {
    "shortcut": {
        "name": "ShortCut",
        "auth": "Musch et al.",
        "year": "2021",
        "type": "impediment",
        "desc": "The website might try to prevent the user from opening the developer tools using common keyboard shortcuts.",
        "link": referenceLinks.musch
    },
    "trigbreak": {
        "name": "TrigBreak",
        "auth": "Musch et al.",
        "year": "2021",
        "type": "impediment",
        "desc": "The website might try to impede debugging attempts by repeated debugger statement calls.",
        "link": referenceLinks.musch
    },
    "conclear": {
        "name": "ConClear",
        "auth": "Musch et al.",
        "year": "2021",
        "type": "impediment",
        "desc": "The website might try to prevent the user from inspecting console outputs by repeatedly clearing the console.",
        "link": referenceLinks.musch
    },
    "modbuilt": {
        "name": "ModBuilt",
        "auth": "Musch et al.",
        "year": "2021",
        "type": "alteration",
        "desc": "The website might try to modify built-in fuctions and objects that can be used to alter debugging results.",
        "link": referenceLinks.musch
    },
    "widthdiff": {
        "name": "WidthDiff",
        "auth": "Musch et al.",
        "year": "2021",
        "type": "detection",
        "desc": "The website might try to detect opened developer tools by comparing window sizes.",
        "link": referenceLinks.musch
    },
    "logget": {
        "name": "LogGet",
        "auth": "Musch et al.",
        "year": "2021",
        "type": "detection",
        "desc": "The website might try to detect opened developer tools by logging specifically crafted objects.",
        "link": referenceLinks.musch
    },
    "firebug": {
        "name": "Firebug Lite (Chrome)",
        "auth": "Sorhus",
        "year": "2013",
        "type": "detection",
        "desc": "The website might try to detect the use of Firebug Lite.",
        "link": referenceLinks.sorhus
    }
}

// Functions
export async function getActiveTabURL() {
    let queryOptions = { active: true, currentWindow: true};
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}