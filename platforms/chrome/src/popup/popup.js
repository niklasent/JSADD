import { antiDebuggingTechniques, getActiveTabURL } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("img-options").onclick = () => { chrome.runtime.openOptionsPage() };

    // Change appearance to dark mode when enabled.
    var darkMode = (await chrome.storage.sync.get({ darkMode: false })).darkMode;
    if (darkMode) {
        var link = document.createElement('link');
        link.href = "./popup-dark.css";
        link.rel = "stylesheet";
        link.type = "text/css";

        document.getElementsByTagName('head')[0].appendChild(link);

        document.getElementById("img-options").src = "./img/gear-white.png"
    }

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
    const activeTab = await getActiveTabURL();
    const webURL = activeTab.url;
    const storage = chrome.storage.local;
    // const storage = chrome.storage.sync;
    storage.get([webURL + "_ADT"], (data) => {
        for (let i = 0; i < data[webURL + "_ADT"].length; i++) {
            let adt = antiDebuggingTechniques[data[webURL + "_ADT"][i]];
            if (!((data[webURL + "_ADT"][i] === "trigbreak") && debuggerDisabled)) {
                // Mark categories that contain an entry.
                let categorySummaryElement = document.getElementById(adt.type + "-sum");
                categorySummaryElement.style.backgroundColor = "red";
                categorySummaryElement.style.color = "white";
                // Show total number of entries per category.
                let categoryCountElement = document.getElementById(adt.type + "-count");
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
    });
});