let visibleLimit = 3;
let stepSize = 3;
let MODE = localStorage.getItem("ai_speed_mode") || "fast";


chrome.storage.local.get(["visibleLimit", "mode"], (res) => {
    if (res.visibleLimit) visibleLimit = res.visibleLimit;
    if (res.mode) MODE = res.mode;

    createBadge();
    waitForMessages();
});


chrome.storage.onChanged.addListener((changes) => {
    if (changes.mode) {
        MODE = changes.mode.newValue;
        localStorage.setItem("ai_speed_mode", MODE);
        location.reload();
    }

    if (changes.visibleLimit && MODE === "fast") {
        visibleLimit = changes.visibleLimit.newValue;
        updateView();
    }
});

function getMessages() {
    return Array.from(document.querySelectorAll('[data-testid^="conversation-turn"]'));
}

function updateView() {
    const messages = getMessages();
    if (messages.length === 0) return;

    const total = messages.length;

    // 🔥 DIFFERENT LIMIT LOGIC
    let limit;

    if (MODE === "full") {
        // 👇 Full mode → show MORE but not ALL
        limit = visibleLimit * 10;   // 🔥 tweak this (10–20)
    } else {
        // 👇 Fast mode → aggressive trimming
        limit = visibleLimit * 2;
    }

    let hiddenCount = 0;

    messages.forEach((msg, index) => {
        if (index < total - limit) {
            msg.style.display = "none";
            hiddenCount++;
        } else {
            msg.style.display = "block";
        }
    });

    addButton(messages, hiddenCount);
}

function addButton(messages, hiddenCount) {
    let btn = document.getElementById("ai-speed-btn");

    if (!btn) {
        btn = document.createElement("button");
        btn.id = "ai-speed-btn";

        btn.onclick = () => {
            visibleLimit += stepSize;
            updateView();
        };

        const container = messages[0]?.parentElement;
        if (container) {
            container.insertBefore(btn, messages[0]);
        }
    }

    if (hiddenCount <= 0) {
        btn.style.display = "none";
        return;
    }

    btn.style.display = "block";

    // 🔥 Better count (not /2 guesswork)
    btn.innerText = `Load More (${hiddenCount} hidden)`;
}

function hideButton() {
    const btn = document.getElementById("ai-speed-btn");
    if (btn) btn.style.display = "none";
}

function waitForMessages() {
    const msgs = getMessages();

    if (msgs.length === 0) {
        setTimeout(waitForMessages, 1000);
    } else {
        updateView();
    }
}


function createBadge() {
    let badge = document.getElementById("ai-speed-badge");

    if (!badge) {
        badge = document.createElement("div");
        badge.id = "ai-speed-badge";
        badge.className = "ai-speed-badge";
        document.body.appendChild(badge);
    }

    if (MODE === "fast") {
        badge.innerText = "⚡ FAST MODE";
        badge.classList.add("ai-speed-fast");
        badge.classList.remove("ai-speed-full");
    } else {
        badge.innerText = "📜 FULL MODE";
        badge.classList.add("ai-speed-full");
        badge.classList.remove("ai-speed-fast");
    }
}


let timer;

const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(updateView, 200);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
