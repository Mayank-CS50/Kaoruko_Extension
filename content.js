let blockTimeout = null;
let siteAutoBlockTimeouts = {};

function checkAndRedirect() {
    chrome.storage.local.get(['kaoruko_enabled', 'kaoruko_delay', 'kaoruko_sites', 'kaoruko_site_timers', 'kaoruko_excluded_sites'], function(result) {
        const enabled = Boolean(result.kaoruko_enabled);
        const delay = result.kaoruko_delay !== undefined ? result.kaoruko_delay * 1000 : 2000;
        const sites = result.kaoruko_sites || { youtube: true, whatsapp: true, instagram: true };
        const excluded = result.kaoruko_excluded_sites || { youtube: false, whatsapp: false, instagram: false };
        const siteTimers = result.kaoruko_site_timers || {};
        
        const url = window.location.href;
        let matchedSite = null;
        
        if (url.includes('youtube.com')) matchedSite = 'youtube';
        else if (url.includes('whatsapp.com')) matchedSite = 'whatsapp';
        else if (url.includes('instagram.com')) matchedSite = 'instagram';

        if (matchedSite && siteAutoBlockTimeouts[matchedSite]) {
            clearTimeout(siteAutoBlockTimeouts[matchedSite]);
            delete siteAutoBlockTimeouts[matchedSite];
        }

        let shouldBlock = false;

        if (matchedSite) {
            if (excluded[matchedSite]) {
                shouldBlock = false;
            } else if (sites[matchedSite]) {
                shouldBlock = true;
            } else if (siteTimers[matchedSite]) {
                const now = Date.now();
                if (now >= siteTimers[matchedSite]) {
                    sites[matchedSite] = true;
                    delete siteTimers[matchedSite];
                    shouldBlock = true;
                    chrome.storage.local.set({kaoruko_sites: sites, kaoruko_site_timers: siteTimers});
                } else {
                    const timeRemaining = siteTimers[matchedSite] - now;
                    siteAutoBlockTimeouts[matchedSite] = setTimeout(() => {
                        checkAndRedirect();
                    }, timeRemaining);
                }
            }
        }

        if (blockTimeout) {
            clearTimeout(blockTimeout);
            blockTimeout = null;
        }

        if (enabled && shouldBlock) {
            blockTimeout = setTimeout(() => {
                window.location.href = chrome.runtime.getURL("trying1.html");
            }, delay);
        }
    });
}
checkAndRedirect();
chrome.storage.onChanged.addListener(function(changes, area) {
    if (area === 'local') {
        checkAndRedirect();
    }
});