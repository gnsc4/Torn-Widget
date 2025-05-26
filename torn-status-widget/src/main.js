// Tauri API imports
const appWindow = window.__TAURI__.window.appWindow;
const LogicalSize = window.__TAURI__.window.LogicalSize;
const invoke = window.__TAURI__.tauri.invoke;

(function() {
    'use strict';
    const SCRIPT_VERSION = "1.0.30"; // UPDATED SCRIPT VERSION
    const FORUM_THREAD_URL = "https://www.torn.com/forums.php#/p=threads&f=67&t=16473214&b=0&a=0";
    const AUTHOR_NAME = "GNSC4 [268863]";
    const AUTHOR_URL = "https://www.torn.com/profiles.php?XID=268863";
    const GITHUB_RELEASES_API_URL = "https://api.github.com/repos/gnsc4/Torn-Widget/releases/latest";
    const GITHUB_RELEASES_PAGE_URL = "https://github.com/gnsc4/Torn-Widget/releases";


    const UPDATE_INTERVAL_MS = 15 * 1000;
    const API_KEY_STORAGE = 'torn_status_api_key_v1_widget';
    const GUI_MINIMIZED_STORAGE = 'torn_status_gui_minimized_v1_widget';
    const AUTOSTART_PREFERENCE_STORAGE = 'torn_autostart_preference_v1_widget';
    const LINK_TYPE_SETTINGS_PREFIX = 'torn_link_type_v1_widget_';
    const TOS_ACCEPTED_STORAGE = 'torn_tos_accepted_v1_widget'; 

    let apiKey, isMinimized, tosAccepted; 
    let intervals = { 
        update:null,energy:null,nerve:null,happiness:null, 
        booster:null, medical:null, drug:null, newDay: null, 
        travel: null, race: null,
        travelEndFlashTimeout: null, raceEndFlashTimeout: null 
    };
    let guiContainer, minimizeButton, customTooltipElement;
    let lifeDisplayValue, energyDisplayValue, nerveDisplayValue, happinessDisplayValue, boosterDisplayValue, medicalDisplayValue, drugDisplayValue;
    let energyTimerDisplay, nerveTimerDisplay, happinessTimerDisplay, boosterTimerDisplay, medicalTimerDisplay, drugTimerDisplay;
    let newDayTimerDisplay;
    let apiSetupDiv, statusDiv, refillsDiv, notificationsDiv, versionDiv, updateNotificationElement; 
    let energyRefillStatus, nerveRefillStatus, tokenRefillStatus;
    let messagesIconDisplay, messagesCountDisplay, eventsIconDisplay, eventsCountDisplay;
    let closeButton, settingsButton;
    let healthBarFillDisplay;

    let travelStatusDiv, travelLinkElement, travelLabelElement, travelDestinationValue, travelTimerDisplay, travelErrorDiv;
    let raceStatusDiv, raceLinkElement, raceLabelElement, raceInfoValue, raceTimerDisplay, raceErrorDiv;

    let apiKeyInputMain, apiKeySaveButtonMain, apiErrorMain, firstRunAutostartOptionDiv, firstRunAutostartCheckbox;
    let settingsPanel, settingsApiKeyInput, settingsApiKeySaveButton, settingsApiKeyClearButton, settingsApiError, settingsAutostartCheckbox, settingsPanelCloseButton;

    let tosSection, tosCheckbox;

    let userMaxBoosterCooldownSeconds = 48 * 3600;
    let userMaxMedicalCooldownSeconds = 6 * 3600;

    // Variables to store the last successfully fetched data
    let lastGoodPrimaryData = null;
    let lastGoodRaceData = null;

    const mailIconSVG = `<svg viewBox="0 0 24 24" fill="currentColor" width="16px" height="16px"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`;
    const eventIconSVG = `<svg viewBox="0 0 24 24" fill="currentColor" width="16px" height="16px"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;

    const itemLinkUrls = {
        drug: {
            personal: 'https://www.torn.com/item.php#drugs-items',
            faction: 'https://www.torn.com/factions.php?step=your&type=1#/tab=armoury&start=0&sub=drugs',
            elementId: 'drug-cooldown-link',
            toggleId: 'drug-link-type-toggle',
            personalLabelId: 'drug-personal-label',
            factionLabelId: 'drug-faction-label'
        },
        booster: {
            personal: 'https://www.torn.com/item.php#energy-d-items',
            faction: 'https://www.torn.com/factions.php?step=your&type=1#/tab=armoury&start=0&sub=boosters',
            elementId: 'booster-cooldown-link',
            toggleId: 'booster-link-type-toggle',
            personalLabelId: 'booster-personal-label',
            factionLabelId: 'booster-faction-label'
        },
        medical: {
            personal: 'https://www.torn.com/item.php#medical-items',
            faction: 'https://www.torn.com/factions.php?step=your&type=1#/tab=armoury&start=0&sub=medical',
            elementIds: ['medical-cooldown-link', 'life-link'],
            toggleId: 'medical-link-type-toggle',
            personalLabelId: 'medical-personal-label',
            factionLabelId: 'medical-faction-label'
        },
        energyRefill: { 
            personal: 'https://www.torn.com/page.php?sid=points',
            faction: 'https://www.torn.com/factions.php?step=your&type=1#/tab=armoury&start=0&sub=points',
            elementId: 'energy-refill-link',
            toggleId: 'energyRefill-link-type-toggle',
            personalLabelId: 'energyRefill-personal-label',
            factionLabelId: 'energyRefill-faction-label'
        },
        nerveRefill: { 
            personal: 'https://www.torn.com/page.php?sid=points',
            faction: 'https://www.torn.com/factions.php?step=your&type=1#/tab=armoury&start=0&sub=points', 
            elementId: 'nerve-refill-link',
            toggleId: 'nerveRefill-link-type-toggle',
            personalLabelId: 'nerveRefill-personal-label',
            factionLabelId: 'nerveRefill-faction-label'
        }
    };
    let linkTargetElements = {};
    let linkToggleElements = {};


    async function enablePluginAutostart() {
        try {
            await invoke('plugin:autostart|enable');
            console.log('Autostart enabled via official plugin.');
        } catch (e) {
            console.error('Failed to enable autostart via official plugin:', e);
        }
    }

    async function disablePluginAutostart() {
        try {
            await invoke('plugin:autostart|disable');
            console.log('Autostart disabled via official plugin.');
        } catch (e) {
            console.error('Failed to disable autostart via official plugin:', e);
        }
    }

    async function isPluginAutostartEnabled() {
        try {
            const enabled = await invoke('plugin:autostart|is_enabled');
            console.log('Official plugin autostart status:', enabled);
            return enabled;
        } catch (e) {
            console.error('Failed to check official plugin autostart status:', e);
            return false;
        }
    }

    async function resizeWindowToContent() {
        if (!guiContainer || !appWindow || !versionDiv || !document.getElementById('torn-status-header')) return;

        const wasGuiHidden = guiContainer.style.display === 'none';
        if (wasGuiHidden) {
            guiContainer.style.visibility = 'hidden';
            guiContainer.style.display = 'block';
        }

        guiContainer.offsetHeight; 

        const header = document.getElementById('torn-status-header');
        let calculatedInnerHeight = 0;

        calculatedInnerHeight += header.offsetHeight;
        calculatedInnerHeight += parseInt(getComputedStyle(header).marginBottom) || 0;

        if (settingsPanel && settingsPanel.style.display === 'flex') {
            calculatedInnerHeight += settingsPanel.offsetHeight;
            const settingsStyle = getComputedStyle(settingsPanel);
            calculatedInnerHeight += (parseInt(settingsStyle.paddingTop) || 0) + (parseInt(settingsStyle.paddingBottom) || 0);

        } else {
            let mainContentActualHeight = 0;
            const mainSections = [apiSetupDiv, notificationsDiv, travelStatusDiv, raceStatusDiv, statusDiv, refillsDiv, firstRunAutostartOptionDiv];
            let isFirstVisibleInSection = true;
            let previousMarginBottom = 0;

            for (const section of mainSections) {
                if (section && getComputedStyle(section).display !== 'none') {
                    const sectionStyle = getComputedStyle(section);
                    const currentMarginTop = parseInt(sectionStyle.marginTop) || 0;

                    if (!isFirstVisibleInSection) {
                        mainContentActualHeight += Math.max(previousMarginBottom, currentMarginTop);
                    } else {
                         mainContentActualHeight += currentMarginTop; 
                    }
                    mainContentActualHeight += section.offsetHeight;
                    previousMarginBottom = parseInt(sectionStyle.marginBottom) || 0;
                    isFirstVisibleInSection = false; 
                }
            }
             if (!isFirstVisibleInSection) { 
                mainContentActualHeight += previousMarginBottom;
            }
            calculatedInnerHeight += mainContentActualHeight;
        }

        calculatedInnerHeight += parseInt(getComputedStyle(versionDiv).marginTop) || 0;
        calculatedInnerHeight += versionDiv.offsetHeight;

        const guiStyle = getComputedStyle(guiContainer);
        const finalWindowHeight = calculatedInnerHeight +
                             (parseInt(guiStyle.paddingTop) || 0) +
                             (parseInt(guiStyle.paddingBottom) || 0) +
                             (parseInt(guiStyle.borderTopWidth) || 0) +
                             (parseInt(guiStyle.borderBottomWidth) || 0) +
                             ( (settingsPanel && settingsPanel.style.display === 'flex') ? 0 : 10); 

        if (wasGuiHidden) {
            guiContainer.style.display = 'none';
            guiContainer.style.visibility = 'visible';
        }
        requestAnimationFrame(async () => {
            try {
                const currentWidth = guiContainer.offsetWidth;

                if (finalWindowHeight > 0 && currentWidth > 0) {
                    await appWindow.setSize(new LogicalSize(Math.ceil(currentWidth), Math.ceil(finalWindowHeight)));
                }
            } catch (e) {
                console.error("Error resizing window (RAF):", e);
            }
        });
    }

    function formatSecondsToHMS(totalSeconds) {
        if (isNaN(totalSeconds) || totalSeconds < 0) return '--:--:--';
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function cacheGUIElements() {
        guiContainer = document.getElementById('torn-status-gui');
        minimizeButton = document.getElementById('torn-status-minimize-btn');
        closeButton = document.getElementById('torn-status-close-btn');
        settingsButton = document.getElementById('torn-status-settings-btn');
        customTooltipElement = document.getElementById('custom-tooltip');
        versionDiv = document.getElementById('widget-version');
        updateNotificationElement = document.getElementById('update-notification'); 

        apiSetupDiv = document.getElementById('torn-status-api-setup');
        apiKeyInputMain = document.getElementById('torn-api-key-input-main');
        apiKeySaveButtonMain = document.getElementById('torn-api-key-save-btn-main');
        apiErrorMain = apiSetupDiv.querySelector('.api-error-main');
        
        tosSection = document.getElementById('tos-section');
        tosCheckbox = document.getElementById('tos-checkbox');

        firstRunAutostartOptionDiv = document.getElementById('first-run-autostart-option');
        firstRunAutostartCheckbox = document.getElementById('first-run-autostart-checkbox');

        settingsPanel = document.getElementById('torn-status-settings-panel');
        settingsApiKeyInput = document.getElementById('torn-api-key-input-settings');
        settingsApiKeySaveButton = document.getElementById('torn-api-key-save-btn-settings');
        settingsApiKeyClearButton = document.getElementById('torn-api-key-clear-btn-settings');
        settingsApiError = settingsPanel.querySelector('.api-error-settings');
        settingsAutostartCheckbox = document.getElementById('settings-autostart-checkbox');
        settingsPanelCloseButton = document.getElementById('settings-panel-close-btn');

        travelStatusDiv = document.getElementById('torn-travel-status');
        travelLinkElement = document.getElementById('travel-link');
        if (travelLinkElement) travelLabelElement = travelLinkElement.querySelector('span:first-child');
        travelDestinationValue = travelStatusDiv.querySelector('.travel-destination-value');
        travelTimerDisplay = travelStatusDiv.querySelector('.travel-timer');
        travelErrorDiv = travelStatusDiv.querySelector('.travel-error');

        raceStatusDiv = document.getElementById('torn-race-status');
        raceLinkElement = document.getElementById('race-link');
        if (raceLinkElement) raceLabelElement = raceLinkElement.querySelector('span:first-child');
        raceInfoValue = raceStatusDiv.querySelector('.race-info-value');
        raceTimerDisplay = raceStatusDiv.querySelector('.race-timer');
        raceErrorDiv = raceStatusDiv.querySelector('.race-error');


        if (!guiContainer) return;

        if (versionDiv) {
            versionDiv.innerHTML = `Author: <a href="${AUTHOR_URL}" target="_blank" title="View Author's Profile">${AUTHOR_NAME}</a> | <a href="${FORUM_THREAD_URL}" target="_blank" title="Go to Forum Thread">v${SCRIPT_VERSION}</a><span id="update-notification" style="display:none;"> <a href="#" target="_blank">New version available!</a></span>`;
            updateNotificationElement = document.getElementById('update-notification'); 
        }


        if (isMinimized) {
            guiContainer.classList.add('minimized');
            if(minimizeButton) { minimizeButton.textContent = '□'; minimizeButton.title = 'Maximize'; }
        } else {
            guiContainer.classList.remove('minimized');
            if(minimizeButton) { minimizeButton.textContent = '−'; minimizeButton.title = 'Minimize'; }
        }

        lifeDisplayValue = guiContainer.querySelector('.life-value-overlay');
        healthBarFillDisplay = guiContainer.querySelector('.health-bar-fill');
        energyDisplayValue = guiContainer.querySelector('.energy-value');
        nerveDisplayValue = guiContainer.querySelector('.nerve-value');
        happinessDisplayValue = guiContainer.querySelector('.happy-value');
        boosterDisplayValue = guiContainer.querySelector('.booster-value');
        medicalDisplayValue = guiContainer.querySelector('.medical-value');
        drugDisplayValue = guiContainer.querySelector('.drug-value');

        energyTimerDisplay = guiContainer.querySelector('.energy-timer');
        nerveTimerDisplay = guiContainer.querySelector('.nerve-timer');
        happinessTimerDisplay = guiContainer.querySelector('.happy-timer');
        boosterTimerDisplay = guiContainer.querySelector('.booster-timer');
        medicalTimerDisplay = guiContainer.querySelector('.medical-timer');
        drugTimerDisplay = guiContainer.querySelector('.drug-timer');
        newDayTimerDisplay = guiContainer.querySelector('.new-day-timer-value');

        notificationsDiv = document.getElementById('torn-status-notifications');
        statusDiv = document.getElementById('torn-status-content');
        refillsDiv = document.getElementById('torn-status-refills');

        messagesIconDisplay = notificationsDiv.querySelector('.messages-icon');
        messagesCountDisplay = notificationsDiv.querySelector('.messages-count');
        eventsIconDisplay = notificationsDiv.querySelector('.events-icon');
        eventsCountDisplay = notificationsDiv.querySelector('.events-count');

        energyRefillStatus = refillsDiv.querySelector('.energy-refill-status');
        nerveRefillStatus = refillsDiv.querySelector('.nerve-refill-status');
        tokenRefillStatus = refillsDiv.querySelector('.token-refill-status');

        for (const key in itemLinkUrls) {
            const item = itemLinkUrls[key];
            if (item.elementId) {
                linkTargetElements[key] = document.getElementById(item.elementId);
            } else if (item.elementIds) {
                linkTargetElements[key] = item.elementIds.map(id => document.getElementById(id));
            }
            linkToggleElements[key] = {
                input: document.getElementById(item.toggleId),
                personalLabel: document.getElementById(item.personalLabelId),
                factionLabel: document.getElementById(item.factionLabelId)
            };
        }


        if(minimizeButton) minimizeButton.addEventListener('click', toggleMinimize);
        if(closeButton) closeButton.addEventListener('click', async () => { await appWindow.close(); });
        if(settingsButton) settingsButton.addEventListener('click', toggleSettingsPanel);
        if(settingsPanelCloseButton) settingsPanelCloseButton.addEventListener('click', toggleSettingsPanel);

        if(apiKeySaveButtonMain) apiKeySaveButtonMain.addEventListener('click', () => saveApiKey(apiKeyInputMain, apiErrorMain));
        
        if(apiKeyInputMain) apiKeyInputMain.addEventListener('input', updateApiKeySaveButtonState);
        if(tosCheckbox) tosCheckbox.addEventListener('change', updateApiKeySaveButtonState);


        if(settingsApiKeySaveButton) settingsApiKeySaveButton.addEventListener('click', () => saveApiKey(settingsApiKeyInput, settingsApiError, true));
        if(settingsApiKeyInput) settingsApiKeyInput.addEventListener('keypress',(e)=>{ if(e.key === 'Enter') saveApiKey(settingsApiKeyInput, settingsApiError, true); });
        if(settingsApiKeyClearButton) settingsApiKeyClearButton.addEventListener('click', promptClearApiKey);

        if(firstRunAutostartCheckbox) firstRunAutostartCheckbox.addEventListener('change', handleAutostartChange);
        if(settingsAutostartCheckbox) settingsAutostartCheckbox.addEventListener('change', handleAutostartChange);

        const widgetHeader = document.getElementById('torn-status-header');
        if (widgetHeader) {
            widgetHeader.addEventListener('click', (e) => {
                if (isMinimized && guiContainer.classList.contains('minimized') && e.target === widgetHeader) {
                    toggleMinimize();
                }
            });
        }

        const hoverAreas = guiContainer.querySelectorAll('.timer-hover-area');
        hoverAreas.forEach(area => {
            area.addEventListener('mouseover', handleTooltipMouseOver);
            area.addEventListener('mouseout', handleTooltipMouseOut);
            area.addEventListener('mousemove', handleTooltipMouseMove);
        });
    }

    function updateApiKeySaveButtonState() {
        if (!apiKeySaveButtonMain || !apiKeyInputMain || !tosCheckbox) return;
        const keyIsValid = /^[a-zA-Z0-9]{16}$/.test(apiKeyInputMain.value.trim());
        apiKeySaveButtonMain.disabled = !(keyIsValid && tosCheckbox.checked);
    }

    function toggleSettingsPanel() {
        if (!settingsPanel) return;
        const isVisible = settingsPanel.style.display === 'flex';
        settingsPanel.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) {
            if(settingsApiKeyInput) settingsApiKeyInput.value = '';
            if(settingsApiError) settingsApiError.textContent = '';
        }
        resizeWindowToContent();
    }

    async function handleAutostartChange(event) {
        const isEnabled = event.target.checked;
        localStorage.setItem(AUTOSTART_PREFERENCE_STORAGE, isEnabled.toString());

        if (isEnabled) {
            await enablePluginAutostart();
        } else {
            await disablePluginAutostart();
        }
        if(firstRunAutostartCheckbox) firstRunAutostartCheckbox.checked = isEnabled;
        if(settingsAutostartCheckbox) settingsAutostartCheckbox.checked = isEnabled;
    }

    async function initializeAutostart() {
        let autostartPreference = localStorage.getItem(AUTOSTART_PREFERENCE_STORAGE);
        let shouldEnablePlugin = false;

        if (autostartPreference === null) {
            shouldEnablePlugin = true;
            localStorage.setItem(AUTOSTART_PREFERENCE_STORAGE, 'true');
            autostartPreference = 'true';
        } else {
            shouldEnablePlugin = autostartPreference === 'true';
        }

        if (shouldEnablePlugin) {
            await enablePluginAutostart();
        }
        const isChecked = autostartPreference === 'true';
        if(firstRunAutostartCheckbox) firstRunAutostartCheckbox.checked = isChecked;
        if(settingsAutostartCheckbox) settingsAutostartCheckbox.checked = isChecked;
    }

    function updateLinkPreferenceUI(itemKey, isFaction) {
        const toggleInfo = linkToggleElements[itemKey];
        if (toggleInfo && toggleInfo.personalLabel && toggleInfo.factionLabel) {
            toggleInfo.personalLabel.classList.toggle('active-preference', !isFaction);
            toggleInfo.factionLabel.classList.toggle('active-preference', isFaction);
        }
    }

    function applyLinkPreference(itemKey, isFaction) {
        const urlDetails = itemLinkUrls[itemKey];
        const targetLinkElementOrArray = linkTargetElements[itemKey];

        if (!urlDetails || !targetLinkElementOrArray) {
            console.warn(`No URL details or target element for ${itemKey}`);
            return;
        }

        const newUrl = isFaction ? urlDetails.faction : urlDetails.personal;

        if (Array.isArray(targetLinkElementOrArray)) {
            targetLinkElementOrArray.forEach(el => {
                if (el) el.href = newUrl;
            });
        } else {
            if (targetLinkElementOrArray) targetLinkElementOrArray.href = newUrl;
        }
        updateLinkPreferenceUI(itemKey, isFaction);
    }

    function initializeLinkTypeSettings() {
        Object.keys(itemLinkUrls).forEach(itemKey => {
            const toggleInfo = linkToggleElements[itemKey];
            if (!toggleInfo || !toggleInfo.input) {
                console.warn(`Toggle input not found for ${itemKey}`);
                return;
            }

            const savedSetting = localStorage.getItem(LINK_TYPE_SETTINGS_PREFIX + itemKey);
            const isFaction = savedSetting === 'faction';

            toggleInfo.input.checked = isFaction;
            applyLinkPreference(itemKey, isFaction);

            toggleInfo.input.addEventListener('change', (event) => {
                const newIsFaction = event.target.checked;
                localStorage.setItem(LINK_TYPE_SETTINGS_PREFIX + itemKey, newIsFaction ? 'faction' : 'personal');
                applyLinkPreference(itemKey, newIsFaction);
            });
        });
    }


    function handleTooltipMouseOver(event) {
        const targetElement = event.currentTarget;
        const timerSpan = targetElement.querySelector('.timer');
        if (customTooltipElement && timerSpan && timerSpan.dataset.tooltipContent) {
            customTooltipElement.innerHTML = timerSpan.dataset.tooltipContent;
            customTooltipElement.style.display = 'block';
            positionTooltip(event.pageX, event.pageY);
        }
    }
    function handleTooltipMouseOut() {
        if (customTooltipElement) {
            customTooltipElement.style.display = 'none';
        }
    }
    function handleTooltipMouseMove(event) {
        if (customTooltipElement && customTooltipElement.style.display === 'block') {
            positionTooltip(event.pageX, event.pageY);
        }
    }

    function positionTooltip(x, y) {
        if (!customTooltipElement) return;
        const offsetX = 10, offsetY = 15;
        let newX = x + offsetX;
        let newY = y + offsetY;

        const tooltipRect = customTooltipElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        if (newX + tooltipRect.width > viewportWidth) {
            newX = x - tooltipRect.width - offsetX;
        }
        if (newY + tooltipRect.height > viewportHeight) {
            newY = y - tooltipRect.height - offsetY;
        }
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;

        customTooltipElement.style.left = `${newX}px`;
        customTooltipElement.style.top = `${newY}px`;
    }

    async function fetchData(){
        if(!apiKey){
            updateDisplay({error:"API Key needed",target:'api_main', isTransient: false}); 
            switchView(false);
            if (intervals.update) {
                clearInterval(intervals.update);
                intervals.update = null;
            }
            clearAllTimers(); 
            return;
        }
        
        let primaryFetchAttempted = false;
        let raceFetchAttempted = false;

        const primaryUrl=`https://api.torn.com/user/?selections=bars,cooldowns,refills,personalstats,notifications,travel&key=${apiKey}&comment=TornStatusWidget_v${SCRIPT_VERSION}`;
        const primaryController=new AbortController();
        const primaryTimeoutId=setTimeout(()=>primaryController.abort(),10000);
        primaryFetchAttempted = true;

        try{
            const response=await fetch(primaryUrl,{method:'GET',signal:primaryController.signal});
            clearTimeout(primaryTimeoutId);

            if(!response.ok){
                let errorData;
                try{ errorData=await response.json(); }
                catch(parseErr){ throw new Error(`HTTP error ${response.status}`); }

                if(errorData && errorData.error){
                    const errMessage=`API Error ${errorData.error.code}`;
                    if(errorData.error.code===2){ 
                        apiKey=null;
                        localStorage.removeItem(API_KEY_STORAGE);
                        if(intervals.update) { clearInterval(intervals.update); intervals.update=null; }
                        clearAllTimers(); 
                        updateDisplay({error:errMessage, target:'api_main', isTransient: false});
                        switchView(false);
                        return; 
                    } else {
                        updateDisplay({error:errMessage, target:'status', isTransient: true});
                    }
                }else{
                    updateDisplay({error:`HTTP error ${response.status}`,target:'status', isTransient: true});
                }
            } else {
                const data=await response.json();
                if(data.error){
                    if(data.error.code===2){ 
                        apiKey=null;
                        localStorage.removeItem(API_KEY_STORAGE);
                        if(intervals.update) { clearInterval(intervals.update); intervals.update=null; }
                        clearAllTimers();
                        updateDisplay({error:`API Error ${data.error.code}`, target:'api_main', isTransient: false});
                        switchView(false);
                        return;
                    } else {
                        updateDisplay({error:`API Error ${data.error.code}`, target:'status', isTransient: true});
                    }
                }else{
                    lastGoodPrimaryData = data; 
                    updateDisplay(lastGoodPrimaryData); 
                    startTimers(lastGoodPrimaryData);   
                    clearErrorMessages('primary'); 
                }
            }
        }catch(error){ 
            clearTimeout(primaryTimeoutId);
            const errorMsg = error.name === 'AbortError' ? 'Timeout (User Data)' : 'Network Error (User Data)';
            updateDisplay({error: errorMsg, target:'status', isTransient: true});
        }

        if (apiKey) { 
            const raceUrl = `https://api.torn.com/v2/user/races?limit=1&sort=DESC&key=${apiKey}&comment=TornStatusWidget_v${SCRIPT_VERSION}`;
            const raceController = new AbortController();
            const raceTimeoutId = setTimeout(() => raceController.abort(), 10000);
            raceFetchAttempted = true;

            try {
                const raceResponse = await fetch(raceUrl, { method: 'GET', signal: raceController.signal });
                clearTimeout(raceTimeoutId);

                if (!raceResponse.ok) {
                    let raceErrorData;
                    try { raceErrorData = await raceResponse.json(); } catch (e) { /* ignore */ }
                    const raceErrCode = raceErrorData && raceErrorData.error ? raceErrorData.error.code : raceResponse.status;
                    if(raceErrorDiv) raceErrorDiv.textContent = `Race API Err: ${raceErrCode}`;
                    if (lastGoodRaceData) {
                        updateRaceDisplay(lastGoodRaceData);
                        startRaceTimer(lastGoodRaceData);
                    } else {
                        updateRaceDisplay(null); 
                    }
                } else {
                    const raceData = await raceResponse.json();
                    if (raceData.error) {
                        if(raceErrorDiv) raceErrorDiv.textContent = `Race API Err: ${raceData.error.code}`;
                        if (lastGoodRaceData) {
                            updateRaceDisplay(lastGoodRaceData);
                            startRaceTimer(lastGoodRaceData);
                        } else {
                            updateRaceDisplay(null);
                        }
                    } else {
                        if(raceErrorDiv) raceErrorDiv.textContent = ''; 
                        lastGoodRaceData = raceData; 
                        updateRaceDisplay(lastGoodRaceData);
                        startRaceTimer(lastGoodRaceData);
                    }
                }
            } catch (raceError) {
                clearTimeout(raceTimeoutId);
                if(raceErrorDiv) raceErrorDiv.textContent = raceError.name === 'AbortError' ? 'Race Timeout' : 'Race Net Err';
                if (lastGoodRaceData) {
                    updateRaceDisplay(lastGoodRaceData);
                    startRaceTimer(lastGoodRaceData);
                } else {
                    updateRaceDisplay(null);
                }
            }
        } else { 
            updateRaceDisplay(null); 
        }
        
        if (!isMinimized && !(settingsPanel && settingsPanel.style.display === 'flex')) {
            if (apiKey && tosAccepted) { 
                 switchView(true);
            } else {
                switchView(false); 
            }
        }
        resizeWindowToContent(); 
    }


    function updateDisplay(data){ 
        const statusErrDiv = guiContainer.querySelector('.status-error');

        if (data.error && !data.isTransient) { 
            const currentApiErrorDiv = (settingsPanel && settingsPanel.style.display === 'flex') ? settingsApiError : apiErrorMain;
            if (data.target === 'api_main' && apiErrorMain) apiErrorMain.textContent = `Error: ${data.error}`;
            else if (data.target === 'api_settings' && settingsApiError) settingsApiError.textContent = `Error: ${data.error}`;
            else if (statusErrDiv) statusErrDiv.textContent = `Error: ${data.error}`;
            
            if (data.target === 'api_main' || data.target === 'api_settings') return;
        } else if (data.error && data.isTransient) { 
             if (statusErrDiv) statusErrDiv.textContent = `Error: ${data.error}`;
        }

        const sourceData = data.error ? lastGoodPrimaryData : data; 

        if (!sourceData) { 
            if (travelErrorDiv && !data.error) travelErrorDiv.textContent = ''; 
            if (raceErrorDiv && !data.error) raceErrorDiv.textContent = '';   
            return;
        }
        
        if (!data.error) { 
            const currentApiErrorDiv = (settingsPanel && settingsPanel.style.display === 'flex') ? settingsApiError : apiErrorMain;
            if(currentApiErrorDiv) currentApiErrorDiv.textContent = '';
            if(statusErrDiv) statusErrDiv.textContent = '';
        }

        updateTravelDisplay(sourceData.travel); 

        if (sourceData.personalstats && typeof sourceData.personalstats.boosters_max_cooldown_hours === 'number') {
            userMaxBoosterCooldownSeconds = sourceData.personalstats.boosters_max_cooldown_hours * 3600;
        }

        if (sourceData.notifications) {
            const msgCount = sourceData.notifications.messages || 0;
            const evtCount = sourceData.notifications.events || 0;
            if (messagesIconDisplay) messagesIconDisplay.innerHTML = mailIconSVG;
            if (messagesCountDisplay) {
                messagesCountDisplay.textContent = msgCount;
                messagesIconDisplay.className = msgCount > 0 ? 'notification-icon messages-icon red' : 'notification-icon messages-icon green';
                messagesCountDisplay.className = msgCount > 0 ? 'notification-count messages-count red' : 'notification-count messages-count green';
            }
            if (eventsIconDisplay) eventsIconDisplay.innerHTML = eventIconSVG;
            if (eventsCountDisplay) {
                eventsCountDisplay.textContent = evtCount;
                eventsIconDisplay.className = evtCount > 0 ? 'notification-icon events-icon red' : 'notification-icon events-icon green';
                eventsCountDisplay.className = evtCount > 0 ? 'notification-count events-count red' : 'notification-count events-count green';
            }
        } else {
            if(messagesIconDisplay) messagesIconDisplay.innerHTML = mailIconSVG;
            if(messagesCountDisplay) { messagesCountDisplay.textContent = 'N/A'; messagesIconDisplay.className = 'notification-icon messages-icon green'; messagesCountDisplay.className = 'notification-count messages-count green';}
            if(eventsIconDisplay) eventsIconDisplay.innerHTML = eventIconSVG;
            if(eventsCountDisplay) { eventsCountDisplay.textContent = 'N/A'; eventsIconDisplay.className = 'notification-icon events-icon green'; eventsCountDisplay.className = 'notification-count events-count green';}
        }

        if(lifeDisplayValue && sourceData.life && typeof sourceData.life.current !=='undefined' && typeof sourceData.life.maximum !=='undefined' && sourceData.life.maximum > 0){
            lifeDisplayValue.textContent=`${sourceData.life.current}/${sourceData.life.maximum}`;
            if (healthBarFillDisplay) {
                const percentage = (sourceData.life.current / sourceData.life.maximum) * 100;
                healthBarFillDisplay.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
                if (percentage <= 25) {
                    healthBarFillDisplay.style.backgroundColor = '#dc3545';
                } else if (percentage <= 50) {
                    healthBarFillDisplay.style.backgroundColor = '#ffc107';
                } else {
                    healthBarFillDisplay.style.backgroundColor = '#28a745';
                }
            }
        } else if (lifeDisplayValue) {
            lifeDisplayValue.textContent='N/A';
            if (healthBarFillDisplay) {
                 healthBarFillDisplay.style.width = '0%';
                 healthBarFillDisplay.style.backgroundColor = '#444';
            }
        }

        if(energyDisplayValue&&sourceData.energy&&typeof sourceData.energy.current!=='undefined')energyDisplayValue.textContent=`${sourceData.energy.current}/${sourceData.energy.maximum}`;else if(energyDisplayValue)energyDisplayValue.textContent='N/A';
        if(nerveDisplayValue&&sourceData.nerve&&typeof sourceData.nerve.current!=='undefined')nerveDisplayValue.textContent=`${sourceData.nerve.current}/${sourceData.nerve.maximum}`;else if(nerveDisplayValue)nerveDisplayValue.textContent='N/A';
        if(happinessDisplayValue&&sourceData.happy&&typeof sourceData.happy.current!=='undefined')happinessDisplayValue.textContent=`${sourceData.happy.current}/${sourceData.happy.maximum}`;else if(happinessDisplayValue)happinessDisplayValue.textContent='N/A';

        if (sourceData.cooldowns) {
            if (boosterDisplayValue) {
                boosterDisplayValue.textContent = sourceData.cooldowns.booster > 0 ? 'Active' : 'Ready';
                if (sourceData.cooldowns.booster === 0) {
                    boosterDisplayValue.classList.add('flashing');
                    if (boosterTimerDisplay) boosterTimerDisplay.classList.add('flashing');
                } else {
                    boosterDisplayValue.classList.remove('flashing');
                    if (boosterTimerDisplay) boosterTimerDisplay.classList.remove('flashing');
                }
            }
            if (medicalDisplayValue) {
                medicalDisplayValue.textContent = sourceData.cooldowns.medical > 0 ? 'Active' : 'Ready';
            }
            if (drugDisplayValue) {
                drugDisplayValue.textContent = sourceData.cooldowns.drug > 0 ? 'Active' : 'Ready';
                if (sourceData.cooldowns.drug === 0) {
                    drugDisplayValue.classList.add('flashing');
                    if (drugTimerDisplay) drugTimerDisplay.classList.add('flashing');
                } else {
                    drugDisplayValue.classList.remove('flashing');
                    if (drugTimerDisplay) drugTimerDisplay.classList.remove('flashing');
                }
            }
        } else {
            if(boosterDisplayValue) { boosterDisplayValue.textContent = 'N/A'; boosterDisplayValue.classList.remove('flashing'); if(boosterTimerDisplay) boosterTimerDisplay.classList.remove('flashing');}
            if(medicalDisplayValue) { medicalDisplayValue.textContent = 'N/A'; medicalDisplayValue.classList.remove('flashing'); if(medicalTimerDisplay) medicalTimerDisplay.classList.remove('flashing');} 
            if(drugDisplayValue) { drugDisplayValue.textContent = 'N/A'; drugDisplayValue.classList.remove('flashing'); if(drugTimerDisplay) drugTimerDisplay.classList.remove('flashing');}
        }

        if (sourceData.refills) {
            if (energyRefillStatus) {
                energyRefillStatus.textContent = sourceData.refills.energy_refill_used ? 'Used' : 'Ready';
                energyRefillStatus.className = sourceData.refills.energy_refill_used ? 'refill-status used' : 'refill-status ready';
            }
            if (nerveRefillStatus) {
                nerveRefillStatus.textContent = sourceData.refills.nerve_refill_used ? 'Used' : 'Ready';
                nerveRefillStatus.className = sourceData.refills.nerve_refill_used ? 'refill-status used' : 'refill-status ready';
            }
            if (tokenRefillStatus) {
                tokenRefillStatus.textContent = sourceData.refills.token_refill_used ? 'Used' : 'Ready';
                tokenRefillStatus.className = sourceData.refills.token_refill_used ? 'refill-status used' : 'refill-status ready';
            }
        } else {
            if(energyRefillStatus) energyRefillStatus.textContent = 'N/A';
            if(nerveRefillStatus) nerveRefillStatus.textContent = 'N/A';
            if(tokenRefillStatus) tokenRefillStatus.textContent = 'N/A';
        }
    }

    function updateTravelDisplay(travelData) { 
        if (!travelStatusDiv || !travelLabelElement || !travelDestinationValue || !travelTimerDisplay) return;
        
        const currentTravelData = travelData || (lastGoodPrimaryData ? lastGoodPrimaryData.travel : null);

        if (intervals.travelEndFlashTimeout) {
            clearTimeout(intervals.travelEndFlashTimeout);
            intervals.travelEndFlashTimeout = null;
        }
        travelLabelElement.classList.remove('label-flash-red');

        if (currentTravelData && currentTravelData.time_left > 0) { 
            travelStatusDiv.style.display = 'block';
            travelDestinationValue.textContent = currentTravelData.destination || "Unknown";
            travelTimerDisplay.textContent = formatSecondsToHMS(currentTravelData.time_left);
            travelTimerDisplay.dataset.tooltipContent = `Arriving in ${currentTravelData.destination || "Unknown"}`;
            travelTimerDisplay.classList.remove('soon'); 
        } else {
            if (!travelLabelElement.classList.contains('label-flash-red')) {
                 travelStatusDiv.style.display = 'none';
            }
            if (intervals.travel) { 
                clearTimeout(intervals.travel);
                intervals.travel = null;
            }
        }
    }

    function updateRaceDisplay(raceData) { 
        if (!raceStatusDiv || !raceLabelElement || !raceInfoValue || !raceTimerDisplay) return;
        const currentTimestamp = Math.floor(Date.now() / 1000);

        const currentRaceDataToDisplay = raceData || lastGoodRaceData;

        if (intervals.raceEndFlashTimeout) {
            clearTimeout(intervals.raceEndFlashTimeout);
            intervals.raceEndFlashTimeout = null;
        }
        raceLabelElement.classList.remove('label-flash-red');


        if (currentRaceDataToDisplay && currentRaceDataToDisplay.races && currentRaceDataToDisplay.races.length > 0) {
            const race = currentRaceDataToDisplay.races[0]; 
            if (race.status === "starting" || race.status === "active" || race.status === "in_progress" || (race.status === "scheduled" && race.schedule.start > currentTimestamp)) {
                 raceStatusDiv.style.display = 'block';
                let infoText = `Track: ${race.track_id}`; 
                let timerValue = '--:--:--';
                let tooltip = `Race: ${race.title}`;
                raceTimerDisplay.classList.remove('soon');

                if (race.status === "starting" || (race.status === "scheduled" && race.schedule.start > currentTimestamp) ) {
                    const timeToStart = race.schedule.start - currentTimestamp;
                    if (timeToStart > 0) {
                        timerValue = formatSecondsToHMS(timeToStart);
                        infoText = `Starts in:`;
                        tooltip += `\nStarts: ${new Date(race.schedule.start * 1000).toLocaleTimeString()}`;
                    } else { 
                        infoText = (race.status === "in_progress" ? "In Progress" : "Active");
                        timerValue = "Ongoing";
                         tooltip += `\nStatus: ${race.status}`;
                    }
                } else if (race.status === "active" || race.status === "in_progress") {
                    infoText = race.status === "in_progress" ? "In Progress" : "Active";
                    const timeToEnd = race.schedule.end - currentTimestamp;
                     timerValue = timeToEnd > 0 ? formatSecondsToHMS(timeToEnd) : "Ending soon";
                    tooltip += `\nEnds: ${new Date(race.schedule.end * 1000).toLocaleTimeString()}`;
                }
                
                raceInfoValue.textContent = infoText;
                raceTimerDisplay.textContent = timerValue;
                raceTimerDisplay.dataset.tooltipContent = tooltip;
                return; 
            }
        }
        if (!raceLabelElement.classList.contains('label-flash-red')) {
            raceStatusDiv.style.display = 'none';
        }
        if (intervals.race) {
            clearTimeout(intervals.race);
            intervals.race = null;
        }
    }


    function startTimers(data){ 
        const nonRaceTravelTimerKeys = ['energy', 'nerve', 'happiness', 'booster', 'medical', 'drug', 'newDay'];
        nonRaceTravelTimerKeys.forEach(key => {
            if (intervals[key]) {
                if (key === 'newDay') clearInterval(intervals[key]);
                else clearTimeout(intervals[key]);
                intervals[key] = null;
            }
        });

        if(data.energy&&typeof data.energy.fulltime!=='undefined'&&energyTimerDisplay)updateTimer('energy',data.energy.fulltime,energyTimerDisplay, 0);else if(energyTimerDisplay){energyTimerDisplay.textContent="N/A";energyTimerDisplay.classList.remove('full')}
        if(data.nerve&&typeof data.nerve.fulltime!=='undefined'&&nerveTimerDisplay)updateTimer('nerve',data.nerve.fulltime,nerveTimerDisplay, 0);else if(nerveTimerDisplay){nerveTimerDisplay.textContent="N/A";nerveTimerDisplay.classList.remove('full')}
        if(data.happy&&typeof data.happy.fulltime!=='undefined'&&happinessTimerDisplay)updateTimer('happiness',data.happy.fulltime,happinessTimerDisplay, 0);else if(happinessTimerDisplay){happinessTimerDisplay.textContent="N/A";happinessTimerDisplay.classList.remove('full')}

        if (data.cooldowns) {
            if (typeof data.cooldowns.booster !== 'undefined' && boosterTimerDisplay) {
                if (data.cooldowns.booster > 0) {
                    updateTimer('booster', data.cooldowns.booster, boosterTimerDisplay, userMaxBoosterCooldownSeconds);
                } else {
                    boosterTimerDisplay.textContent = formatSecondsToHMS(userMaxBoosterCooldownSeconds);
                    boosterTimerDisplay.classList.add('full');
                    boosterTimerDisplay.classList.add('flashing');
                    if(boosterDisplayValue) boosterDisplayValue.classList.add('flashing');
                    boosterTimerDisplay.dataset.tooltipContent = `Ready\nMax Duration: ${formatSecondsToHMS(userMaxBoosterCooldownSeconds)}`;
                }
            } else if (boosterTimerDisplay) {
                boosterTimerDisplay.textContent = "N/A";
                boosterTimerDisplay.classList.remove('full','flashing');
                if(boosterDisplayValue) boosterDisplayValue.classList.remove('flashing');
                boosterTimerDisplay.dataset.tooltipContent = "Booster: N/A";
            }

            if (typeof data.cooldowns.medical !== 'undefined' && medicalTimerDisplay) {
                if (data.cooldowns.medical > 0) {
                    updateTimer('medical', data.cooldowns.medical, medicalTimerDisplay, userMaxMedicalCooldownSeconds);
                } else {
                    medicalTimerDisplay.textContent = formatSecondsToHMS(userMaxMedicalCooldownSeconds);
                    medicalTimerDisplay.classList.add('full');
                    medicalTimerDisplay.dataset.tooltipContent = `Ready\nMax Duration: ${formatSecondsToHMS(userMaxMedicalCooldownSeconds)}`;
                }
            } else if (medicalTimerDisplay) {
                medicalTimerDisplay.textContent = "N/A";
                medicalTimerDisplay.classList.remove('full','flashing');
                 if(medicalDisplayValue) medicalDisplayValue.classList.remove('flashing');
                medicalTimerDisplay.dataset.tooltipContent = "Medical: N/A";
            }

            if (typeof data.cooldowns.drug !== 'undefined' && drugTimerDisplay) {
                if (data.cooldowns.drug > 0) {
                     updateTimer('drug', data.cooldowns.drug, drugTimerDisplay, 0);
                } else {
                    drugTimerDisplay.textContent = 'Ready';
                    drugTimerDisplay.classList.add('full');
                    drugTimerDisplay.classList.add('flashing');
                    if(drugDisplayValue) drugDisplayValue.classList.add('flashing');
                    drugTimerDisplay.dataset.tooltipContent = `Ready`;
                }
            } else if (drugTimerDisplay) {
                drugTimerDisplay.textContent = "N/A";
                drugTimerDisplay.classList.remove('full','flashing');
                if(drugDisplayValue) drugDisplayValue.classList.remove('flashing');
                drugTimerDisplay.dataset.tooltipContent = "Drug: N/A";
            }
        }
        startNewDayTimer(); 
        startTravelTimer(data.travel); 
    }

    function startTravelTimer(travelData) { 
        if (intervals.travel) clearTimeout(intervals.travel);
        if (intervals.travelEndFlashTimeout) { 
            clearTimeout(intervals.travelEndFlashTimeout);
            intervals.travelEndFlashTimeout = null;
            if(travelLabelElement) travelLabelElement.classList.remove('label-flash-red');
        }
        
        const currentTravelData = travelData || (lastGoodPrimaryData ? lastGoodPrimaryData.travel : null);

        if (!travelTimerDisplay || !currentTravelData || currentTravelData.time_left <= 0) {
            if(travelStatusDiv && ! (travelLabelElement && travelLabelElement.classList.contains('label-flash-red')) ) { 
                 travelStatusDiv.style.display = 'none';
            }
            return;
        }

        let secondsRemaining = currentTravelData.time_left;
        travelStatusDiv.style.display = 'block'; 
        if(travelLabelElement) travelLabelElement.classList.remove('label-flash-red'); 

        function tick() {
            if (secondsRemaining <= 0) {
                travelTimerDisplay.textContent = "Arrived!";
                travelTimerDisplay.classList.remove('soon');
                travelDestinationValue.textContent = currentTravelData.destination || "Destination"; 
                if(travelLabelElement) travelLabelElement.classList.add('label-flash-red');
                intervals.travel = null;

                if (intervals.travelEndFlashTimeout) clearTimeout(intervals.travelEndFlashTimeout);
                intervals.travelEndFlashTimeout = setTimeout(() => {
                    if(travelLabelElement) travelLabelElement.classList.remove('label-flash-red');
                    if(travelStatusDiv) travelStatusDiv.style.display = 'none';
                    resizeWindowToContent();
                    // fetchData(); // Removed to prevent loop if API is still down or data unchanged
                }, 10000); 
            } else {
                travelTimerDisplay.textContent = formatSecondsToHMS(secondsRemaining);
                travelDestinationValue.textContent = currentTravelData.destination || "Destination"; 
                travelTimerDisplay.dataset.tooltipContent = `Arriving in ${currentTravelData.destination || "Unknown"} at ${new Date((currentTravelData.timestamp - currentTravelData.time_left + secondsRemaining) * 1000).toLocaleTimeString()}`;


                if (secondsRemaining <= 60) { 
                    travelTimerDisplay.classList.add('soon');
                } else {
                    travelTimerDisplay.classList.remove('soon');
                }
                secondsRemaining--;
                intervals.travel = setTimeout(tick, 1000);
            }
            // resizeWindowToContent(); 
        }
        tick();
    }

    function startRaceTimer(raceData) { 
        if (intervals.race) clearTimeout(intervals.race);
        if (intervals.raceEndFlashTimeout) { 
            clearTimeout(intervals.raceEndFlashTimeout);
            intervals.raceEndFlashTimeout = null;
            if(raceLabelElement) raceLabelElement.classList.remove('label-flash-red');
        }

        const currentRaceDataToDisplay = raceData || lastGoodRaceData;

        if (!raceTimerDisplay || !currentRaceDataToDisplay || !currentRaceDataToDisplay.races || currentRaceDataToDisplay.races.length === 0) {
            if(raceStatusDiv && !(raceLabelElement && raceLabelElement.classList.contains('label-flash-red'))) {
                raceStatusDiv.style.display = 'none';
            }
            return;
        }
        
        const race = currentRaceDataToDisplay.races[0];
        const currentTimestamp = Math.floor(Date.now() / 1000);
        let secondsRemaining = 0;
        let raceState = "none"; 

        if (race.status === "starting" || (race.status === "scheduled" && race.schedule.start > currentTimestamp)) {
            secondsRemaining = race.schedule.start - currentTimestamp;
            raceState = "starting";
        } else if (race.status === "active" || race.status === "in_progress") {
            secondsRemaining = race.schedule.end - currentTimestamp;
            raceState = "active_ending";
        }

        if (raceState === "none" || secondsRemaining < 0) { 
             if(raceStatusDiv && !(raceLabelElement && raceLabelElement.classList.contains('label-flash-red'))) {
                raceStatusDiv.style.display = 'none';
            }
            return;
        }
        raceStatusDiv.style.display = 'block';
        if(raceLabelElement) raceLabelElement.classList.remove('label-flash-red');


        function tick() {
            if (secondsRemaining <= 0) {
                intervals.race = null;
                if (raceState === "starting") { 
                    raceInfoValue.textContent = (race.status === "in_progress" ? "In Progress" : "Active"); // Update with actual status
                    raceTimerDisplay.textContent = "Ongoing";
                    raceTimerDisplay.dataset.tooltipContent = `Race: ${race.title}\nStatus: ${race.status}`;
                    // fetchData(); // Removed to prevent potential loops, main interval will catch it
                } else if (raceState === "active_ending") { 
                    raceInfoValue.textContent = "Finished!";
                    raceTimerDisplay.textContent = "--:--:--";
                    raceTimerDisplay.dataset.tooltipContent = `Race: ${race.title}\nStatus: Finished`;
                    if(raceLabelElement) raceLabelElement.classList.add('label-flash-red');
                    
                    if (intervals.raceEndFlashTimeout) clearTimeout(intervals.raceEndFlashTimeout);
                    intervals.raceEndFlashTimeout = setTimeout(() => {
                        if(raceLabelElement) raceLabelElement.classList.remove('label-flash-red');
                        if(raceStatusDiv) raceStatusDiv.style.display = 'none';
                        resizeWindowToContent();
                        // fetchData(); // Removed
                    }, 10000); 
                }
                return;
            }

            raceTimerDisplay.textContent = formatSecondsToHMS(secondsRemaining);
            if (raceState === "starting") {
                raceInfoValue.textContent = "Starts in:";
                raceTimerDisplay.dataset.tooltipContent = `Race: ${race.title}\nStarts at: ${new Date(race.schedule.start * 1000).toLocaleTimeString()}`;
            } else if (raceState === "active_ending") {
                raceInfoValue.textContent = "Ends in:"; // Simplified
                 raceTimerDisplay.dataset.tooltipContent = `Race: ${race.title}\nEnds at: ${new Date(race.schedule.end * 1000).toLocaleTimeString()}`;
            }
            
            if (secondsRemaining <= 60) { 
                raceTimerDisplay.classList.add('soon');
            } else {
                raceTimerDisplay.classList.remove('soon');
            }

            secondsRemaining--;
            intervals.race = setTimeout(tick, 1000);
            // resizeWindowToContent();
        }
        tick();
    }


    function startNewDayTimer() {
        if (intervals.newDay) clearInterval(intervals.newDay);
        if (!newDayTimerDisplay) return;

        function update() {
            const now = new Date();
            const tomorrowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
            const diffSeconds = Math.floor((tomorrowUTC.getTime() - now.getTime()) / 1000);

            const isWarningPeriod = diffSeconds < 3600 && diffSeconds >= 0;

            if (isWarningPeriod) {
                newDayTimerDisplay.classList.add('new-day-warning');
            } else {
                newDayTimerDisplay.classList.remove('new-day-warning');
            }

            newDayTimerDisplay.textContent = formatSecondsToHMS(diffSeconds >= 0 ? diffSeconds : 0);

            let newDayShouldFlash = false;
            if (energyRefillStatus) {
                if (isWarningPeriod && energyRefillStatus.textContent === 'Ready') {
                    energyRefillStatus.classList.add('flashing');
                    newDayShouldFlash = true;
                } else {
                    energyRefillStatus.classList.remove('flashing');
                }
            }
            if (nerveRefillStatus) {
                if (isWarningPeriod && nerveRefillStatus.textContent === 'Ready') {
                    nerveRefillStatus.classList.add('flashing');
                    newDayShouldFlash = true;
                } else {
                    nerveRefillStatus.classList.remove('flashing');
                }
            }

            if (newDayShouldFlash && isWarningPeriod) {
                newDayTimerDisplay.classList.add('flashing');
            } else {
                newDayTimerDisplay.classList.remove('flashing');
            }
        }
        update();
        intervals.newDay = setInterval(update, 1000);
    }


    function updateTimer(barName, initialSecondsRemaining, displayElement, maxCooldownSeconds) {
        if (!displayElement) return;
        if (intervals[barName]) clearTimeout(intervals[barName]); 

        let secondsRemaining = Number(initialSecondsRemaining);
        if (isNaN(secondsRemaining)) {
            displayElement.textContent = "Error";
            displayElement.classList.remove('full', 'flashing');
            if (barName === 'booster' && boosterDisplayValue) boosterDisplayValue.classList.remove('flashing');
            if (barName === 'drug' && drugDisplayValue) drugDisplayValue.classList.remove('flashing');
            displayElement.dataset.tooltipContent = "Error";
            intervals[barName] = null;
            return;
        }

        let valueDisplayElement = null;
        if (barName === 'booster') valueDisplayElement = boosterDisplayValue;
        else if (barName === 'medical') valueDisplayElement = medicalDisplayValue;
        else if (barName === 'drug') valueDisplayElement = drugDisplayValue;


        function tick() {
            let currentTooltipText = '';
            const now = Date.now();

            if (secondsRemaining <= 0) {
                displayElement.classList.add('full');
                intervals[barName] = null;

                if ((barName === 'booster' || barName === 'medical' || barName === 'drug')) {
                     if (valueDisplayElement) valueDisplayElement.textContent = 'Ready';
                     if (barName === 'booster' || barName === 'drug') { 
                        if (valueDisplayElement) valueDisplayElement.classList.add('flashing');
                        displayElement.classList.add('flashing');
                     }
                }

                if ((barName === 'booster' || barName === 'medical') && maxCooldownSeconds > 0) {
                    displayElement.textContent = formatSecondsToHMS(maxCooldownSeconds);
                    currentTooltipText = `Ready\nMax Duration: ${formatSecondsToHMS(maxCooldownSeconds)}`;
                } else if (barName === 'drug') {
                    displayElement.textContent = "Ready";
                    currentTooltipText = `Ready`;
                } else {
                    displayElement.textContent = "Full";
                    currentTooltipText = `Full`;
                }
                displayElement.dataset.tooltipContent = currentTooltipText;

            } else {
                displayElement.classList.remove('full', 'flashing');
                if (valueDisplayElement) valueDisplayElement.classList.remove('flashing');
                if (valueDisplayElement && (barName === 'booster' || barName === 'medical' || barName === 'drug')){
                     valueDisplayElement.textContent = 'Active';
                }

                const endsTimestamp = new Date(now + secondsRemaining * 1000).toLocaleString([], {dateStyle: 'short', timeStyle: 'medium'});

                if ((barName === 'booster' || barName === 'medical') && maxCooldownSeconds > 0) {
                    displayElement.textContent = formatSecondsToHMS(secondsRemaining);
                    currentTooltipText = `Ends: ${endsTimestamp}\nUsed: ${formatSecondsToHMS(secondsRemaining)}`;
                } else if (barName === 'drug') {
                    displayElement.textContent = formatSecondsToHMS(secondsRemaining);
                    currentTooltipText = `Ends: ${endsTimestamp}\n(Drug active)`;
                } else {
                    displayElement.textContent = formatSecondsToHMS(secondsRemaining);
                    currentTooltipText = `Ends: ${endsTimestamp}`;
                }
                displayElement.dataset.tooltipContent = currentTooltipText;
                secondsRemaining--;
                intervals[barName] = setTimeout(tick, 1000);
            }
        }
        tick();
    }

    function clearAllTimers(){ 
        Object.keys(intervals).forEach(key => {
            if (intervals[key]) {
                if (key === 'update' || key === 'newDay') { 
                   clearInterval(intervals[key]);
                } else { 
                   clearTimeout(intervals[key]);
                }
                intervals[key] = null;
            }
        });
        lastGoodPrimaryData = null; 
        lastGoodRaceData = null;

        const elementsToClearFlash = [
            energyRefillStatus, nerveRefillStatus, newDayTimerDisplay,
            boosterDisplayValue, boosterTimerDisplay,
            drugDisplayValue, drugTimerDisplay,
            medicalDisplayValue, medicalTimerDisplay,
            travelTimerDisplay, raceTimerDisplay,
            travelLabelElement, raceLabelElement 
        ];
        elementsToClearFlash.forEach(el => {
            if (el) el.classList.remove('flashing', 'new-day-warning', 'soon', 'label-flash-red');
        });

        const timersToResetText = [
            energyTimerDisplay, nerveTimerDisplay, happinessTimerDisplay,
            boosterTimerDisplay, medicalTimerDisplay, drugTimerDisplay,
            newDayTimerDisplay, travelTimerDisplay, raceTimerDisplay 
        ];
        timersToResetText.forEach(timer => {
            if(timer){ timer.textContent='--:--:--'; if(timer.classList) timer.classList.remove('full'); if(timer.dataset) timer.dataset.tooltipContent = "";}
        });

        if(lifeDisplayValue) lifeDisplayValue.textContent = '--/--';
        if(healthBarFillDisplay) healthBarFillDisplay.style.width = '0%';
        if(energyDisplayValue)energyDisplayValue.textContent='--/--';
        if(nerveDisplayValue)nerveDisplayValue.textContent='--/--';
        if(happinessDisplayValue)happinessDisplayValue.textContent='--/--';
        if(boosterDisplayValue)boosterDisplayValue.textContent='--';
        if(medicalDisplayValue)medicalDisplayValue.textContent='--';
        if(drugDisplayValue)drugDisplayValue.textContent='--';
        if(messagesIconDisplay) messagesIconDisplay.innerHTML = mailIconSVG;
        if(messagesCountDisplay) {messagesCountDisplay.textContent = '--'; messagesIconDisplay.className = 'notification-icon messages-icon green'; messagesCountDisplay.className = 'notification-count messages-count green';}
        if(eventsIconDisplay) eventsIconDisplay.innerHTML = eventIconSVG;
        if(eventsCountDisplay) {eventsCountDisplay.textContent = '--'; eventsIconDisplay.className = 'notification-icon events-icon green'; eventsCountDisplay.className = 'notification-count events-count green';}
        if(energyRefillStatus) energyRefillStatus.textContent = '--';
        if(nerveRefillStatus) nerveRefillStatus.textContent = '--';
        if(tokenRefillStatus) tokenRefillStatus.textContent = '--';
        if(travelDestinationValue) travelDestinationValue.textContent = '--';
        if(raceInfoValue) raceInfoValue.textContent = '--';
        if(travelStatusDiv) travelStatusDiv.style.display = 'none';
        if(raceStatusDiv) raceStatusDiv.style.display = 'none';
    }

    function clearDataDisplayTimers() { 
        const dataTimerKeys = ['energy', 'nerve', 'happiness', 'booster', 'medical', 'drug', 'newDay', 'travel', 'race', 'travelEndFlashTimeout', 'raceEndFlashTimeout'];
        dataTimerKeys.forEach(key => {
            if (intervals[key]) {
                if (key === 'newDay') { 
                    clearInterval(intervals[key]);
                } else { 
                    clearTimeout(intervals[key]);
                }
                intervals[key] = null;
            }
        });
        const elementsToClearFlash = [
            energyRefillStatus, nerveRefillStatus, newDayTimerDisplay,
            boosterDisplayValue, boosterTimerDisplay,
            drugDisplayValue, drugTimerDisplay,
            medicalDisplayValue, medicalTimerDisplay,
            travelTimerDisplay, raceTimerDisplay,
            travelLabelElement, raceLabelElement 
        ];
        elementsToClearFlash.forEach(el => {
            if (el) el.classList.remove('flashing', 'new-day-warning', 'soon', 'label-flash-red');
        });

        const timersToResetText = [
            energyTimerDisplay, nerveTimerDisplay, happinessTimerDisplay,
            boosterTimerDisplay, medicalTimerDisplay, drugTimerDisplay,
            newDayTimerDisplay, travelTimerDisplay, raceTimerDisplay 
        ];
        timersToResetText.forEach(timer => {
            if(timer){ timer.textContent='--:--:--'; if(timer.classList) timer.classList.remove('full'); if(timer.dataset) timer.dataset.tooltipContent = "";}
        });
        
        // Conditional hiding based on whether they are in an end-flash state
        if(travelStatusDiv && (!apiKey || (travelErrorDiv && travelErrorDiv.textContent)) && !(travelLabelElement && travelLabelElement.classList.contains('label-flash-red'))) {
            travelStatusDiv.style.display = 'none';
        }
        if(raceStatusDiv && (!apiKey || (raceErrorDiv && raceErrorDiv.textContent)) && !(raceLabelElement && raceLabelElement.classList.contains('label-flash-red'))) {
            raceStatusDiv.style.display = 'none';
        }
    }


    function clearErrorMessages(type = 'all'){ 
        if (type === 'all' || type === 'primary') {
            const apiErrorMainDiv = apiSetupDiv.querySelector('.api-error-main');
            const settingsApiErrorDiv = settingsPanel.querySelector('.api-error-settings');
            const statusErrDiv = guiContainer.querySelector('.status-error');
            if(apiErrorMainDiv) apiErrorMainDiv.textContent = '';
            if(settingsApiErrorDiv) settingsApiErrorDiv.textContent = '';
            if(statusErrDiv) statusErrDiv.textContent = '';
        }
        if (type === 'all' || type === 'travel') { // Travel errors are part of primary, so cleared with primary
            // if(travelErrorDiv) travelErrorDiv.textContent = ''; // Redundant if cleared by primary
        }
        if (type === 'all' || type === 'race') {
            if(raceErrorDiv) raceErrorDiv.textContent = '';
        }
    }

    function toggleMinimize(){
        isMinimized=!isMinimized;
        if(guiContainer) guiContainer.classList.toggle('minimized',isMinimized);
        if(minimizeButton){minimizeButton.textContent=isMinimized?'□':'−';minimizeButton.title=isMinimized?'Maximize':'Minimize'}
        localStorage.setItem(GUI_MINIMIZED_STORAGE,isMinimized.toString());

        if (!isMinimized && settingsPanel && settingsPanel.style.display === 'flex') {
            settingsPanel.style.display = 'none';
            resizeWindowToContent();
            settingsPanel.style.display = 'flex';
            resizeWindowToContent();
        } else {
             resizeWindowToContent();
        }

        if(!isMinimized && apiKey && tosAccepted) { 
            switchView(true);
        } else if (!isMinimized && (!apiKey || !tosAccepted)) {
            switchView(false);
        }
    }

    function saveApiKey(inputElement, errorElement, fromSettings = false){
        if(!inputElement || !errorElement) return;
        const newKey = inputElement.value.trim();
        
        if (!fromSettings && tosCheckbox && !tosCheckbox.checked) {
            errorElement.textContent = "Please accept the Terms of Service.";
            return;
        }

        if(newKey && /^[a-zA-Z0-9]{16}$/.test(newKey)){
            apiKey = newKey;
            localStorage.setItem(API_KEY_STORAGE, apiKey);
            if (!fromSettings) { 
                localStorage.setItem(TOS_ACCEPTED_STORAGE, 'true'); 
                tosAccepted = true;
            }
            if(tosSection) tosSection.style.display = 'none'; 

            inputElement.value = '';
            clearErrorMessages();
            switchView(true); 
            if(intervals.update) clearInterval(intervals.update); 
            fetchData(); 
            intervals.update = setInterval(fetchData, UPDATE_INTERVAL_MS); 
            if(fromSettings) {
                toggleSettingsPanel();
            }
        } else {
            errorElement.textContent = "Invalid Key format (16 letters/numbers)";
        }
        if (!fromSettings) updateApiKeySaveButtonState(); 
    }

    function promptClearApiKey() {
        apiKey = null;
        localStorage.removeItem(API_KEY_STORAGE);
        if (intervals.update) {
            clearInterval(intervals.update);
            intervals.update = null;
        }
        clearAllTimers(); 
        updateDisplay({ error: "API Key cleared. Enter a new key.", target: 'api_settings', isTransient: false }); 
        switchView(false); 
        if(settingsApiKeyInput) settingsApiKeyInput.value = '';
    }


    function switchView(showStatus) {
        if (!apiSetupDiv || !notificationsDiv || !statusDiv || !refillsDiv || !guiContainer || !firstRunAutostartOptionDiv || !travelStatusDiv || !raceStatusDiv || !tosSection) return;

        tosAccepted = localStorage.getItem(TOS_ACCEPTED_STORAGE) === 'true';

        if (showStatus && apiKey && tosAccepted) { 
            notificationsDiv.style.setProperty('display', 'flex', 'important');
            statusDiv.style.setProperty('display', 'block', 'important');
            refillsDiv.style.setProperty('display', 'block', 'important');
            apiSetupDiv.style.setProperty('display', 'none', 'important');
            firstRunAutostartOptionDiv.style.display = 'none';
            tosSection.style.display = 'none'; 
        } else { 
            apiSetupDiv.style.setProperty('display', 'block', 'important');
            notificationsDiv.style.setProperty('display', 'none', 'important');
            statusDiv.style.setProperty('display', 'none', 'important');
            refillsDiv.style.setProperty('display', 'none', 'important');
            travelStatusDiv.style.setProperty('display', 'none', 'important');
            raceStatusDiv.style.setProperty('display', 'none', 'important');
            
            if (!tosAccepted) {
                tosSection.style.display = 'block';
            } else {
                tosSection.style.display = 'none';
            }
            firstRunAutostartOptionDiv.style.display = apiKey ? 'none' : 'block'; 
            updateApiKeySaveButtonState(); 
        }
    }

    function isNewerVersion(latestVersionTag, currentVersion) {
        const latest = latestVersionTag.replace(/^v/, '').split('.').map(Number);
        const current = currentVersion.replace(/^v/, '').split('.').map(Number);

        for (let i = 0; i < Math.max(latest.length, current.length); i++) {
            const latestPart = latest[i] || 0;
            const currentPart = current[i] || 0;
            if (latestPart > currentPart) return true;
            if (latestPart < currentPart) return false;
        }
        return false; 
    }

    async function checkForUpdates() {
        try {
            const response = await fetch(GITHUB_RELEASES_API_URL);
            if (!response.ok) {
                console.error(`GitHub API error: ${response.status}`);
                return;
            }
            const releaseData = await response.json();
            const latestVersionTag = releaseData.tag_name;

            if (latestVersionTag && isNewerVersion(latestVersionTag, SCRIPT_VERSION)) {
                if (updateNotificationElement) {
                    const updateLink = updateNotificationElement.querySelector('a');
                    if (updateLink) {
                        updateLink.href = GITHUB_RELEASES_PAGE_URL;
                        updateLink.textContent = `Update to ${latestVersionTag} available!`;
                    }
                    updateNotificationElement.style.display = 'inline'; 
                    resizeWindowToContent(); 
                }
            }
        } catch (error) {
            console.error("Failed to check for updates:", error);
        }
    }

    async function init() {
        apiKey = localStorage.getItem(API_KEY_STORAGE) || null;
        isMinimized = localStorage.getItem(GUI_MINIMIZED_STORAGE) === 'true';
        tosAccepted = localStorage.getItem(TOS_ACCEPTED_STORAGE) === 'true';


        cacheGUIElements();
        await initializeAutostart();
        initializeLinkTypeSettings();
        checkForUpdates(); 

        if(!guiContainer) return;

        if(!apiKey || !tosAccepted){ 
            if(!isMinimized){ switchView(false); }
            else{ 
                if(apiSetupDiv) apiSetupDiv.style.setProperty('display','block','important');
                if(notificationsDiv) notificationsDiv.style.setProperty('display','none','important');
                if(statusDiv) statusDiv.style.setProperty('display','none','important');
                if(refillsDiv) refillsDiv.style.setProperty('display','none','important');
                if(travelStatusDiv) travelStatusDiv.style.setProperty('display','none','important');
                if(raceStatusDiv) raceStatusDiv.style.setProperty('display','none','important');
                
                if (!tosAccepted && tosSection) { 
                    tosSection.style.display = 'block';
                } else if (tosSection) {
                    tosSection.style.display = 'none';
                }
                if(firstRunAutostartOptionDiv) firstRunAutostartOptionDiv.style.display = 'block';
            }
            if (!apiKey) clearAllTimers(); 
            updateApiKeySaveButtonState(); 
        }
        else{ 
            if(intervals.update) clearInterval(intervals.update); 
            fetchData(); 
            intervals.update=setInterval(fetchData,UPDATE_INTERVAL_MS); 
            if(!isMinimized){ switchView(true); }
            else { 
                if(notificationsDiv) notificationsDiv.style.setProperty('display','flex','important');
                if(statusDiv) statusDiv.style.setProperty('display','block','important');
                if(refillsDiv) refillsDiv.style.setProperty('display','block','important');
                if(apiSetupDiv) apiSetupDiv.style.setProperty('display','none','important');
                if(firstRunAutostartOptionDiv) firstRunAutostartOptionDiv.style.display = 'none';
                if(tosSection) tosSection.style.display = 'none';
            }
        }
        
        setTimeout(resizeWindowToContent, 100); 
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
