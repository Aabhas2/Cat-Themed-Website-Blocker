document.addEventListener("DOMContentLoaded", () => {
    const blockTab = document.getElementById("block-tab");
    const timerTab = document.getElementById("timer-tab");
    const blockSection = document.getElementById("block-section");
    const timerSection = document.getElementById("timer-section");

    if (!blockSection || !timerSection) {
        console.error("Error: 'blockSection' or 'timerSection' element not found.");
        return;
    }

    const siteInput = document.getElementById("site-input");
    const addBtn = document.getElementById("add-btn");
    const timerSiteInput = document.getElementById("timer-site-input");
    const timerInput = document.getElementById("timer-input");
    const timerBtn = document.getElementById("timer-btn");
    const blockedSitesList = document.getElementById("blocked-sites-list");

    // let blockingEnabled = true;

    let blockedSites = [];

    //Tab navigation
    blockTab.addEventListener("click", () => {
        blockTab.classList.add("active");
        timerTab.classList.remove("active");
        blockSection.style.display = "block";
        timerSection.style.display = "none";
    });

    timerTab.addEventListener("click", () => {
        timerTab.classList.add("active");
        blockTab.classList.remove("active");
        blockSection.style.display = "none";
        timerSection.style.display = "block";
    });

    //Add Website to block list
    addBtn.addEventListener("click", () => {
        const site = siteInput.value.trim();
        if (site && !blockedSites.includes(site)) {
            blockedSites.push(site);
            chrome.runtime.sendMessage({ action: "add", site });
            updateBlockedSites();
            siteInput.value = "";
        }
    });

    //Set timer for blocking 
    timerBtn.addEventListener("click", () => {
        const site = timerSiteInput.value.trim();
        const duration = parseInt(timerInput.value, 10);
        if (site && !blockedSites.includes(site)) {
            blockedSites.push(site);
            chrome.runtime.sendMessage({ action: "setTimer", site, duration: duration * 60 }); //convert to seconds
            updateBlockedSites();
            timerSiteInput.value = "";
            timerInput.value = "";
        }
    });

    //Remove website from block list 
    function removeSite(site) {
        blockedSites = blockedSites.filter((s) => s !== site);
        chrome.runtime.sendMessage({ action: "remove", site });

        //find rule ID associated with site
        const ruleID = blockedSites.indexOf(site)+1;

        //remove dynamic rule
        chrome.declarativeNetRequest.updateDynamicRules(
            {
                removeRuleIds: [ruleId], //remove rule for this site
            },
            () => {
                if(chrome.runtime.lastError){
                    console.error("Error removing rules:",chrome.runtime.lastError.message);
                }else{
                    console.log(`Rule for ${site} removed successfully.`);
                }
            }
        );
        updateBlockedSites();
    }

    //Update blocked websites 
    function updateBlockedSites() {
        blockedSitesList.innerHTML = blockedSites
            .map((site) => `<li>${site} <span onclick="removeSite('${site}')">X</span></li>`)
            .join("");

        blockedSitesList.addEventListener('click', (event) => {
            if (event.target.tagName === 'SPAN') { // Check if the clicked element is the "X" icon
                const websiteToRemove = event.target.parentElement.textContent.trim().replace('X', '').trim();
                blockedSites = blockedSites.filter((site) => site !== websiteToRemove);
                chrome.storage.local.set({ blockedSites });
                chrome.runtime.sendMessage({ action: "remove", site: websiteToRemove });
                event.target.parentElement.remove(); // Remove the list item
            }
        });

    }

    //Initial Load
    chrome.storage.local.get("blockedSites", (result) => {
        blockedSites = result.blockedSites || [];
        updateBlockedSites();
    })

})


