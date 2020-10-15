document.addEventListener('DOMContentLoaded', function() {
    load();
    Array.from(document.getElementsByTagName("input")).forEach(e => e.addEventListener("change", handler));
    Array.from(document.getElementsByTagName("textarea")).forEach(e => e.addEventListener("change", handler));
});

function parseUrl(text) {
    return text.replace(/\n/g, " ").replace(/,/g, " ").split(" ").filter(e => e!= "");
}

function handler() {
    days = Array.from(document.getElementsByClassName("block_days"));
    activated = document.getElementById("activated");
    if (!days.some(e => e.checked)) {
        activated.checked = false;
    }
    localStorage.setItem("activated", document.getElementById("activated").checked);
    localStorage.setItem("time_sites", parseUrl(document.getElementById("time_sites").value));
    localStorage.setItem("block_sites", parseUrl(document.getElementById("block_sites").value));
    localStorage.setItem("blocking_time", document.getElementById("blocking_time").value);
    localStorage.setItem("block_days", days.filter(e => e.checked).map(e => e.id));
}

function load() {
    if (localStorage.getItem("activated") == "true") {
        document.getElementById("activated").checked = true;
    } else {
        document.getElementById("activated").checked = false;
    }
    if (localStorage.getItem("time_sites")) {
        document.getElementById("time_sites").value = localStorage.getItem("time_sites").replace(/,/g, "\n");
    }
    if (localStorage.getItem("block_sites")) {
        document.getElementById("block_sites").value = localStorage.getItem("block_sites").replace(/,/g, "\n");
    }
    if (localStorage.getItem("blocking_time")) {
        document.getElementById("blocking_time").value = localStorage.getItem("blocking_time");
    }
    if (localStorage.getItem("block_days")) {
        localStorage.getItem("block_days").split(",").forEach(e => document.getElementById(e).checked = true);
    }
}