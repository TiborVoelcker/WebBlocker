const min = 1000 * 60
var windows = {};
var last_time = null;

var today;
var total_time = 0;
var activated;
var block_days = [];
var block_sites = [];
var time_sites = [];
var blocking_time = 0;

chrome.runtime.onStartup.addListener(function() {
    load();
    var timerId = setInterval(update_badge, 60*1000);
    chrome.browserAction.setBadgeText({text: "0/" + Math.round(blocking_time/min)});
    chrome.browserAction.setBadgeBackgroundColor({color: '#e00b0b'});
});


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.url && tab.highlighted) {
        host = new URL(tab.url).hostname
        windows[tab.windowId] = host;
        check();
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url) {
            host = new URL(tab.url).hostname;
            windows[tab.windowId] = host;
            check();
        }
    });
});

chrome.windows.onRemoved.addListener((windowId) => {
    delete windows[windowId];
    check();
});

function check() {
    if (total_time < blocking_time && activated && block_days.includes(today.getDay())) {
        update_badge();
        if (Object.values(windows).some(e => block_sites.includes(e))) {
            console.log("Blocking...");
            console.log(" -> (Total Time: " + (total_time/min).toFixed(1) + "/" + (blocking_time/min).toFixed(1) + " min)");
            chrome.tabs.update(null, {url: "https://" + time_sites[0]})
        }
        if (Object.values(windows).some(e => time_sites.includes(e))) {
            if (!last_time) {
                console.log("New session...");
                last_time = new Date();
            }
        } else {
            if (last_time) {
                now = new Date();
                total_time += now - last_time;
                localStorage.setItem("total_time", total_time);
                localStorage.setItem("today", get_noon(today));
                console.log("Session finished. Time spent: " + ((now - last_time)/min).toFixed(1));
                console.log(" -> (Total Time: " + (total_time/min).toFixed(1) + "/" + (blocking_time/min).toFixed(1) + " min)");
                last_time = null;
            }
        }
    }
}

window.addEventListener('storage', function(e) {
    if (e.key == "activated") {
        if (e.newValue == "true") {activated = true}
        else if (e.newValue == "false") {activated = false}
    }
    if (e.key == "time_sites") {
        time_sites = e.newValue.split(",");
    }
    if (e.key == "block_sites") {
        block_sites = e.newValue.split(",");
    }
    if (e.key == "blocking_time") {
        blocking_time = parseInt(e.newValue, 10) * min;
    }
});

function load() {
    today = new Date()
    if (localStorage.getItem("today") == get_noon(today)) {
        if (localStorage.getItem("total_time")) {
            total_time = parseInt(localStorage.getItem("total_time"), 10);
        }
    }
    if (localStorage.getItem("activated") == "true") {
        activated = true;
    } else {
        activated = false;
    }
    if (localStorage.getItem("time_sites")) {
        time_sites = localStorage.getItem("time_sites").split(",");
    }
    if (localStorage.getItem("block_sites")) {
        block_sites = localStorage.getItem("block_sites").split(",");
    }
    if (localStorage.getItem("blocking_time")) {
        blocking_time = parseInt(localStorage.getItem("blocking_time"), 10) * min;
    }
    if (localStorage.getItem("block_days")) {
        block_days = localStorage.getItem("block_days").split(",").map(e => parseInt(e, 10));
    } else {
        block_days = [0, 1, 2, 3, 4, 5, 6];
    }
}

function update_badge() {
    if (get_noon(new Date()) != get_noon(today)) {
        total_time = 0;
        if (last_time) {last_time = new Date()}
    }
    if (last_time) {
        if (total_time + (new Date() - last_time) >= blocking_time) {
            chrome.browserAction.setBadgeText({text: "Done!"});
            chrome.browserAction.setBadgeBackgroundColor({color: '#04bf0d'});
            total_time += now - last_time;
            localStorage.setItem("total_time", total_time);
            localStorage.setItem("today", get_noon(today));
            console.log("Time goal reached. Stop blocking now...");
            last_time = null;
        } else {
            chrome.browserAction.setBadgeText({text: Math.round((total_time + (new Date() - last_time))/min) + "/" + Math.round(blocking_time/min)});
            chrome.browserAction.setBadgeBackgroundColor({color: '#e00b0b'});
            localStorage.setItem("total_time", total_time + (new Date() - last_time));
            localStorage.setItem("today", get_noon(today))
        }
    }
}

function get_noon(date) {
    return date - date % (24*60*60*1000);
}

function delete_storage() {
    localStorage.removeItem("today");
    localStorage.removeItem("total_time");
    localStorage.removeItem("activated");
    localStorage.removeItem("blocking_time");
    localStorage.removeItem("time_sites");
    localStorage.removeItem("block_sites");
    localStorage.removeItem("block_days");
}

function status() {
    return {running: (total_time < blocking_time && activated && block_days.includes(today.getDay()))}
}

