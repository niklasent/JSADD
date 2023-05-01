import { antiDebuggingTechniques, getActiveTabURL } from "./utils.js";

document.addEventListener("DOMContentLoaded", loadPopup());

async function loadPopup(containerInnerHtml) {
    var listContainer = document.getElementById("list-container");
    var listContainerContent = containerInnerHtml || listContainer.innerHTML;
    var enabled = (await chrome.storage.sync.get({ enabled: true })).enabled;
    var darkMode = (await chrome.storage.sync.get({ darkMode: false })).darkMode;
    var activeTab = await getActiveTabURL();
    if (!enabled) {
        listContainer.innerHTML = "";
        var deactivationMessage = document.createElement("p");
        deactivationMessage.innerText = "JSAAD is deactivated.\nPress the power button to activate JSAAD."
        deactivationMessage.style.textAlign = "center";
        deactivationMessage.style.fontWeight = "bold";
        listContainer.appendChild(deactivationMessage);
        if (darkMode) { 
            deactivationMessage.style.color = "#e8e8e8";
            document.getElementById("img-switch").src = "./img/switch-white.png" 
        }
        else { 
            deactivationMessage.style.color = "black";
            document.getElementById("img-switch").src = "./img/switch.png" 
        }
    }
    else {
        listContainer.innerHTML = listContainerContent;
        document.getElementById("img-switch").src = "./img/switch-active.png"
        // Determine maximum number of entries per category.
        let maxCategoryEntries = {};
        var debuggerDisabled = (await chrome.storage.sync.get({ noDebugger: false })).noDebugger;
        Object.keys(antiDebuggingTechniques).forEach((key) => {
            if (!((key === "trigbreak") && debuggerDisabled)) {
                if(!maxCategoryEntries[antiDebuggingTechniques[key].type]) {
                    maxCategoryEntries[antiDebuggingTechniques[key].type] = 1;
                }
                else {
                    maxCategoryEntries[antiDebuggingTechniques[key].type] += 1;
                }
            }
        });
        Object.keys(maxCategoryEntries).forEach((key) => {
            let categoryCountElement = document.getElementById(key + "-count");
            let categoryCountString = categoryCountElement.innerText;
            categoryCountString = categoryCountString.substring(0, categoryCountString.indexOf('/') + 1);
            categoryCountString += maxCategoryEntries[key].toString();
            categoryCountElement.innerText = categoryCountString;
        });

        // Present scan results.
        const webURL = activeTab.url;
        const storage = chrome.storage.local;
        // const storage = chrome.storage.sync;
        storage.get([webURL + "_ADT"], (data) => {
            if (data[webURL + "_ADT"]) {
                for (let i = 0; i < data[webURL + "_ADT"].length; i++) {
                    let adt = antiDebuggingTechniques[data[webURL + "_ADT"][i]];
                    if (!((data[webURL + "_ADT"][i] === "trigbreak") && debuggerDisabled)) {
                        // Mark categories that contain an entry.
                        let categorySummaryElement = document.getElementById(adt.type + "-sum");
                        categorySummaryElement.style.backgroundColor = "red";
                        categorySummaryElement.style.color = "white";
                        let categoryCountElement = document.getElementById(adt.type + "-count");
                        categoryCountElement.style.backgroundColor = "red";
                        let categoryDescElement = document.getElementById(adt.type + "-desc");
                        categoryDescElement.style.backgroundColor = "red";
                        // Show total number of entries per category.
                        let categoryCountString = categoryCountElement.innerText;
                        let categoryCount = parseInt(categoryCountString.substring(0, categoryCountString.indexOf('/'))) + 1;
                        categoryCountString = categoryCount.toString() + categoryCountString.substring(categoryCountString.indexOf('/'))
                        categoryCountElement.innerText = categoryCountString;
                        // Add entries to categories.
                        let categoryList = document.getElementById(adt.type + "-list");
                        let listElement = document.createElement('li');
                        let headline = document.createElement('h1');
                        headline.innerText = adt.name;
                        let description = document.createElement('p')
                        description.innerText = adt.desc;
                        let author = document.createElement('p');
                        author.innerText = adt.auth + ", " + adt.year;
                        author.style.fontStyle = 'italic';
                        let referenceLink = document.createElement('a');
                        referenceLink.href = adt.link;
                        referenceLink.textContent = "[Learn more]";
                        listElement.appendChild(headline);
                        listElement.appendChild(description);
                        listElement.appendChild(author);
                        listElement.appendChild(referenceLink);
                        categoryList.appendChild(listElement);
                    }
                }
            }
        });
    }

    // Change appearance to dark mode when enabled.
    if (darkMode) {
        var link = document.createElement('link');
        link.href = "./popup-dark.css";
        link.rel = "stylesheet";
        link.type = "text/css";

        document.getElementsByTagName('head')[0].appendChild(link);

        document.getElementById("img-options").src = "./img/gear-white.png"
    }

    document.getElementById("img-options").onclick = () => { chrome.runtime.openOptionsPage() };
    document.getElementById("img-switch").onclick = () => {
        var port = chrome.runtime.connect({name: "popup_port"});
        if (enabled) { 
            chrome.storage.sync.set({ enabled: false });
            port.postMessage({ state: false, tabId: activeTab.id });
        }
        else { 
            chrome.storage.sync.set({ enabled: true });
            port.postMessage({ state: true, tabId: activeTab.id });
        }
        loadPopup(listContainerContent);
    }
}