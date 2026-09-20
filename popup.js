document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('toggleExtn');
    const label = document.getElementById('toggleLabel');
    const timerSpan = document.getElementById('toggleTimer');
    const timerBtn = document.getElementById('timerBtn');
    let timerInterval = null;

    const delaySlider = document.getElementById('delaySlider');
    const delayValue = document.getElementById('delayValue');
    const siteConfig = {
        youtube: { 
            checkbox: document.getElementById('toggleYoutube'), 
            excludeCheckbox: document.getElementById('excludeYoutube'),
            timerEl: document.getElementById('timerYoutube') 
        },
        whatsapp: { 
            checkbox: document.getElementById('toggleWhatsapp'), 
            excludeCheckbox: document.getElementById('excludeWhatsapp'),
            timerEl: document.getElementById('timerWhatsapp') 
        },
        instagram: { 
            checkbox: document.getElementById('toggleInstagram'), 
            excludeCheckbox: document.getElementById('excludeInstagram'),
            timerEl: document.getElementById('timerInstagram') 
        }
    };

    let siteTimersInterval = null;

    chrome.storage.local.get(['kaoruko_delay', 'kaoruko_sites', 'kaoruko_excluded_sites'], function(result) {
        if (result.kaoruko_delay !== undefined) {
            delaySlider.value = result.kaoruko_delay;
            delayValue.textContent = result.kaoruko_delay;
        }
        
        const excluded = result.kaoruko_excluded_sites || { youtube: false, whatsapp: false, instagram: false };
        const sites = result.kaoruko_sites || { youtube: true, whatsapp: true, instagram: true };

        Object.keys(siteConfig).forEach(site => {
            const isExcluded = Boolean(excluded[site]);
            siteConfig[site].excludeCheckbox.checked = isExcluded;
            siteConfig[site].checkbox.checked = sites[site];
            siteConfig[site].checkbox.disabled = isExcluded;
        });

        updateSiteTimersDisplay();
        if (!siteTimersInterval) {
            siteTimersInterval = setInterval(updateSiteTimersDisplay, 1000);
        }
    });

    delaySlider.addEventListener('input', function() {
        delayValue.textContent = this.value;
        chrome.storage.local.set({ kaoruko_delay: parseInt(this.value) });
    });

    function saveExcludeState(site) {
        chrome.storage.local.get(['kaoruko_excluded_sites', 'kaoruko_sites', 'kaoruko_site_timers'], function(result) {
            const excluded = result.kaoruko_excluded_sites || { youtube: false, whatsapp: false, instagram: false };
            const sites = result.kaoruko_sites || { youtube: true, whatsapp: true, instagram: true };
            const timers = result.kaoruko_site_timers || {};

            const isExcluded = siteConfig[site].excludeCheckbox.checked;
            excluded[site] = isExcluded;

            if (isExcluded) {
                // When excluded: uncheck block checkbox, disable it, and remove any active timer
                siteConfig[site].checkbox.checked = false;
                siteConfig[site].checkbox.disabled = true;
                sites[site] = false;
                delete timers[site];
            } else {
                // When not excluded: re-enable block checkbox, and set it to checked (block it)
                siteConfig[site].checkbox.disabled = false;
                siteConfig[site].checkbox.checked = true;
                sites[site] = true;
                delete timers[site];
            }

            chrome.storage.local.set({ 
                kaoruko_excluded_sites: excluded, 
                kaoruko_sites: sites, 
                kaoruko_site_timers: timers 
            }, function() {
                updateSiteTimersDisplay();
                reloadActiveTab();
            });
        });
    }

    function saveSiteState(site) {
        chrome.storage.local.get(['kaoruko_sites', 'kaoruko_site_timers'], function(result) {
            const sites = result.kaoruko_sites || { youtube: true, whatsapp: true, instagram: true };
            const timers = result.kaoruko_site_timers || {};
            
            const isChecked = siteConfig[site].checkbox.checked;
            sites[site] = isChecked;
            
            if (!isChecked) {
                timers[site] = Date.now() + 5 * 60 * 1000;
            } else {
                delete timers[site];
            }
            
            chrome.storage.local.set({ kaoruko_sites: sites, kaoruko_site_timers: timers }, function() {
                updateSiteTimersDisplay();
                reloadActiveTab();
            });
        });
    }

    Object.keys(siteConfig).forEach(site => {
        siteConfig[site].checkbox.addEventListener('change', () => saveSiteState(site));
        siteConfig[site].excludeCheckbox.addEventListener('change', () => saveExcludeState(site));
    });

    function updateSiteTimersDisplay() {
        chrome.storage.local.get(['kaoruko_site_timers', 'kaoruko_sites'], function(result) {
            const timers = result.kaoruko_site_timers || {};
            const sites = result.kaoruko_sites || { youtube: true, whatsapp: true, instagram: true };
            let needsSave = false;
            const now = Date.now();

            Object.keys(siteConfig).forEach(site => {
                const timerEnd = timers[site];
                const el = siteConfig[site].timerEl;
                
                if (!timerEnd || sites[site]) {
                    el.style.display = 'none';
                    if (timers[site]) {
                        delete timers[site];
                        needsSave = true;
                    }
                    return;
                }
                
                const diff = timerEnd - now;
                if (diff <= 0) {
                    sites[site] = true;
                    siteConfig[site].checkbox.checked = true;
                    delete timers[site];
                    needsSave = true;
                    el.style.display = 'none';
                } else {
                    const min = Math.floor(diff / 60000);
                    const sec = Math.floor((diff % 60000) / 1000);
                    el.textContent = `Will turn ON in ${min}:${sec.toString().padStart(2,'0')}`;
                    el.style.display = 'block';
                }
            });

            if (needsSave) {
                chrome.storage.local.set({kaoruko_sites: sites, kaoruko_site_timers: timers});
            }
        });
    }
    function getTimerEnd(callback) {
        chrome.storage.local.get(['kaoruko_timer_end'], function(result) {
            callback(result.kaoruko_timer_end ? parseInt(result.kaoruko_timer_end) : null);
        });
    }
    function clearTimer() {
        chrome.storage.local.remove('kaoruko_timer_end');
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        timerSpan.style.display = 'none';
    }
    function startTimer() {
        const end = Date.now() + 5 * 60 * 1000;
        chrome.storage.local.set({kaoruko_timer_end: end, kaoruko_enabled: false}, updateBtn);
    }
    function updateBtn() {
        chrome.storage.local.get(['kaoruko_enabled', 'kaoruko_timer_end'], function(result) {
            const enabled = Boolean(result.kaoruko_enabled);
            const timerEnd = result.kaoruko_timer_end ? parseInt(result.kaoruko_timer_end) : null;
            if (enabled) {
                btn.classList.remove('off');
                btn.classList.add('on');
                label.textContent = 'Extension is ON';
                clearTimer();
            } else {
                btn.classList.remove('on');
                btn.classList.add('off');
                label.textContent = 'Extension is OFF';
                if (timerEnd) {
                    timerSpan.style.display = 'block';
                    updateTimerDisplay();
                    if (!timerInterval) {
                        timerInterval = setInterval(updateTimerDisplay, 1000);
                    }
                } else {
                    timerSpan.style.display = 'none';
                }
            }
            btn.textContent = enabled ? 'Turn Extension OFF' : 'Turn Extension ON';
        });
    }
    function updateTimerDisplay() {
        chrome.storage.local.get(['kaoruko_timer_end'], function(result) {
            const timerEnd = result.kaoruko_timer_end ? parseInt(result.kaoruko_timer_end) : null;
            if (!timerEnd) {
                timerSpan.style.display = 'none';
                return;
            }
            const now = Date.now();
            const diff = timerEnd - now;
            if (diff <= 0) {
                chrome.storage.local.set({kaoruko_enabled: true}, function() {
                    clearTimer();
                    updateBtn();
                });
                return;
            }
            const min = Math.floor(diff / 60000);
            const sec = Math.floor((diff % 60000) / 1000);
            timerSpan.textContent = `Extension will turn ON in ${min}:${sec.toString().padStart(2,'0')}`;
        });
    }
    function reloadActiveTab() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.reload(tabs[0].id);
            }
        });
    }
    btn.onclick = () => {
        chrome.storage.local.get(['kaoruko_enabled'], function(result) {
            const enabled = Boolean(result.kaoruko_enabled);
            chrome.storage.local.set({kaoruko_enabled: !enabled}, function() {
                clearTimer();
                updateBtn();
                reloadActiveTab(); // reload tab after toggle
            });
        });
    };
    timerBtn.onclick = () => {
        startTimer();
        reloadActiveTab(); // reload tab after timer
    };
    // If timer is running, keep updating
    updateBtn();
    getTimerEnd(function(timerEnd) {
        if (timerEnd && !timerInterval) {
            timerInterval = setInterval(updateTimerDisplay, 1000);
        }
    });
});