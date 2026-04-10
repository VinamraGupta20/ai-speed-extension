const toggle = document.getElementById("modeToggle");
const slider = document.getElementById("slider");
const value = document.getElementById("value");

// Load settings
chrome.storage.local.get(["mode", "visibleLimit"], (res) => {
    const mode = res.mode || "fast";
    const visible = res.visibleLimit || 3;

    toggle.checked = mode === "full";

    slider.value = visible;
    value.innerText = visible;

    // 🔥 disable slider in full mode
    slider.disabled = (mode === "full");
});

// Toggle
toggle.onchange = () => {
    const mode = toggle.checked ? "full" : "fast";

    chrome.storage.local.set({ mode });
};

// Slider
slider.oninput = () => {
    const val = parseInt(slider.value);

    value.innerText = val;

    chrome.storage.local.set({
        visibleLimit: val
    });
};