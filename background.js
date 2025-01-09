let blockedSites = [];

//Initialize blocked sites from storage 
chrome.storage.local.get(["blockedSites"],(result) => {
    blockedSites = result.blockedSites || [];
    updateBlockedRules(); //apply rules on startup
});

chrome.runtime.onMessage.addListener((message,sender,sendResponse) => {
    if(message.action === "add"){
        if (!blockedSites.includes(message.site)){
            blockedSites.push(message.site);
            chrome.storage.local.set({blockedSites});
            updateBlockedRules();
            sendResponse({status: "added"});
        }   
    } 
    else if(message.action === "remove"){
        blockedSites = blockedSites.filter((site) => site !== message.site);
        chrome.storage.local.set({blockedSites});
        updateBlockedRules();
        sendResponse({status: "removed"});
    }
    else if(message.action === "setTimer") {
        const {site,duration} = message;
        if(!blockedSites.includes(site)) {
            blockedSites.push(site);
            chrome.storage.local.set({blockedSites});
            updateBlockedRules();

            //remove site after time expires
            setTimeout(() => {
                blockedSites = blockedSites.filter((s) => s!== site);
                chrome.storage.local.set({blockedSites});
                updateBlockedRules();
            }, duration * 1000);

            sendResponse({status: "timer set"});
        }
    }
});

//Update declarativeNetRequest rules 
function updateBlockedRules() {
    //Remove existing rules 
    chrome.declarativeNetRequest.updateDynamicRules(
        {
            removeRuleIds: blockedSites.map((_, index) => index + 1) //IDs are 1-based
        },
        () => {
            //Add new rules
            const newRules = blockedSites.map((site,index) => ({
                id: index + 1, //assing a unique ID
                priority: 1,
                action: {type: "block"},
                condition: {urlFilter: `*://*.${site}/*`, resourceTypes: ["main_frame"]}
            }));

            chrome.declarativeNetRequest.updateDynamicRules({addRules: newRules});
        }
    );
}