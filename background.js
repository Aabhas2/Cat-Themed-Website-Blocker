    let blockedSites = [];

    // Initialize blocked sites from storage
    chrome.storage.local.get(["blockedSites"], (result) => {
      blockedSites = result.blockedSites || [];
      updateBlockedRules(); // Apply rules on startup
    });
    
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "add") {
        if (!blockedSites.includes(message.site)) {
          blockedSites.push(message.site);
          chrome.storage.local.set({ blockedSites });
          updateBlockedRules();
          sendResponse({ status: "added" });
        } else {
          sendResponse({ status: "already exists" });
        }
      } else if (message.action === "remove") {
        blockedSites = blockedSites.filter((site) => site !== message.site);
        chrome.storage.local.set({ blockedSites });
        updateBlockedRules();
        sendResponse({ status: "removed" });
      } else if (message.action === "setTimer") {
        const { site, duration } = message;
        if (!blockedSites.includes(site)) {
          blockedSites.push(site);
          chrome.storage.local.set({ blockedSites });
          updateBlockedRules();
    
          // Remove site after time expires
          setTimeout(() => {
            blockedSites = blockedSites.filter((s) => s !== site);
            chrome.storage.local.set({ blockedSites });
            updateBlockedRules();
          }, duration * 1000);
    
          sendResponse({ status: "timer set" });
        } else {
          sendResponse({ status: "already exists" });
        }
      }
    });
    
    function updateBlockedRules() {
      if (!Array.isArray(blockedSites) || blockedSites.length === 0) {
        console.log("No blocked sites specified.");
        return;
      }
    
      // Generate unique rule IDs for each blocked site
      const ruleIds = blockedSites.map((_, index) => index + 1);
    
      chrome.declarativeNetRequest.updateDynamicRules(
        {
          removeRuleIds: ruleIds, // Remove all existing rules first
          addRules: [],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error("Error removing rules:", chrome.runtime.lastError.message);
            return;
          }
    
          const newRules = blockedSites.map((site, index) => ({
            id: index + 1,
            priority: 1,
            action: { type: "block" },
            condition: {
              urlFilter: `*://*${site}/*`, // More inclusive URL filtering
              resourceTypes: ["main_frame"],
            },
          }));
    
          chrome.declarativeNetRequest.updateDynamicRules(
            {
              removeRuleIds: [], // No need to remove again
              addRules: newRules,
            },
            () => {
              console.log("New Rules Added Successfully");
    
              // Verify active rules
              chrome.declarativeNetRequest.getDynamicRules((rules) => {
                console.log("Active Dynamic Rules:", rules);
              });
            }
          );
        }
      );
    }