let blockedSites = [];

// Initialize blocked sites from storage
chrome.storage.local.get(["blockedSites"], (result) => {
  blockedSites = result.blockedSites || [];
  updateBlockedRules(); // Apply rules on startup
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "add") {
    handleAddSite(message.site,sendResponse);
  } else if(message.action === "remove") {
    handleRemoveSite(message.site,sendResponse);
  }else if(message.action === "setTimer" ) {
    handleSetTimer(message.site,message.duration,sendResponse);
  } else{
    sendResponse({status: "unknown action"});
  }
  return true; //indicate async response 
});

//Handle adding a site to the block list
function handleAddSite(site, sendResponse){
  if(!blockedSites.includes(site)) {
    blockedSites.push(site);
    saveBlockedSites();
    updateBlockedRules();
    sendResponse({status: "added"});
  } else {
    sendResponse({status: "already exists"});
  }
}

//Handle removing a site from the block list 
function handleRemoveSite(site, sendResponse) {
  if(blockedSites.includes(site)) {
    blockedSites = blockedSites.filter((s) => s!== site);
    saveBlockedSites();
    updateBlockedRules();
    sendResponse({status: "removed"});
  }else {
    sendResponse({status: "not found"});
  }
}

function saveBlockedSites() {
  chrome.storage.local.set({blockedSites}, () => {
    if(chrome.runtime.lastError) {
      console.error("Error saving blocked sites:",chrome.runtime.lastError.message);
    }
  });
}

//Update dynamic rules based on the current block list
function updateBlockedRules() {
  if(!Array.isArray(blockedSites) || blockedSites.length === 0) {
    //clear all rules if no sites are blocked
    chrome.declarativeNetRequest.updateDynamicRules(
      {removeRuleIds: Array.from({length: 100}, (_,i) => i+1)},
      () => {
        if(chrome.runtime.lastError) {
          console.error("Error clearing rules:",chrome.runtime.lastError.message);
        } else {
          console.log("All dynamic rules cleared.");
        }
      }
    );
    return;
  }

  //Create rules for blocked sites
  const newRules = blockedSites.map((site,index) => ({
    id: index+1, //unique ID
    priority: 1,
    action: {type: "block"},
    condition: {
      urlFilter: `*://*${site}/*`,
      resourceTypes: ["main_frame"],
    },
  }));

  //update dynamic rules 
  chrome.declarativeNetRequest.updateDynamicRules(
    {
      removeRuleIds: Array.from({length: 100}, (_,i) => i+1), //remove all existing rules 
      addRules: newRules, //add new rules
    },
    () => {
      if(chrome.runtime.lastError) {
        console.error("Erro updating rules:", chrome.runtime.lastError.message);
      } else {
        console.log("Dynamic rules update:", blockedSites);
      }
    }
  );
}

 