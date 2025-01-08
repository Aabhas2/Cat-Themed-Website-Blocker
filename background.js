let blockedSites = [];
let timers = [];

chrome.storage.local.get(["blockedSites"],(result) => {
    blockedSites = result.blockedSites || [];
});

chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        return {cancel: true};
    },
    {urls: blockedSites.map((site) => `*://*.${site}/*`)},
    ["blocking"]
);

chrome.runtime.onMessage.addListener((message,sender,sendResponse) => {
    if(message.action === "add"){
        blockedSites.push(message.site);
        chrome.storage.local.set({blockedSites});
        sendResponse({status: "added"});
    } 
    else if(message.action === "remove"){
        blockedSites = blockedSites.filter((site) => site !== message.site);
        chrome.storage.local.set({blockedSites});
        sendResponse({status: "removed"});
    }
    else if(message.action === "setTimer") {
        const {site,duration} = message;
        if (!timers[site]){
            timers[site] = setTimeout(() => {
                blockedSites = blockedSites.filter((s) => s!== site);
                chrome.storage.local.set({blockedSites});
                delete timers[site];
            }, duration * 1000);
            sendResponse({status: "timer set"});
        }
    }
});