document.addEventListener("DOMContentLoaded", () => {
    const blockTab = document.getElementById("block-tab");
    const timerTab = document.getElementById("timer-tab");
    const blockSection = document.getElementById("block-section");
    const timerSection = document.getElementById("timer-section");

    if(!blockSection || !timerSection){
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
        updateBlockedSites();
    }

    //Update blocked websites 
    function updateBlockedSites() {
        blockedSitesList.innerHTML = blockedSites
            .map((site) => `<li>${site} <span onclick="removeSite('${site}')">X</span></li>`)
            .join("");

    }

    //Initial Load
    chrome.storage.local.get("blockedSites", (result) => {
        blockedSites = result.blockedSites || [];
        updateBlockedSites();
    })

})


// //Add websites to block list
// addBtn.addEventListener("click", () => {
//     const site = siteInput.value.trim();
//     if (site) {
//         chrome.runtime.sendMessage({action: "add",site}, (response) => {
//             if (response.status = "added") {
//                 updateBlockedSites();
//             }
//         });
//         siteInput.value = "";
//     }
// });


// //Set Timer
// timerBtn.addEventListener('click', () => {
//     const site = siteInput.value.trim();
//     const duration = parseInt(timerInput.value,10);
//     if(site && duration) {
//         chrome.runtime.sendMessage(
//             {action: "setTimer",site,duration},
//             (response) => {
//                 if(response.status === "timer-set") {
//                     updateBlockedSites();
//                 }
//             }
//         );
//         siteInput.value = "";
//         timerInput.value = "";
//     }
// });

// //Update blocked sites list
// function updateBlockedSites() {
//     chrome.storage.local.get(["blockedSites"],(result) => {
//         const sites = result.blockedSites || [];
//         blockedSites.innerHTML = sites.map((site) => `<li>${site}</li>`).join("");
//     });
// }

// //initial list laod
// updateBlockedSites();