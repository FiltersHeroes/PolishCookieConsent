var PCC_updateHelpers = PCC_updateHelpers || {};

(function (global) {
    const api = PCC_updateHelpers;

    api.fetchWithRetry = (async (url, retries = 2, delay = 1500) => {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw {
                        status: response.status,
                        statusText: response.statusText,
                        err: response.statusText
                    };
                }
                return response;
            } catch (err) {
                if (attempt < retries) {
                    console.warn(`[Polish Cookie Consent] Fetch failed (${url}), retry #${attempt + 1} in ${delay}ms`, err);
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2;
                } else {
                    console.error(`[Polish Cookie Consent] Fetch failed after ${retries + 1} attempts: ${url}`, err);
                    throw err;
                }
            }
        }

    });

    api.fetchFromCdns = (async (urls, delay = 1500) => {
        if (!urls || urls.length === 0) {
            throw new Error("[Polish Cookie Consent] No CDN URLs provided");
        }
        const shuffledUrls = [...urls].sort(() => Math.random() - 0.5);
        for (let url of shuffledUrls) {
            try {
                const response = await api.fetchWithRetry(url);
                return response;
            } catch (err) {
                console.warn(`[Polish Cookie Consent] CDN failed: ${url}`, err);
                await new Promise(res => setTimeout(res, delay));
            }
        }
        throw new Error("[Polish Cookie Consent] All CDNs failed");
    });
    global.PCC_updateHelpers = api;

})(typeof self !== "undefined" ? self : window);
