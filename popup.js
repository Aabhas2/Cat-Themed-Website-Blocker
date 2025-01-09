const siteInput = document.getElementById("site-input");
const addBtn = document.getElementById("add-btn");
const toggleBtn = document.getElementById("toggle-btn");
const timerInput =document.getElementById("timer-input");
const timerBtn = document.getElementById("timer-btn");
const blockedSites = document.getElementById("blocked-sites");

let blockingEnabled = true;

//Add websites to block list
addBtn.addEventListener("click", () => {
    const site = siteInput.value.trim();
    if (site) {
        chrome.runtime.sendMessage({action: "add",site}, (response) => {
            if (response.status = "added") {
                updateBlockedSites();
            }
        });
        siteInput.value = "";
    }
});

//Toggle blocking 
toggleBtn.addEventListener('click', () => {
    blockingEnabled = !blockingEnabled;
    toggleBtn.textContent = blockingEnabled ? "Turn Off Blocking" : "Turn On Blocking";
    chrome.runtime.sendMessage({action: blockingEnabled ? "Enable" : "Disable"});
});

//Set Timer 
timerBtn.addEventListener('click', () => {
    const site = siteInput.value.trim();
    const duration = parseInt(timerInput.value,10);
    if(site && duration) {
        chrome.runtime.sendMessage(
            {action: "setTimer",site,duration},
            (response) => {
                if(response.status === "timer-set") {
                    updateBlockedSites();
                }
            }
        );
        siteInput.value = "";
        timerInput.value = "";
    }
});

//Update blocked sites list
function updateBlockedSites() {
    chrome.storage.local.get(["blockedSites"],(result) => {
        const sites = result.blockedSites || [];
        blockedSites.innerHTML = sites.map((site) => `<li>${site}</li>`).join("");
    });
}

//initial list laod
updateBlockedSites();