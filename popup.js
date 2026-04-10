const toggle = document.getElementById("modeToggle");
const slider = document.getElementById("slider");
const value = document.getElementById("value");


chrome.storage.local.get(["mode", "visibleLimit"], (res) => {
    const mode = res.mode || "fast";
    const visible = res.visibleLimit || 3;

    toggle.checked = mode === "full";

    slider.value = visible;
    value.innerText = visible;


    slider.disabled = (mode === "full");
});


toggle.onchange = () => {
    const mode = toggle.checked ? "full" : "fast";

    chrome.storage.local.set({ mode });
};


slider.oninput = () => {
    const val = parseInt(slider.value);

    value.innerText = val;

    chrome.storage.local.set({
        visibleLimit: val
    });
};
