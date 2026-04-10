(function () {

    // 🔥 READ MODE DIRECTLY (instant, no delay)
    const MODE = localStorage.getItem("ai_speed_mode") || "fast";

    // 🚨 FULL MODE → DO NOT PATCH FETCH
    if (MODE === "full") {
        console.log("📜 Full mode: interceptor disabled");
        return;
    }

    if (window.__AI_SPEED_ACTIVE__) return;
    window.__AI_SPEED_ACTIVE__ = true;

    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
        const response = await originalFetch.apply(this, args);

        try {
            let url = "";

            if (typeof args[0] === "string") {
                url = args[0];
            } else if (args[0] && args[0].url) {
                url = args[0].url;
            }

            if (!url.includes("/backend-api/conversation")) {
                return response;
            }

            const cloned = response.clone();
            const data = await cloned.json();

            if (!data.mapping || !data.current_node) {
                return response;
            }

            const mapping = data.mapping;
            let current = data.current_node;

            const KEEP = 30;
            let count = 0;
            let chain = [];

            while (current && mapping[current]) {
                chain.push(current);
                current = mapping[current].parent;
                count++;
                if (count >= KEEP) break;
            }

            const newMapping = {};

            chain.forEach(id => {
                newMapping[id] = mapping[id];
            });

            for (let i = 0; i < chain.length; i++) {
                const node = newMapping[chain[i]];
                node.parent = i < chain.length - 1 ? chain[i + 1] : null;
                node.children = i > 0 ? [chain[i - 1]] : [];
            }

            data.mapping = newMapping;
            data.current_node = chain[0];

            return new Response(JSON.stringify(data), {
                status: response.status,
                headers: response.headers
            });

        } catch (err) {
            return response;
        }
    };

    console.log("⚡ AI Speed Fast Mode Enabled");

})();