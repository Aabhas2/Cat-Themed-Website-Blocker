document.addEventListener("DOMContentLoaded", () => {
    const blockTab = document.getElementById("block-tab");
    const blockSection = document.getElementById("block-section");

    const siteInput = document.getElementById("site-input");
    const addBtn = document.getElementById("add-btn");
    const blockedSitesList = document.getElementById("blocked-sites-list");


    let blockedSites = []; 

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

    //Remove website from block list 
    function removeSite(site) {
        blockedSites = blockedSites.filter((s) => s !== site);
        chrome.runtime.sendMessage({ action: "remove", site });

        //remove dynamic rule
        chrome.declarativeNetRequest.updateDynamicRules(
            {
                removeRuleIds: [blockedSites.indexOf(site)+1], //remove rule for this site
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
        blockedSitesList.innerHTML = ''; //clear the list first
        blockedSites.forEach((site) => {
            //create list item and remove button dynamically 
            const li = document.createElement('li');
            li.textContent = site;

            const removeButton = document.createElement('span');
            removeButton.textContent = 'X';
            removeButton.style.cursor = 'pointer';

            //Add an event listener to the remove button 
            removeButton.addEventListener('click',() =>{
                removeSite(site);
            });
            //Append button to the list item 
            li.appendChild(removeButton);
            blockedSitesList.appendChild(li);
        });
    }

    //Initial Load
    chrome.storage.local.get("blockedSites", (result) => {
        blockedSites = result.blockedSites || [];
        updateBlockedSites();
    })

})


