// Tauri API imports
import { getCurrentWindow, LogicalSize, PhysicalSize } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';
import { Store } from '@tauri-apps/plugin-store';
import { enable as enableAutostart, disable as disableAutostart, isEnabled as isAutostartEnabled } from '@tauri-apps/plugin-autostart';
import { isPermissionGranted, requestPermission, sendNotification as tauriSendNotification } from '@tauri-apps/plugin-notification'; 

// Get the current window instance
const appWindowInstance = getCurrentWindow();
console.log('[TRACE] appWindowInstance obtained:', appWindowInstance);

// Main store instance
let store;
const STORE_FILE_NAME = 'widgetsettings.dat';
const DEBUG_STORE_FILE_NAME = 'debugteststore.dat';
const PROBE_STORE_FILE_NAME = 'probestore.dat';

(async function() { 
    'use strict';
    console.log('[TRACE] IIFE started.');

    async function testStoreFunction() {
        console.log('[TRACE] testStoreFunction: Starting test...');
        if (!Store) {
            console.error('[TRACE] testStoreFunction: Store class is not available. Skipping test.');
            return;
        }
        if (!store && !(await (async () => {
            try {
                const probe = await Store.load(PROBE_STORE_FILE_NAME);
                return !!probe; 
            } catch (e) {
                console.warn('[TRACE] testStoreFunction: Probing store failed:', e);
                return false;
            }
        })())) {
             console.warn('[TRACE] testStoreFunction: Main store failed and probing indicates Store plugin might not be functional. Skipping test.');
             return;
        }

        let testStoreInstance;
        try {
            testStoreInstance = await Store.load(DEBUG_STORE_FILE_NAME); 
            console.log('[TRACE] testStoreFunction: Test store instance loaded via Store.load():', testStoreInstance, 'with path:', DEBUG_STORE_FILE_NAME);
            const initialKeys = await testStoreInstance.keys();
            console.log('[TRACE] testStoreFunction: Initial keys from test store:', initialKeys);
            await testStoreInstance.set('debugKey', 'debugValue');
            const value = await testStoreInstance.get('debugKey');
            if (value !== 'debugValue') {
                console.error('[TRACE] testStoreFunction: Value mismatch! Expected "debugValue", got:', value);
            }
            await testStoreInstance.save();
            await testStoreInstance.delete('debugKey');
            const clearedValue = await testStoreInstance.get('debugKey');
            if (clearedValue !== null && typeof clearedValue !== 'undefined') {
                 console.error('[TRACE] testStoreFunction: Key not properly cleared, value is:', clearedValue);
            }
        } catch (e) {
            console.error('[TRACE] testStoreFunction: Error during test:', e);
        }
        console.log('[TRACE] testStoreFunction: Test finished.');
    }

    // ===== Constants =====
    const SCRIPT_VERSION = "1.0.50"; // Updated version for track names
    const FORUM_THREAD_URL = "https://www.torn.com/forums.php#/p=threads&f=67&t=16473214&b=0&a=0";
    const AUTHOR_NAME = "GNSC4 [268863]";
    const AUTHOR_URL = "https://www.torn.com/profiles.php?XID=268863";
    const GITHUB_RELEASES_API_URL = "https://api.github.com/repos/gnsc4/Torn-Widget/releases/latest";
    const GITHUB_RELEASES_PAGE_URL = "https://github.com/gnsc4/Torn-Widget/releases";

    const UPDATE_INTERVAL_MS = 15 * 1000; 
    const API_KEY_STORAGE = 'torn_status_api_key_v1_widget';
    const GUI_MINIMIZED_STORAGE = 'torn_status_gui_minimized_v1_widget';
    const AUTOSTART_PREFERENCE_STORAGE = 'torn_autostart_preference_v1_widget';
    const ALWAYS_ON_TOP_PREFERENCE_STORAGE = 'torn_always_on_top_preference_v1_widget';
    const CLOSE_TO_TRAY_PREFERENCE_STORAGE = 'torn_close_to_tray_preference_v1_widget'; 
    const DESKTOP_NOTIFICATIONS_PREFERENCE_STORAGE = 'torn_desktop_notifications_v1_widget'; 
    const LINK_TYPE_SETTINGS_PREFIX = 'torn_link_type_v1_widget_'; 
    const TOS_ACCEPTED_STORAGE = 'torn_tos_accepted_v1_widget';
    const LAST_WINDOW_SIZE_STORAGE = 'torn_last_window_size_v1_widget'; 

    // Notification Settings Storage Constants
    const VOICE_NOTIFICATIONS_ENABLED_STORAGE = 'torn_voice_notifications_enabled_v1_widget';
    const NOTIFY_BOOSTER_READY_STORAGE = 'torn_notify_booster_ready_v1_widget';
    const NOTIFY_MEDICAL_READY_STORAGE = 'torn_notify_medical_ready_v1_widget';
    const NOTIFY_DRUG_READY_STORAGE = 'torn_notify_drug_ready_v1_widget';
    const NOTIFY_ENERGY_FULL_STORAGE = 'torn_notify_energy_full_v1_widget';
    const NOTIFY_NERVE_FULL_STORAGE = 'torn_notify_nerve_full_v1_widget';
    const NOTIFY_ENERGY_CUSTOM_ENABLED_STORAGE = 'torn_notify_energy_custom_enabled_v1_widget';
    const NOTIFY_ENERGY_CUSTOM_VALUE_STORAGE = 'torn_notify_energy_custom_value_v1_widget';
    const NOTIFY_LIFE_DOWN_STORAGE = 'torn_notify_life_down_v1_widget';
    const NOTIFY_LIFE_MAX_STORAGE = 'torn_notify_life_max_v1_widget';
    const NOTIFY_NEW_DAY_STORAGE = 'torn_notify_new_day_v1_widget';
    const NOTIFY_NEW_DAY_SOON_STORAGE = 'torn_notify_new_day_soon_v1_widget';
    const NOTIFY_TRAVEL_LANDING_SOON_STORAGE = 'torn_notify_travel_landing_soon_v1_widget'; 
    const NOTIFY_TRAVEL_ARRIVAL_STORAGE = 'torn_notify_travel_arrival_v1_widget';       
    const NOTIFY_RACE_STARTING_STORAGE = 'torn_notify_race_starting_v1_widget';         
    const NOTIFY_RACE_FINISHED_STORAGE = 'torn_notify_race_finished_v1_widget';         


    // UI Element Flashing Settings Storage Constants
    const FLASH_ENERGY_FULL_STORAGE = 'torn_flash_energy_full_v1_widget';
    const FLASH_NERVE_FULL_STORAGE = 'torn_flash_nerve_full_v1_widget';
    const FLASH_HAPPY_FULL_STORAGE = 'torn_flash_happy_full_v1_widget';
    const FLASH_BOOSTER_READY_STORAGE = 'torn_flash_booster_ready_v1_widget';
    const FLASH_MEDICAL_READY_STORAGE = 'torn_flash_medical_ready_v1_widget';
    const FLASH_DRUG_READY_STORAGE = 'torn_flash_drug_ready_v1_widget';
    const FLASH_TRAVEL_ARRIVED_STORAGE = 'torn_flash_travel_arrived_v1_widget';
    const FLASH_RACE_FINISHED_STORAGE = 'torn_flash_race_finished_v1_widget';

    // Racing Track Names
    const trackNames = {
        '6': 'Uptown', '7': 'Withdrawal', '8': 'Underdog', '9': 'Parkland', '10': 'Docks',
        '11': 'Commerce', '12': 'Two Islands', '15': 'Industrial', '16': 'Vector', '17': 'Mudpit',
        '18': 'Hammerhead', '19': 'Sewage', '20': 'Meltdown', '21': 'Speedway', '23': 'Stone Park', '24': 'Convict'
    };


    const MINIMIZED_WIDTH = 35; 
    const MINIMIZED_HEIGHT = 35; 


    // ===== State Variables =====
    let apiKey, isMinimized, tosAccepted;
    let closeToTrayEnabled = false; 
    let desktopNotificationsEnabled = false; 
    let intervals = { 
        update: null, energy: null, nerve: null, happiness: null,
        booster: null, medical: null, drug: null, newDay: null,
        travel: null, race: null,
        travelEndFlashTimeout: null, raceEndFlashTimeout: null,
        newDaySoonNotificationTimeout: null, newDayNotificationTimeout: null
    };
    let lastGoodPrimaryData = null;
    let lastGoodRaceData = null;
    let lastNormalWindowSize = null; 
    let lastLifeValue = null; 
    let lifeAlreadyNotifiedMax = false; 
    let newDayNotified = false; 
    let newDaySoonNotified = false; 
    let travelLandingSoonNotifiedThisTrip = false; 

    // Notification "already notified" flags
    let boosterReadyNotified = false;
    let medicalReadyNotified = false;
    let drugReadyNotified = false;
    let energyFullNotified = false;
    let nerveFullNotified = false;


    // Notification State Variables
    let voiceNotificationsEnabled = true; 
    let notifyOnBoosterReady = true;
    let notifyOnMedicalReady = true;
    let notifyOnDrugReady = true;
    let notifyOnEnergyFull = true;
    let notifyOnNerveFull = true;
    let notifyOnEnergyCustomEnabled = false;
    let notifyOnEnergyCustomValue = 25;
    let notifyOnLifeDown = false;
    let notifyOnLifeMax = false;
    let notifyOnNewDay = true;
    let notifyOnNewDaySoon = true;
    let notifyOnTravelLandingSoon = true; 
    let notifyOnTravelArrival = true;    
    let notifyOnRaceStarting = true;     
    let notifyOnRaceFinished = true;     

    // UI Element Flashing State Variables
    let flashOnEnergyFull = true;
    let flashOnNerveFull = true;
    let flashOnHappyFull = true; 
    let flashOnBoosterReady = true;
    let flashOnMedicalReady = true;
    let flashOnDrugReady = true;
    let flashOnTravelArrived = true;
    let flashOnRaceFinished = true;


    // ===== GUI Element Variables (cached in cacheGUIElements) =====
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
    let settingsPanel, settingsApiKeyInput, settingsApiKeySaveButton, settingsApiKeyClearButton, settingsApiError, settingsAutostartCheckbox, settingsAlwaysOnTopCheckbox, settingsCloseToTrayCheckbox, settingsDesktopNotificationsCheckbox, settingsPanelCloseButton; 
    let tosSection, tosCheckbox;

    // Notification Settings GUI Elements
    let settingsVoiceNotificationsCheckbox, settingsNotifyBoosterReadyCheckbox, settingsNotifyMedicalReadyCheckbox, settingsNotifyDrugReadyCheckbox, settingsNotifyEnergyFullCheckbox, settingsNotifyNerveFullCheckbox, settingsNotifyEnergyCustomCheckbox, settingsNotifyEnergyCustomValueInput, settingsNotifyLifeDownCheckbox, settingsNotifyLifeMaxCheckbox, settingsNotifyNewDayCheckbox, settingsNotifyNewDaySoonCheckbox, settingsNotifyTravelLandingSoonCheckbox, settingsNotifyTravelArrivalCheckbox, settingsNotifyRaceStartingCheckbox, settingsNotifyRaceFinishedCheckbox;

    // UI Element Flashing Settings GUI Elements
    let settingsFlashEnergyFullCheckbox, settingsFlashNerveFullCheckbox, settingsFlashHappyFullCheckbox, settingsFlashBoosterReadyCheckbox, settingsFlashMedicalReadyCheckbox, settingsFlashDrugReadyCheckbox, settingsFlashTravelArrivedCheckbox, settingsFlashRaceFinishedCheckbox;


    let userMaxBoosterCooldownSeconds = 48 * 3600;
    let userMaxMedicalCooldownSeconds = 6 * 3600;
    const mailIconSVG = `<svg viewBox="0 0 24 24" fill="currentColor" width="16px" height="16px"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`;
    const eventIconSVG = `<svg viewBox="0 0 24 24" fill="currentColor" width="16px" height="16px"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;
    const itemLinkUrls = {
        drug: { personal: 'https://www.torn.com/item.php#drugs-items', faction: 'https://www.torn.com/factions.php?step=your&type=1#/tab=armoury&start=0&sub=drugs', elementId: 'drug-cooldown-link', toggleId: 'drug-link-type-toggle', personalLabelId: 'drug-personal-label', factionLabelId: 'drug-faction-label' },
        booster: { personal: 'https://www.torn.com/item.php#energy-d-items', faction: 'https://www.torn.com/factions.php?step=your&type=1#/tab=armoury&start=0&sub=boosters', elementId: 'booster-cooldown-link', toggleId: 'booster-link-type-toggle', personalLabelId: 'booster-personal-label', factionLabelId: 'booster-faction-label' },
        medical: { personal: 'https://www.torn.com/item.php#medical-items', faction: 'https://www.torn.com/factions.php?step=your&type=1#/tab=armoury&start=0&sub=medical', elementIds: ['medical-cooldown-link', 'life-link'], toggleId: 'medical-link-type-toggle', personalLabelId: 'medical-personal-label', factionLabelId: 'medical-faction-label' },
        energyRefill: { personal: 'https://www.torn.com/page.php?sid=points', faction: 'https://www.torn.com/factions.php?step=your&type=1#/tab=armoury&start=0&sub=points', elementId: 'energy-refill-link', toggleId: 'energyRefill-link-type-toggle', personalLabelId: 'energyRefill-personal-label', factionLabelId: 'energyRefill-faction-label' },
        nerveRefill: { personal: 'https://www.torn.com/page.php?sid=points', faction: 'https://www.torn.com/factions.php?step=your&type=1#/tab=armoury&start=0&sub=points', elementId: 'nerve-refill-link', toggleId: 'nerveRefill-link-type-toggle', personalLabelId: 'nerveRefill-personal-label', factionLabelId: 'nerveRefill-faction-label' }
    };
    let linkTargetElements = {};
    let linkToggleElements = {};

    async function enableAppAutostart() { try { await enableAutostart(); console.log('[TRACE] Autostart enabled via plugin.'); } catch (e) { console.error('[TRACE] Failed to enable autostart via plugin:', e); }}
    async function disableAppAutostart() { try { await disableAutostart(); console.log('[TRACE] Autostart disabled via plugin.'); } catch (e) { console.error('[TRACE] Failed to disable autostart via plugin:', e); }}
    async function isAppAutostartEnabled() { try { const e = await isAutostartEnabled(); console.log('[TRACE] Plugin autostart status:', e); return e; } catch (e) { console.error('[TRACE] Failed to check plugin autostart status:', e); return false; }}

    async function resizeWindowToContent() {
        console.log('[TRACE] resizeWindowToContent called. isMinimized:', isMinimized);
        if (isMinimized) { 
            try {
                await appWindowInstance.setSize(new PhysicalSize(MINIMIZED_WIDTH, MINIMIZED_HEIGHT));
                console.log(`[TRACE] resizeWindowToContent: Window set to minimized size ${MINIMIZED_WIDTH}x${MINIMIZED_HEIGHT}`);
            } catch (e) {
                console.error("[TRACE] Error setting minimized window size:", e);
            }
            return;
        }

        if (!guiContainer || !versionDiv || !document.getElementById('torn-status-header')) {
            console.warn('[TRACE] resizeWindowToContent: Missing critical elements for dynamic resize. Aborting.');
            return;
        }

        const wasGuiHidden = guiContainer.style.display === 'none';
        if (wasGuiHidden) {
            guiContainer.style.visibility = 'hidden'; 
            guiContainer.style.display = 'block';
        }
        
        guiContainer.offsetHeight; 
        if (settingsPanel && settingsPanel.style.display === 'flex') {
            settingsPanel.offsetHeight; 
        }


        const header = document.getElementById('torn-status-header');
        let calculatedInnerHeight = 0;
        calculatedInnerHeight += header.offsetHeight;
        calculatedInnerHeight += parseInt(getComputedStyle(header).marginBottom) || 0;

        if (settingsPanel && settingsPanel.style.display === 'flex') {
            calculatedInnerHeight += settingsPanel.scrollHeight; 
        } else {
            let mainContentActualHeight = 0;
            const mainSections = [apiSetupDiv, notificationsDiv, travelStatusDiv, raceStatusDiv, statusDiv, refillsDiv, firstRunAutostartOptionDiv];
            let isFirstVisibleInSection = true;
            let previousMarginBottom = 0;
            for (const section of mainSections) {
                if (section && getComputedStyle(section).display !== 'none') {
                    const sectionStyle = getComputedStyle(section);
                    const currentMarginTop = parseInt(sectionStyle.marginTop) || 0;
                    if (!isFirstVisibleInSection) mainContentActualHeight += Math.max(previousMarginBottom, currentMarginTop);
                    else mainContentActualHeight += currentMarginTop;
                    mainContentActualHeight += section.offsetHeight;
                    previousMarginBottom = parseInt(sectionStyle.marginBottom) || 0;
                    isFirstVisibleInSection = false;
                }
            }
            if (!isFirstVisibleInSection) mainContentActualHeight += previousMarginBottom;
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
            ((settingsPanel && settingsPanel.style.display === 'flex') ? 0 : 5); 

        if (wasGuiHidden) {
            guiContainer.style.display = 'none'; 
            guiContainer.style.visibility = 'visible'; 
        }
        
        requestAnimationFrame(async () => {
            try {
                const currentWidth = guiContainer.offsetWidth; 
                if (finalWindowHeight > 0 && currentWidth > 0) {
                    if (currentWidth !== MINIMIZED_WIDTH || finalWindowHeight !== MINIMIZED_HEIGHT) {
                         lastNormalWindowSize = { width: Math.ceil(currentWidth), height: Math.ceil(finalWindowHeight) };
                        if (store) { 
                            await store.set(LAST_WINDOW_SIZE_STORAGE, lastNormalWindowSize);
                            await store.save();
                        }
                    }
                    await appWindowInstance.setSize(new LogicalSize(Math.ceil(currentWidth), Math.ceil(finalWindowHeight)));
                    console.log(`[TRACE] resizeWindowToContent (RAF): Setting size to ${currentWidth}x${Math.ceil(finalWindowHeight)}`);
                } else {
                    console.warn(`[TRACE] resizeWindowToContent (RAF): Invalid dimensions for setSize - H:${finalWindowHeight}, W:${currentWidth}`);
                }
            } catch (e) {
                console.error("[TRACE] Error resizing window (RAF):", e);
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
        console.log('[TRACE] cacheGUIElements: Starting.');
        guiContainer = document.getElementById('torn-status-gui');
        if (!guiContainer) {
            console.error('[TRACE] cacheGUIElements: guiContainer NOT FOUND. Aborting further caching and listener attachment.');
            const body = document.body;
            if (body) body.innerHTML = `<div style="color: red; padding: 20px; font-family: sans-serif;">Critical Error: UI container not found. JavaScript initialization failed.</div>`;
            return false; 
        }

        guiContainer.addEventListener('mouseenter', async () => {
            try {
                await appWindowInstance.setIgnoreCursorEvents(false);
                console.log('[TRACE] Mouse entered UI, enabling cursor events for window.');
            } catch (e) {
                console.error('[TRACE] Error enabling cursor events:', e);
            }
        });
        guiContainer.addEventListener('mouseleave', async () => {
            try {
                await appWindowInstance.setIgnoreCursorEvents(true);
                console.log('[TRACE] Mouse left UI, disabling cursor events for window (click-through).');
            } catch (e) {
                console.error('[TRACE] Error disabling cursor events:', e);
            }
        });


        minimizeButton = document.getElementById('torn-status-minimize-btn');
        closeButton = document.getElementById('torn-status-close-btn');
        settingsButton = document.getElementById('torn-status-settings-btn');
        customTooltipElement = document.getElementById('custom-tooltip');
        versionDiv = document.getElementById('widget-version');
        apiSetupDiv = document.getElementById('torn-status-api-setup');
        apiKeyInputMain = document.getElementById('torn-api-key-input-main');
        apiKeySaveButtonMain = document.getElementById('torn-api-key-save-btn-main');
        apiErrorMain = apiSetupDiv ? apiSetupDiv.querySelector('.api-error-main') : null;
        tosSection = document.getElementById('tos-section');
        tosCheckbox = document.getElementById('tos-checkbox');
        firstRunAutostartOptionDiv = document.getElementById('first-run-autostart-option');
        firstRunAutostartCheckbox = document.getElementById('first-run-autostart-checkbox');
        settingsPanel = document.getElementById('torn-status-settings-panel');
        settingsApiKeyInput = document.getElementById('torn-api-key-input-settings');
        settingsApiKeySaveButton = document.getElementById('torn-api-key-save-btn-settings');
        settingsApiKeyClearButton = document.getElementById('torn-api-key-clear-btn-settings');
        settingsApiError = settingsPanel ? settingsPanel.querySelector('.api-error-settings') : null;
        settingsAutostartCheckbox = document.getElementById('settings-autostart-checkbox');
        settingsAlwaysOnTopCheckbox = document.getElementById('settings-always-on-top-checkbox');
        settingsCloseToTrayCheckbox = document.getElementById('settings-close-to-tray-checkbox'); 
        settingsDesktopNotificationsCheckbox = document.getElementById('settings-desktop-notifications-checkbox'); 
        settingsPanelCloseButton = document.getElementById('settings-panel-close-btn');
        travelStatusDiv = document.getElementById('torn-travel-status');
        travelLinkElement = document.getElementById('travel-link');
        if (travelLinkElement) travelLabelElement = travelLinkElement.querySelector('span:first-child');
        travelDestinationValue = travelStatusDiv ? travelStatusDiv.querySelector('.travel-destination-value') : null;
        travelTimerDisplay = travelStatusDiv ? travelStatusDiv.querySelector('.travel-timer') : null;
        travelErrorDiv = travelStatusDiv ? travelStatusDiv.querySelector('.travel-error') : null;
        raceStatusDiv = document.getElementById('torn-race-status');
        raceLinkElement = document.getElementById('race-link');
        if (raceLinkElement) raceLabelElement = raceLinkElement.querySelector('span:first-child');
        raceInfoValue = raceStatusDiv ? raceStatusDiv.querySelector('.race-info-value') : null;
        raceTimerDisplay = raceStatusDiv ? raceStatusDiv.querySelector('.race-timer') : null;
        raceErrorDiv = raceStatusDiv ? raceStatusDiv.querySelector('.race-error') : null;
        if (versionDiv) {
            versionDiv.innerHTML = `Author: <a href="${AUTHOR_URL}" target="_blank" title="View Author's Profile">${AUTHOR_NAME}</a> | <a href="${FORUM_THREAD_URL}" target="_blank" title="Go to Forum Thread">v${SCRIPT_VERSION}</a><span id="update-notification" style="display:none;"> <a href="#" target="_blank">New version available!</a></span>`;
            updateNotificationElement = document.getElementById('update-notification');
        }
        if (guiContainer){
            if (isMinimized) {
                guiContainer.classList.add('minimized');
                if (minimizeButton) { minimizeButton.textContent = '□'; minimizeButton.title = 'Restore'; } 
            } else {
                guiContainer.classList.remove('minimized');
                if (minimizeButton) { minimizeButton.textContent = '−'; minimizeButton.title = 'Minimize'; }
            }
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
        messagesIconDisplay = notificationsDiv ? notificationsDiv.querySelector('.messages-icon') : null;
        messagesCountDisplay = notificationsDiv ? notificationsDiv.querySelector('.messages-count') : null;
        eventsIconDisplay = notificationsDiv ? notificationsDiv.querySelector('.events-icon') : null;
        eventsCountDisplay = notificationsDiv ? notificationsDiv.querySelector('.events-count') : null;
        energyRefillStatus = refillsDiv ? refillsDiv.querySelector('.energy-refill-status') : null;
        nerveRefillStatus = refillsDiv ? refillsDiv.querySelector('.nerve-refill-status') : null;
        tokenRefillStatus = refillsDiv ? refillsDiv.querySelector('.token-refill-status') : null;
        for (const key in itemLinkUrls) {
            const item = itemLinkUrls[key];
            if (item.elementId) linkTargetElements[key] = document.getElementById(item.elementId);
            else if (item.elementIds) linkTargetElements[key] = item.elementIds.map(id => document.getElementById(id));
            linkToggleElements[key] = {
                input: document.getElementById(item.toggleId),
                personalLabel: document.getElementById(item.personalLabelId),
                factionLabel: document.getElementById(item.factionLabelId)
            };
        }

        // Cache notification settings elements
        settingsVoiceNotificationsCheckbox = document.getElementById('settings-voice-notifications-checkbox');
        settingsNotifyBoosterReadyCheckbox = document.getElementById('settings-notify-booster-ready-checkbox');
        settingsNotifyMedicalReadyCheckbox = document.getElementById('settings-notify-medical-ready-checkbox');
        settingsNotifyDrugReadyCheckbox = document.getElementById('settings-notify-drug-ready-checkbox');
        settingsNotifyEnergyFullCheckbox = document.getElementById('settings-notify-energy-full-checkbox');
        settingsNotifyNerveFullCheckbox = document.getElementById('settings-notify-nerve-full-checkbox');
        settingsNotifyEnergyCustomCheckbox = document.getElementById('settings-notify-energy-custom-checkbox');
        settingsNotifyEnergyCustomValueInput = document.getElementById('settings-notify-energy-custom-value');
        settingsNotifyLifeDownCheckbox = document.getElementById('settings-notify-life-down-checkbox');
        settingsNotifyLifeMaxCheckbox = document.getElementById('settings-notify-life-max-checkbox');
        settingsNotifyNewDayCheckbox = document.getElementById('settings-notify-new-day-checkbox');
        settingsNotifyNewDaySoonCheckbox = document.getElementById('settings-notify-new-day-soon-checkbox');
        settingsNotifyTravelLandingSoonCheckbox = document.getElementById('settings-notify-travel-landing-soon-checkbox'); 
        settingsNotifyTravelArrivalCheckbox = document.getElementById('settings-notify-travel-arrival-checkbox');       
        settingsNotifyRaceStartingCheckbox = document.getElementById('settings-notify-race-starting-checkbox');         
        settingsNotifyRaceFinishedCheckbox = document.getElementById('settings-notify-race-finished-checkbox');         


        // Cache UI element flashing settings elements
        settingsFlashEnergyFullCheckbox = document.getElementById('settings-flash-energy-full-checkbox');
        settingsFlashNerveFullCheckbox = document.getElementById('settings-flash-nerve-full-checkbox');
        settingsFlashHappyFullCheckbox = document.getElementById('settings-flash-happy-full-checkbox');
        settingsFlashBoosterReadyCheckbox = document.getElementById('settings-flash-booster-ready-checkbox');
        settingsFlashMedicalReadyCheckbox = document.getElementById('settings-flash-medical-ready-checkbox');
        settingsFlashDrugReadyCheckbox = document.getElementById('settings-flash-drug-ready-checkbox');
        settingsFlashTravelArrivedCheckbox = document.getElementById('settings-flash-travel-arrived-checkbox');
        settingsFlashRaceFinishedCheckbox = document.getElementById('settings-flash-race-finished-checkbox');


        console.log('[TRACE] cacheGUIElements: Attaching event listeners.');
        if (minimizeButton) minimizeButton.addEventListener('click', toggleMinimize); 
        if (closeButton) {
            closeButton.addEventListener('click', async () => { 
                console.log('[TRACE] Close button clicked. Requesting window close from Tauri.'); 
                await appWindowInstance.close(); 
            });
        }
        if (settingsButton) settingsButton.addEventListener('click', toggleSettingsPanel);
        if (settingsPanelCloseButton) settingsPanelCloseButton.addEventListener('click', toggleSettingsPanel);
        if (apiKeySaveButtonMain) apiKeySaveButtonMain.addEventListener('click', () => saveApiKey(apiKeyInputMain, apiErrorMain));
        if (apiKeyInputMain) apiKeyInputMain.addEventListener('input', updateApiKeySaveButtonState);
        if (tosCheckbox) tosCheckbox.addEventListener('change', updateApiKeySaveButtonState);
        if (settingsApiKeySaveButton) settingsApiKeySaveButton.addEventListener('click', () => saveApiKey(settingsApiKeyInput, settingsApiError, true));
        if (settingsApiKeyInput) settingsApiKeyInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') saveApiKey(settingsApiKeyInput, settingsApiError, true); });
        if (settingsApiKeyClearButton) settingsApiKeyClearButton.addEventListener('click', promptClearApiKey);
        if (firstRunAutostartCheckbox) firstRunAutostartCheckbox.addEventListener('change', handleAutostartChange);
        if (settingsAutostartCheckbox) settingsAutostartCheckbox.addEventListener('change', handleAutostartChange);
        if (settingsAlwaysOnTopCheckbox) settingsAlwaysOnTopCheckbox.addEventListener('change', handleAlwaysOnTopChange);
        if (settingsCloseToTrayCheckbox) settingsCloseToTrayCheckbox.addEventListener('change', handleCloseToTrayChange); 
        if (settingsDesktopNotificationsCheckbox) settingsDesktopNotificationsCheckbox.addEventListener('change', handleDesktopNotificationsChange); 
        
        // Attach listeners for notification settings
        if (settingsVoiceNotificationsCheckbox) settingsVoiceNotificationsCheckbox.addEventListener('change', handleVoiceNotificationsChange);
        if (settingsNotifyBoosterReadyCheckbox) settingsNotifyBoosterReadyCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, NOTIFY_BOOSTER_READY_STORAGE, 'notifyOnBoosterReady'));
        if (settingsNotifyMedicalReadyCheckbox) settingsNotifyMedicalReadyCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, NOTIFY_MEDICAL_READY_STORAGE, 'notifyOnMedicalReady'));
        if (settingsNotifyDrugReadyCheckbox) settingsNotifyDrugReadyCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, NOTIFY_DRUG_READY_STORAGE, 'notifyOnDrugReady'));
        if (settingsNotifyEnergyFullCheckbox) settingsNotifyEnergyFullCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, NOTIFY_ENERGY_FULL_STORAGE, 'notifyOnEnergyFull'));
        if (settingsNotifyNerveFullCheckbox) settingsNotifyNerveFullCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, NOTIFY_NERVE_FULL_STORAGE, 'notifyOnNerveFull'));
        if (settingsNotifyEnergyCustomCheckbox) settingsNotifyEnergyCustomCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, NOTIFY_ENERGY_CUSTOM_ENABLED_STORAGE, 'notifyOnEnergyCustomEnabled'));
        if (settingsNotifyEnergyCustomValueInput) settingsNotifyEnergyCustomValueInput.addEventListener('input', handleEnergyCustomValueChange);
        if (settingsNotifyLifeDownCheckbox) settingsNotifyLifeDownCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, NOTIFY_LIFE_DOWN_STORAGE, 'notifyOnLifeDown'));
        if (settingsNotifyLifeMaxCheckbox) settingsNotifyLifeMaxCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, NOTIFY_LIFE_MAX_STORAGE, 'notifyOnLifeMax'));
        if (settingsNotifyNewDayCheckbox) settingsNotifyNewDayCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, NOTIFY_NEW_DAY_STORAGE, 'notifyOnNewDay'));
        if (settingsNotifyNewDaySoonCheckbox) settingsNotifyNewDaySoonCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, NOTIFY_NEW_DAY_SOON_STORAGE, 'notifyOnNewDaySoon'));
        if (settingsNotifyTravelLandingSoonCheckbox) settingsNotifyTravelLandingSoonCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, NOTIFY_TRAVEL_LANDING_SOON_STORAGE, 'notifyOnTravelLandingSoon')); 
        if (settingsNotifyTravelArrivalCheckbox) settingsNotifyTravelArrivalCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, NOTIFY_TRAVEL_ARRIVAL_STORAGE, 'notifyOnTravelArrival'));       
        if (settingsNotifyRaceStartingCheckbox) settingsNotifyRaceStartingCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, NOTIFY_RACE_STARTING_STORAGE, 'notifyOnRaceStarting'));         
        if (settingsNotifyRaceFinishedCheckbox) settingsNotifyRaceFinishedCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, NOTIFY_RACE_FINISHED_STORAGE, 'notifyOnRaceFinished'));         


        // Attach listeners for UI element flashing settings
        if (settingsFlashEnergyFullCheckbox) settingsFlashEnergyFullCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, FLASH_ENERGY_FULL_STORAGE, 'flashOnEnergyFull', true));
        if (settingsFlashNerveFullCheckbox) settingsFlashNerveFullCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, FLASH_NERVE_FULL_STORAGE, 'flashOnNerveFull', true));
        if (settingsFlashHappyFullCheckbox) settingsFlashHappyFullCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, FLASH_HAPPY_FULL_STORAGE, 'flashOnHappyFull', true));
        if (settingsFlashBoosterReadyCheckbox) settingsFlashBoosterReadyCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, FLASH_BOOSTER_READY_STORAGE, 'flashOnBoosterReady', true));
        if (settingsFlashMedicalReadyCheckbox) settingsFlashMedicalReadyCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, FLASH_MEDICAL_READY_STORAGE, 'flashOnMedicalReady', true));
        if (settingsFlashDrugReadyCheckbox) settingsFlashDrugReadyCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, FLASH_DRUG_READY_STORAGE, 'flashOnDrugReady', true));
        if (settingsFlashTravelArrivedCheckbox) settingsFlashTravelArrivedCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, FLASH_TRAVEL_ARRIVED_STORAGE, 'flashOnTravelArrived', true));
        if (settingsFlashRaceFinishedCheckbox) settingsFlashRaceFinishedCheckbox.addEventListener('change', (e) => handleGenericToggleChange(e.target.checked, FLASH_RACE_FINISHED_STORAGE, 'flashOnRaceFinished', true));


        const categoryHeaders = document.querySelectorAll('.settings-category-header');
        categoryHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const targetSectionId = header.dataset.targetSection;
                const targetSection = document.getElementById(targetSectionId);
                if (targetSection) {
                    const isOpening = targetSection.style.display === 'none';
                    targetSection.style.display = isOpening ? 'block' : 'none';
                    header.classList.toggle('open', isOpening);
                    requestAnimationFrame(resizeWindowToContent); 
                }
            });
        });

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
        console.log('[TRACE] cacheGUIElements: Finished.');
        return true; 
    }
    function updateApiKeySaveButtonState() { 
        if (!apiKeySaveButtonMain || !apiKeyInputMain || !tosCheckbox) return;
        const keyIsValid = /^[a-zA-Z0-9]{16}$/.test(apiKeyInputMain.value.trim());
        apiKeySaveButtonMain.disabled = !(keyIsValid && tosCheckbox.checked);
    }
    function toggleSettingsPanel() { 
        console.log('[TRACE] toggleSettingsPanel called.');
        if (!settingsPanel) {
            console.warn('[TRACE] toggleSettingsPanel: settingsPanel element not found.');
            return;
        }
        const isVisible = settingsPanel.style.display === 'flex';
        settingsPanel.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) { 
            if (settingsApiKeyInput) settingsApiKeyInput.value = ''; 
            if (settingsApiError) settingsApiError.textContent = ''; 
            const categoryContents = settingsPanel.querySelectorAll('.settings-category-content');
            categoryContents.forEach(content => content.style.display = 'none');
            const categoryHeaders = settingsPanel.querySelectorAll('.settings-category-header');
            categoryHeaders.forEach(header => header.classList.remove('open'));
        }
        requestAnimationFrame(resizeWindowToContent); 
    }
    async function handleAutostartChange(event) { 
        if (!store) { console.error('[TRACE] handleAutostartChange: Store not available.'); return; }
        const isEnabled = event.target.checked;
        console.log(`[TRACE] handleAutostartChange: Setting autostart preference to ${isEnabled}`);
        try {
            await store.set(AUTOSTART_PREFERENCE_STORAGE, isEnabled.toString());
            await store.save();
            if (isEnabled) await enableAppAutostart();
            else await disableAppAutostart();
            if (firstRunAutostartCheckbox) firstRunAutostartCheckbox.checked = isEnabled;
            if (settingsAutostartCheckbox) settingsAutostartCheckbox.checked = isEnabled;
        } catch (e) {
            console.error('[TRACE] handleAutostartChange: Error saving preference or enabling/disabling autostart:', e);
        }
    }
    async function handleAlwaysOnTopChange(event) { 
        if (!store) { console.error('[TRACE] handleAlwaysOnTopChange: Store not available.'); return; }
        const isEnabled = event.target.checked;
        console.log(`[TRACE] handleAlwaysOnTopChange: Setting always on top preference to ${isEnabled}`);
        try {
            await store.set(ALWAYS_ON_TOP_PREFERENCE_STORAGE, isEnabled.toString());
            await store.save();
            await appWindowInstance.setAlwaysOnTop(isEnabled);
            console.log(`[TRACE] Always on Top ${isEnabled ? 'enabled' : 'disabled'}`);
            if (settingsAlwaysOnTopCheckbox) settingsAlwaysOnTopCheckbox.checked = isEnabled;
        } catch (e) {
            console.error('[TRACE] Failed to set always on top or save preference:', e);
        }
    }
    async function handleCloseToTrayChange(event) {
        if (!store) { console.error('[TRACE] handleCloseToTrayChange: Store not available.'); return; }
        closeToTrayEnabled = event.target.checked;
        console.log(`[TRACE] handleCloseToTrayChange: Setting close to tray preference to ${closeToTrayEnabled}`);
        try {
            await store.set(CLOSE_TO_TRAY_PREFERENCE_STORAGE, closeToTrayEnabled.toString());
            await store.save();
            await invoke('set_close_to_tray_preference', { preference: closeToTrayEnabled });
            console.log(`[TRACE] Close to tray preference ${closeToTrayEnabled ? 'enabled' : 'disabled'} and sent to backend.`);
            if (settingsCloseToTrayCheckbox) settingsCloseToTrayCheckbox.checked = closeToTrayEnabled;
        } catch (e) {
            console.error('[TRACE] Failed to set close to tray preference or inform backend:', e);
        }
    }
    async function handleDesktopNotificationsChange(event) {
        if (!store) { console.error('[TRACE] handleDesktopNotificationsChange: Store not available.'); return; }
        desktopNotificationsEnabled = event.target.checked;
        console.log(`[TRACE] handleDesktopNotificationsChange: Setting desktop notifications preference to ${desktopNotificationsEnabled}`);
        try {
            await store.set(DESKTOP_NOTIFICATIONS_PREFERENCE_STORAGE, desktopNotificationsEnabled.toString());
            await store.save();
            if (settingsDesktopNotificationsCheckbox) settingsDesktopNotificationsCheckbox.checked = desktopNotificationsEnabled;

            if (desktopNotificationsEnabled) {
                let permissionGranted = await isPermissionGranted();
                if (!permissionGranted) {
                    const permission = await requestPermission();
                    permissionGranted = permission === 'granted';
                }
                if (permissionGranted) {
                    console.log('[TRACE] Desktop notification permission granted.');
                } else {
                    console.warn('[TRACE] Desktop notification permission NOT granted.');
                }
            }
        } catch (e) {
            console.error('[TRACE] Failed to set desktop notifications preference:', e);
        }
    }

    async function handleVoiceNotificationsChange(event) {
        if (!store) { console.error('[TRACE] handleVoiceNotificationsChange: Store not available.'); return; }
        voiceNotificationsEnabled = event.target.checked;
        console.log(`[TRACE] handleVoiceNotificationsChange: Setting voice notifications to ${voiceNotificationsEnabled}`);
        try {
            await store.set(VOICE_NOTIFICATIONS_ENABLED_STORAGE, voiceNotificationsEnabled.toString());
            await store.save();
            if (settingsVoiceNotificationsCheckbox) settingsVoiceNotificationsCheckbox.checked = voiceNotificationsEnabled;
        } catch (e) {
            console.error('[TRACE] Failed to set voice notifications preference:', e);
        }
    }

    async function handleGenericToggleChange(isChecked, storageKey, stateVariableKey, isFlashingSetting = false) {
        if (!store) { console.error(`[TRACE] handleGenericToggleChange for ${stateVariableKey}: Store not available.`); return; }
        
        switch(stateVariableKey) {
            case 'notifyOnBoosterReady': notifyOnBoosterReady = isChecked; break;
            case 'notifyOnMedicalReady': notifyOnMedicalReady = isChecked; break;
            case 'notifyOnDrugReady': notifyOnDrugReady = isChecked; break;
            case 'notifyOnEnergyFull': notifyOnEnergyFull = isChecked; break;
            case 'notifyOnNerveFull': notifyOnNerveFull = isChecked; break;
            case 'notifyOnEnergyCustomEnabled': notifyOnEnergyCustomEnabled = isChecked; break;
            case 'notifyOnLifeDown': notifyOnLifeDown = isChecked; break;
            case 'notifyOnLifeMax': notifyOnLifeMax = isChecked; break;
            case 'notifyOnNewDay': notifyOnNewDay = isChecked; break;
            case 'notifyOnNewDaySoon': notifyOnNewDaySoon = isChecked; break;
            case 'notifyOnTravelLandingSoon': notifyOnTravelLandingSoon = isChecked; break; 
            case 'notifyOnTravelArrival': notifyOnTravelArrival = isChecked; break;       
            case 'notifyOnRaceStarting': notifyOnRaceStarting = isChecked; break;         
            case 'notifyOnRaceFinished': notifyOnRaceFinished = isChecked; break;         
            case 'flashOnEnergyFull': flashOnEnergyFull = isChecked; break;
            case 'flashOnNerveFull': flashOnNerveFull = isChecked; break;
            case 'flashOnHappyFull': flashOnHappyFull = isChecked; break;
            case 'flashOnBoosterReady': flashOnBoosterReady = isChecked; break;
            case 'flashOnMedicalReady': flashOnMedicalReady = isChecked; break;
            case 'flashOnDrugReady': flashOnDrugReady = isChecked; break;
            case 'flashOnTravelArrived': flashOnTravelArrived = isChecked; break;
            case 'flashOnRaceFinished': flashOnRaceFinished = isChecked; break;
            default: console.warn(`[TRACE] Unknown state variable key: ${stateVariableKey}`); return;
        }

        console.log(`[TRACE] handleGenericToggleChange: Setting ${stateVariableKey} to ${isChecked}`);
        try {
            await store.set(storageKey, isChecked.toString());
            await store.save();
            if (isFlashingSetting) {
                if (lastGoodPrimaryData) updateDisplay(lastGoodPrimaryData);
                if (lastGoodRaceData) updateRaceDisplay(lastGoodRaceData);
            }
        } catch (e) {
            console.error(`[TRACE] Failed to set preference for ${stateVariableKey}:`, e);
        }
    }

    async function handleEnergyCustomValueChange(event) {
        if (!store) { console.error('[TRACE] handleEnergyCustomValueChange: Store not available.'); return; }
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value) && value >= 0) {
            notifyOnEnergyCustomValue = value;
            console.log(`[TRACE] handleEnergyCustomValueChange: Setting custom energy value to ${notifyOnEnergyCustomValue}`);
            try {
                await store.set(NOTIFY_ENERGY_CUSTOM_VALUE_STORAGE, notifyOnEnergyCustomValue);
                await store.save();
            } catch (e) {
                console.error('[TRACE] Failed to set custom energy notification value:', e);
            }
        }
    }


    async function initializeAutostart() { 
        if (!store) { console.error('[TRACE] initializeAutostart: Store not available.'); return; }
        console.log('[TRACE] initializeAutostart: Reading autostart preference.');
        try {
            let autostartPreference = await store.get(AUTOSTART_PREFERENCE_STORAGE);
            let shouldEnablePlugin = false;
            if (autostartPreference === null) { 
                shouldEnablePlugin = true; 
                await store.set(AUTOSTART_PREFERENCE_STORAGE, 'true');
                await store.save();
                autostartPreference = 'true';
            } else {
                shouldEnablePlugin = autostartPreference === 'true';
            }
            if (shouldEnablePlugin) await enableAppAutostart();
            const isChecked = autostartPreference === 'true';
            if (firstRunAutostartCheckbox) firstRunAutostartCheckbox.checked = isChecked;
            if (settingsAutostartCheckbox) settingsAutostartCheckbox.checked = isChecked;
        } catch (e) {
            console.error('[TRACE] initializeAutostart: Error during initialization:', e);
        }
    }
    async function initializeAlwaysOnTop() { 
        if (!store) { console.error('[TRACE] initializeAlwaysOnTop: Store not available.'); return; }
        console.log('[TRACE] initializeAlwaysOnTop: Reading always on top preference.');
        try {
            let alwaysOnTopPreference = await store.get(ALWAYS_ON_TOP_PREFERENCE_STORAGE);
            let shouldBeOnTop = true; 
            if (alwaysOnTopPreference === null) { 
                await store.set(ALWAYS_ON_TOP_PREFERENCE_STORAGE, 'true');
                await store.save();
            } else {
                shouldBeOnTop = alwaysOnTopPreference === 'true';
            }
            await appWindowInstance.setAlwaysOnTop(shouldBeOnTop);
            if (settingsAlwaysOnTopCheckbox) settingsAlwaysOnTopCheckbox.checked = shouldBeOnTop;
        } catch (e) {
            console.error('[TRACE] initializeAlwaysOnTop: Failed to set initial always on top state or read/save preference:', e);
        }
    }
    async function initializeCloseToTray() {
        if (!store) { console.error('[TRACE] initializeCloseToTray: Store not available.'); return; }
        console.log('[TRACE] initializeCloseToTray: Reading close to tray preference.');
        try {
            const storedPreference = await store.get(CLOSE_TO_TRAY_PREFERENCE_STORAGE);
            closeToTrayEnabled = storedPreference === 'true'; 
            
            console.log(`[TRACE] initializeCloseToTray: Initial preference from store: ${closeToTrayEnabled}`);
            if (settingsCloseToTrayCheckbox) {
                settingsCloseToTrayCheckbox.checked = closeToTrayEnabled;
            }
            await invoke('set_close_to_tray_preference', { preference: closeToTrayEnabled });
            console.log('[TRACE] initializeCloseToTray: Initial close to tray preference sent to backend.');
        } catch (e) {
            console.error('[TRACE] initializeCloseToTray: Failed to set initial close to tray state or read/save preference:', e);
            closeToTrayEnabled = false; 
            if (settingsCloseToTrayCheckbox) settingsCloseToTrayCheckbox.checked = false;
             try { 
                await invoke('set_close_to_tray_preference', { preference: false });
            } catch (invokeError) {
                console.error('[TRACE] initializeCloseToTray: Failed to send default preference to backend after error:', invokeError);
            }
        }
    }
    async function initializeDesktopNotifications() {
        if (!store) { console.error('[TRACE] initializeDesktopNotifications: Store not available.'); return; }
        console.log('[TRACE] initializeDesktopNotifications: Reading desktop notifications preference.');
        try {
            const storedPreference = await store.get(DESKTOP_NOTIFICATIONS_PREFERENCE_STORAGE);
            desktopNotificationsEnabled = storedPreference === 'true'; 
            
            console.log(`[TRACE] initializeDesktopNotifications: Initial preference from store: ${desktopNotificationsEnabled}`);
            if (settingsDesktopNotificationsCheckbox) {
                settingsDesktopNotificationsCheckbox.checked = desktopNotificationsEnabled;
            }
        } catch (e) {
            console.error('[TRACE] initializeDesktopNotifications: Failed to read preference:', e);
            desktopNotificationsEnabled = false; 
            if (settingsDesktopNotificationsCheckbox) settingsDesktopNotificationsCheckbox.checked = false;
        }
    }

    async function initializeNotificationSettings() {
        if (!store) { console.error('[TRACE] initializeNotificationSettings: Store not available.'); return; }
        console.log('[TRACE] initializeNotificationSettings: Reading notification preferences.');
        try {
            voiceNotificationsEnabled = (await store.get(VOICE_NOTIFICATIONS_ENABLED_STORAGE) || 'true') === 'true';
            notifyOnBoosterReady = (await store.get(NOTIFY_BOOSTER_READY_STORAGE) || 'true') === 'true';
            notifyOnMedicalReady = (await store.get(NOTIFY_MEDICAL_READY_STORAGE) || 'true') === 'true';
            notifyOnDrugReady = (await store.get(NOTIFY_DRUG_READY_STORAGE) || 'true') === 'true';
            notifyOnEnergyFull = (await store.get(NOTIFY_ENERGY_FULL_STORAGE) || 'true') === 'true';
            notifyOnNerveFull = (await store.get(NOTIFY_NERVE_FULL_STORAGE) || 'true') === 'true';
            notifyOnEnergyCustomEnabled = (await store.get(NOTIFY_ENERGY_CUSTOM_ENABLED_STORAGE) || 'false') === 'true';
            notifyOnEnergyCustomValue = parseInt(await store.get(NOTIFY_ENERGY_CUSTOM_VALUE_STORAGE), 10) || 25;
            notifyOnLifeDown = (await store.get(NOTIFY_LIFE_DOWN_STORAGE) || 'false') === 'true';
            notifyOnLifeMax = (await store.get(NOTIFY_LIFE_MAX_STORAGE) || 'false') === 'true';
            notifyOnNewDay = (await store.get(NOTIFY_NEW_DAY_STORAGE) || 'true') === 'true';
            notifyOnNewDaySoon = (await store.get(NOTIFY_NEW_DAY_SOON_STORAGE) || 'true') === 'true';
            notifyOnTravelLandingSoon = (await store.get(NOTIFY_TRAVEL_LANDING_SOON_STORAGE) || 'true') === 'true'; 
            notifyOnTravelArrival = (await store.get(NOTIFY_TRAVEL_ARRIVAL_STORAGE) || 'true') === 'true';       
            notifyOnRaceStarting = (await store.get(NOTIFY_RACE_STARTING_STORAGE) || 'true') === 'true';         
            notifyOnRaceFinished = (await store.get(NOTIFY_RACE_FINISHED_STORAGE) || 'true') === 'true';         


            if (settingsVoiceNotificationsCheckbox) settingsVoiceNotificationsCheckbox.checked = voiceNotificationsEnabled;
            if (settingsNotifyBoosterReadyCheckbox) settingsNotifyBoosterReadyCheckbox.checked = notifyOnBoosterReady;
            if (settingsNotifyMedicalReadyCheckbox) settingsNotifyMedicalReadyCheckbox.checked = notifyOnMedicalReady;
            if (settingsNotifyDrugReadyCheckbox) settingsNotifyDrugReadyCheckbox.checked = notifyOnDrugReady;
            if (settingsNotifyEnergyFullCheckbox) settingsNotifyEnergyFullCheckbox.checked = notifyOnEnergyFull;
            if (settingsNotifyNerveFullCheckbox) settingsNotifyNerveFullCheckbox.checked = notifyOnNerveFull;
            if (settingsNotifyEnergyCustomCheckbox) settingsNotifyEnergyCustomCheckbox.checked = notifyOnEnergyCustomEnabled;
            if (settingsNotifyEnergyCustomValueInput) settingsNotifyEnergyCustomValueInput.value = notifyOnEnergyCustomValue;
            if (settingsNotifyLifeDownCheckbox) settingsNotifyLifeDownCheckbox.checked = notifyOnLifeDown;
            if (settingsNotifyLifeMaxCheckbox) settingsNotifyLifeMaxCheckbox.checked = notifyOnLifeMax;
            if (settingsNotifyNewDayCheckbox) settingsNotifyNewDayCheckbox.checked = notifyOnNewDay;
            if (settingsNotifyNewDaySoonCheckbox) settingsNotifyNewDaySoonCheckbox.checked = notifyOnNewDaySoon;
            if (settingsNotifyTravelLandingSoonCheckbox) settingsNotifyTravelLandingSoonCheckbox.checked = notifyOnTravelLandingSoon; 
            if (settingsNotifyTravelArrivalCheckbox) settingsNotifyTravelArrivalCheckbox.checked = notifyOnTravelArrival;       
            if (settingsNotifyRaceStartingCheckbox) settingsNotifyRaceStartingCheckbox.checked = notifyOnRaceStarting;         
            if (settingsNotifyRaceFinishedCheckbox) settingsNotifyRaceFinishedCheckbox.checked = notifyOnRaceFinished;         


        } catch (e) {
            console.error('[TRACE] initializeNotificationSettings: Error during initialization:', e);
            voiceNotificationsEnabled = true; notifyOnBoosterReady = true; notifyOnMedicalReady = true; notifyOnDrugReady = true;
            notifyOnEnergyFull = true; notifyOnNerveFull = true; notifyOnEnergyCustomEnabled = false; notifyOnEnergyCustomValue = 25;
            notifyOnLifeDown = false; notifyOnLifeMax = false; notifyOnNewDay = true; notifyOnNewDaySoon = true;
            notifyOnTravelLandingSoon = true; notifyOnTravelArrival = true; notifyOnRaceStarting = true; notifyOnRaceFinished = true; 
        }
    }

    async function initializeFlashingSettings() {
        if (!store) { console.error('[TRACE] initializeFlashingSettings: Store not available.'); return; }
        console.log('[TRACE] initializeFlashingSettings: Reading flashing preferences.');
        try {
            flashOnEnergyFull = (await store.get(FLASH_ENERGY_FULL_STORAGE) || 'true') === 'true';
            flashOnNerveFull = (await store.get(FLASH_NERVE_FULL_STORAGE) || 'true') === 'true';
            flashOnHappyFull = (await store.get(FLASH_HAPPY_FULL_STORAGE) || 'true') === 'true';
            flashOnBoosterReady = (await store.get(FLASH_BOOSTER_READY_STORAGE) || 'true') === 'true';
            flashOnMedicalReady = (await store.get(FLASH_MEDICAL_READY_STORAGE) || 'true') === 'true';
            flashOnDrugReady = (await store.get(FLASH_DRUG_READY_STORAGE) || 'true') === 'true';
            flashOnTravelArrived = (await store.get(FLASH_TRAVEL_ARRIVED_STORAGE) || 'true') === 'true';
            flashOnRaceFinished = (await store.get(FLASH_RACE_FINISHED_STORAGE) || 'true') === 'true';

            if (settingsFlashEnergyFullCheckbox) settingsFlashEnergyFullCheckbox.checked = flashOnEnergyFull;
            if (settingsFlashNerveFullCheckbox) settingsFlashNerveFullCheckbox.checked = flashOnNerveFull;
            if (settingsFlashHappyFullCheckbox) settingsFlashHappyFullCheckbox.checked = flashOnHappyFull;
            if (settingsFlashBoosterReadyCheckbox) settingsFlashBoosterReadyCheckbox.checked = flashOnBoosterReady;
            if (settingsFlashMedicalReadyCheckbox) settingsFlashMedicalReadyCheckbox.checked = flashOnMedicalReady;
            if (settingsFlashDrugReadyCheckbox) settingsFlashDrugReadyCheckbox.checked = flashOnDrugReady;
            if (settingsFlashTravelArrivedCheckbox) settingsFlashTravelArrivedCheckbox.checked = flashOnTravelArrived;
            if (settingsFlashRaceFinishedCheckbox) settingsFlashRaceFinishedCheckbox.checked = flashOnRaceFinished;

        } catch (e) {
            console.error('[TRACE] initializeFlashingSettings: Error during initialization:', e);
            flashOnEnergyFull = true; flashOnNerveFull = true; flashOnHappyFull = true; flashOnBoosterReady = true;
            flashOnMedicalReady = true; flashOnDrugReady = true; flashOnTravelArrived = true; flashOnRaceFinished = true;
        }
    }


    function updateLinkPreferenceUI(itemKey, isFaction) { 
        const toggleInfo = linkToggleElements[itemKey];
        if (toggleInfo && toggleInfo.personalLabel && toggleInfo.factionLabel) {
            toggleInfo.personalLabel.classList.toggle('active-preference', !isFaction);
            toggleInfo.factionLabel.classList.toggle('active-preference', isFaction);
        }
    }
    async function applyLinkPreference(itemKey, isFaction) { 
        const urlDetails = itemLinkUrls[itemKey];
        const targetLinkElementOrArray = linkTargetElements[itemKey];
        if (!urlDetails || !targetLinkElementOrArray) return;
        const newUrl = isFaction ? urlDetails.faction : urlDetails.personal;
        if (Array.isArray(targetLinkElementOrArray)) targetLinkElementOrArray.forEach(el => { if (el) el.href = newUrl; });
        else if (targetLinkElementOrArray) targetLinkElementOrArray.href = newUrl;
        updateLinkPreferenceUI(itemKey, isFaction); 
    }
    async function initializeLinkTypeSettings() { 
        if (!store) { console.error('[TRACE] initializeLinkTypeSettings: Store not available.'); return; }
        try {
            for (const itemKey of Object.keys(itemLinkUrls)) {
                const toggleInfo = linkToggleElements[itemKey];
                if (!toggleInfo || !toggleInfo.input) continue;
                const savedSetting = await store.get(LINK_TYPE_SETTINGS_PREFIX + itemKey);
                const isFaction = savedSetting === 'faction'; 
                toggleInfo.input.checked = isFaction;
                await applyLinkPreference(itemKey, isFaction);
                toggleInfo.input.addEventListener('change', async (event) => {
                    if (!store) { console.error('[TRACE] Link type change: Store not available.'); return; }
                    const newIsFaction = event.target.checked;
                    try {
                        await store.set(LINK_TYPE_SETTINGS_PREFIX + itemKey, newIsFaction ? 'faction' : 'personal');
                        await store.save();
                        await applyLinkPreference(itemKey, newIsFaction);
                    } catch (e) {
                        console.error(`[TRACE] Error saving link preference for ${itemKey}:`, e);
                    }
                });
            }
        } catch (e) {
            console.error('[TRACE] initializeLinkTypeSettings: Error during initialization:', e);
        }
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
    function handleTooltipMouseOut() { if (customTooltipElement) customTooltipElement.style.display = 'none'; }
    function handleTooltipMouseMove(event) { if (customTooltipElement && customTooltipElement.style.display === 'block') positionTooltip(event.pageX, event.pageY); }
    function positionTooltip(x, y) { 
        if (!customTooltipElement) return;
        const offsetX = 10, offsetY = 15; 
        let newX = x + offsetX, newY = y + offsetY;
        const tooltipRect = customTooltipElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        if (newX + tooltipRect.width > viewportWidth) newX = x - tooltipRect.width - offsetX; 
        if (newY + tooltipRect.height > viewportHeight) newY = y - tooltipRect.height - offsetY; 
        if (newX < 0) newX = 0; if (newY < 0) newY = 0;
        customTooltipElement.style.left = `${newX}px`;
        customTooltipElement.style.top = `${newY}px`;
    }

    function speakNotification(text) {
        if (!voiceNotificationsEnabled) {
            console.log('[TRACE] speakNotification: Voice notifications are globally disabled. Skipping speech.');
            return;
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
            console.log(`[TRACE] speakNotification: Attempting to speak: "${text}"`);
        } else {
            console.warn('[TRACE] speakNotification: Speech Synthesis not supported by this browser/environment.');
        }
    }


    async function triggerSendNotification(title, body, icon = 'icons/icon.png', notificationType = null) {
        if (desktopNotificationsEnabled) {
            let permissionGranted = await isPermissionGranted();
            if (!permissionGranted) {
                const permission = await requestPermission();
                permissionGranted = permission === 'granted';
            }

            if (permissionGranted) {
                try {
                    await tauriSendNotification({ title, body, icon });
                    console.log(`[TRACE] Desktop notification sent: "${title}" - "${body}"`);
                } catch(e) {
                    console.error('[TRACE] Failed to send desktop notification:', e);
                }
            } else {
                console.warn('[TRACE] triggerSendNotification: Permission not granted for desktop notifications.');
            }
        } else {
             console.log('[TRACE] triggerSendNotification: Desktop notifications are disabled. Skipping.');
        }

        if (!voiceNotificationsEnabled) {
            console.log(`[TRACE] triggerSendNotification (Voice): Voice notifications globally disabled. Skipping speech for: ${body}`);
            return;
        }

        let canSpeak = false;
        switch (notificationType) {
            case 'boosterReady': canSpeak = notifyOnBoosterReady; break;
            case 'medicalReady': canSpeak = notifyOnMedicalReady; break;
            case 'drugReady': canSpeak = notifyOnDrugReady; break;
            case 'energyFull': canSpeak = notifyOnEnergyFull; break;
            case 'nerveFull': canSpeak = notifyOnNerveFull; break;
            case 'energyCustom': canSpeak = notifyOnEnergyCustomEnabled; break; 
            case 'lifeDown': canSpeak = notifyOnLifeDown; break;
            case 'lifeMax': canSpeak = notifyOnLifeMax; break;
            case 'newDay': canSpeak = notifyOnNewDay; break;
            case 'newDaySoon': canSpeak = notifyOnNewDaySoon; break;
            case 'travelLandingSoon': canSpeak = notifyOnTravelLandingSoon; break; 
            case 'travelArrival': canSpeak = notifyOnTravelArrival; break;       
            case 'raceStarting': canSpeak = notifyOnRaceStarting; break;         
            case 'raceFinished': canSpeak = notifyOnRaceFinished; break;         
            case 'newMessage': canSpeak = true; break; 
            case 'newEvent': canSpeak = true; break; 
            default:
                console.log(`[TRACE] triggerSendNotification (Voice): No specific voice toggle for type "${notificationType}". Speaking if master toggle is on.`);
                canSpeak = true; 
        }
        
        if (canSpeak) {
            speakNotification(body);
        } else {
            console.log(`[TRACE] triggerSendNotification (Voice): Specific voice notification type "${notificationType}" is disabled. Skipping speech for: ${body}`);
        }
    }


    async function fetchData() { 
        console.log('[TRACE] fetchData: Called.');
        if (!store) {
            updateDisplay({ error: "Settings store unavailable.", target: 'api_main', isTransient: false });
            switchView(false); 
            return;
        }
        if (!apiKey) {
            updateDisplay({ error: "API Key needed", target: 'api_main', isTransient: false });
            switchView(false);
            if (intervals.update) { clearInterval(intervals.update); intervals.update = null; }
            clearAllTimers(); 
            return;
        }
        const primaryUrl = `https://api.torn.com/user/?selections=bars,cooldowns,refills,personalstats,notifications,travel,profile&key=${apiKey}&comment=TornStatusWidget_v${SCRIPT_VERSION}`; 
        const primaryController = new AbortController();
        const primaryTimeoutId = setTimeout(() => primaryController.abort(), 10000); 
        try {
            const response = await fetch(primaryUrl, { method: 'GET', signal: primaryController.signal });
            clearTimeout(primaryTimeoutId);
            if (!response.ok) {
                let errorData; try { errorData = await response.json(); } catch (parseErr) { throw new Error(`HTTP error ${response.status}`); }
                if (errorData && errorData.error) {
                    const errMessage = `API Error ${errorData.error.code}`;
                    if (errorData.error.code === 2) { 
                        apiKey = null; await store.delete(API_KEY_STORAGE); await store.save();
                        if (intervals.update) { clearInterval(intervals.update); intervals.update = null; }
                        clearAllTimers(); updateDisplay({ error: errMessage, target: 'api_main', isTransient: false });
                        switchView(false); return; 
                    } else updateDisplay({ error: errMessage, target: 'status', isTransient: true }); 
                } else updateDisplay({ error: `HTTP error ${response.status}`, target: 'status', isTransient: true });
            } else { 
                const data = await response.json();
                if (data.error) { 
                    if (data.error.code === 2) { 
                        apiKey = null; await store.delete(API_KEY_STORAGE); await store.save();
                        if (intervals.update) { clearInterval(intervals.update); intervals.update = null; }
                        clearAllTimers(); updateDisplay({ error: `API Error ${data.error.code}`, target: 'api_main', isTransient: false });
                        switchView(false); return;
                    } else updateDisplay({ error: `API Error ${data.error.code}`, target: 'status', isTransient: true });
                } else { 
                    // Life Notifications
                    if (data.life && typeof data.life.current !== 'undefined' && typeof data.life.maximum !== 'undefined') {
                        // Life Down
                        if (lastLifeValue !== null && data.life.current < lastLifeValue && notifyOnLifeDown) {
                            triggerSendNotification("Life Decreased", `Your life has decreased to ${data.life.current}.`, 'icons/icon.png', 'lifeDown');
                        }
                        // Life Max (Revised)
                        if (data.life.current === data.life.maximum) {
                            if (!lifeAlreadyNotifiedMax && notifyOnLifeMax) {
                                triggerSendNotification("Life Max", "Your life is now at maximum.", 'icons/icon.png', 'lifeMax');
                                lifeAlreadyNotifiedMax = true;
                            }
                        } else { 
                            lifeAlreadyNotifiedMax = false; 
                        }
                        lastLifeValue = data.life.current;
                    }


                    // Updated Custom Energy Notification Logic
                    if (data.energy && typeof data.energy.current !== 'undefined' && notifyOnEnergyCustomEnabled) {
                        let previousEnergy = lastGoodPrimaryData && lastGoodPrimaryData.energy ? lastGoodPrimaryData.energy.current : -1;
                        if (data.energy.current === notifyOnEnergyCustomValue && previousEnergy !== notifyOnEnergyCustomValue) {
                            triggerSendNotification("Energy Level Reached", `Your energy is now at ${notifyOnEnergyCustomValue}.`, 'icons/icon.png', 'energyCustom');
                        }
                    }


                    if (data.travel && data.travel.time_left > 0) {
                        if (!lastGoodPrimaryData || !lastGoodPrimaryData.travel || lastGoodPrimaryData.travel.destination !== data.travel.destination || lastGoodPrimaryData.travel.timestamp_ended !== data.travel.timestamp_ended) {
                            travelLandingSoonNotifiedThisTrip = false; 
                            console.log('[TRACE] New travel detected or significant change, resetting landingSoonNotified flag.');
                        }
                    }


                    lastGoodPrimaryData = data; updateDisplay(lastGoodPrimaryData); startTimers(lastGoodPrimaryData); 
                    clearErrorMessages('primary'); 
                }
            }
        } catch (error) {
            clearTimeout(primaryTimeoutId); 
            const errorMsg = error.name === 'AbortError' ? 'Timeout (User Data)' : 'Network Error (User Data)';
            updateDisplay({ error: errorMsg, target: 'status', isTransient: true }); 
        }
        if (apiKey) {
            const raceUrl = `https://api.torn.com/v2/user/races?limit=1&sort=DESC&key=${apiKey}&comment=TornStatusWidget_v${SCRIPT_VERSION}`;
            const raceController = new AbortController();
            const raceTimeoutId = setTimeout(() => raceController.abort(), 10000); 
            try {
                const raceResponse = await fetch(raceUrl, { method: 'GET', signal: raceController.signal });
                clearTimeout(raceTimeoutId);
                if (!raceResponse.ok) {
                    let raceErrorData; try { raceErrorData = await raceResponse.json(); } catch (e) { /* ignore */ }
                    const raceErrCode = raceErrorData && raceErrorData.error ? raceErrorData.error.code : raceResponse.status;
                    if (raceErrorDiv) raceErrorDiv.textContent = `Race API Err: ${raceErrCode}`;
                    if (lastGoodRaceData) { updateRaceDisplay(lastGoodRaceData); startRaceTimer(lastGoodRaceData); } 
                    else updateRaceDisplay(null); 
                } else { 
                    const raceData = await raceResponse.json();
                    if (raceData.error) {
                        if (raceErrorDiv) raceErrorDiv.textContent = `Race API Err: ${raceData.error.code}`;
                        if (lastGoodRaceData) { updateRaceDisplay(lastGoodRaceData); startRaceTimer(lastGoodRaceData); }
                        else updateRaceDisplay(null); 
                    } else { 
                        if (raceErrorDiv) raceErrorDiv.textContent = ''; 
                        lastGoodRaceData = raceData; updateRaceDisplay(lastGoodRaceData); startRaceTimer(lastGoodRaceData);
                    }
                }
            } catch (raceError) {
                clearTimeout(raceTimeoutId);
                if (raceErrorDiv) raceErrorDiv.textContent = raceError.name === 'AbortError' ? 'Race Timeout' : 'Race Net Err';
                if (lastGoodRaceData) { updateRaceDisplay(lastGoodRaceData); startRaceTimer(lastGoodRaceData); }
                else updateRaceDisplay(null); 
            }
        } else updateRaceDisplay(null);
        if (!isMinimized && !(settingsPanel && settingsPanel.style.display === 'flex')) {
            if (apiKey && tosAccepted) switchView(true); 
            else switchView(false); 
        }
    }
    function updateDisplay(data) { 
        if (!guiContainer) return;
        const statusErrDiv = guiContainer.querySelector('.status-error'); 
        if (data.error && !data.isTransient) {
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
            if (apiErrorMain) apiErrorMain.textContent = '';
            if (settingsApiError) settingsApiError.textContent = '';
            if (statusErrDiv) statusErrDiv.textContent = '';
        }
        updateTravelDisplay(sourceData.travel);
        if (sourceData.personalstats && typeof sourceData.personalstats.boosters_max_cooldown_hours === 'number') userMaxBoosterCooldownSeconds = sourceData.personalstats.boosters_max_cooldown_hours * 3600;
        if (sourceData.personalstats && typeof sourceData.personalstats.medical_max_cooldown_hours === 'number') userMaxMedicalCooldownSeconds = sourceData.personalstats.medical_max_cooldown_hours * 3600;
        
        if (sourceData.notifications) {
            const msgCount = sourceData.notifications.messages || 0;
            const evtCount = sourceData.notifications.events || 0;

            if (lastGoodPrimaryData && lastGoodPrimaryData.notifications) {
                if (msgCount > (lastGoodPrimaryData.notifications.messages || 0)) {
                    triggerSendNotification("New Message(s)", `You have ${msgCount} new message(s) in Torn.`, 'icons/icon.png', 'newMessage');
                }
                if (evtCount > (lastGoodPrimaryData.notifications.events || 0)) {
                     triggerSendNotification("New Event(s)", `You have ${evtCount} new event(s) in Torn.`, 'icons/icon.png', 'newEvent');
                }
            }


            if (messagesIconDisplay) messagesIconDisplay.innerHTML = mailIconSVG;
            if (messagesCountDisplay) { messagesCountDisplay.textContent = msgCount; messagesIconDisplay.className = msgCount > 0 ? 'notification-icon messages-icon red' : 'notification-icon messages-icon green'; messagesCountDisplay.className = msgCount > 0 ? 'notification-count messages-count red' : 'notification-count messages-count green';}
            if (eventsIconDisplay) eventsIconDisplay.innerHTML = eventIconSVG;
            if (eventsCountDisplay) { eventsCountDisplay.textContent = evtCount; eventsIconDisplay.className = evtCount > 0 ? 'notification-icon events-icon red' : 'notification-icon events-icon green'; eventsCountDisplay.className = evtCount > 0 ? 'notification-count events-count red' : 'notification-count events-count green';}
        } else { 
            if (messagesIconDisplay) messagesIconDisplay.innerHTML = mailIconSVG; if (messagesCountDisplay) { messagesCountDisplay.textContent = 'N/A'; messagesIconDisplay.className = 'notification-icon messages-icon green'; messagesCountDisplay.className = 'notification-count messages-count green'; }
            if (eventsIconDisplay) eventsIconDisplay.innerHTML = eventIconSVG; if (eventsCountDisplay) { eventsCountDisplay.textContent = 'N/A'; eventsIconDisplay.className = 'notification-icon events-icon green'; eventsCountDisplay.className = 'notification-count events-count green'; }
        }
        if (lifeDisplayValue && sourceData.life && typeof sourceData.life.current !== 'undefined' && typeof sourceData.life.maximum !== 'undefined' && sourceData.life.maximum > 0) {
            lifeDisplayValue.textContent = `${sourceData.life.current}/${sourceData.life.maximum}`;
            if (healthBarFillDisplay) {
                const percentage = (sourceData.life.current / sourceData.life.maximum) * 100;
                healthBarFillDisplay.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
                if (percentage <= 25) healthBarFillDisplay.style.backgroundColor = '#dc3545'; 
                else if (percentage <= 50) healthBarFillDisplay.style.backgroundColor = '#ffc107'; 
                else healthBarFillDisplay.style.backgroundColor = '#28a745'; 
            }
        } else if (lifeDisplayValue) { lifeDisplayValue.textContent = 'N/A'; if (healthBarFillDisplay) { healthBarFillDisplay.style.width = '0%'; healthBarFillDisplay.style.backgroundColor = '#444'; }}
        
        if (energyDisplayValue && sourceData.energy && typeof sourceData.energy.current !== 'undefined') energyDisplayValue.textContent = `${sourceData.energy.current}/${sourceData.energy.maximum}`; else if (energyDisplayValue) energyDisplayValue.textContent = 'N/A';
        if (nerveDisplayValue && sourceData.nerve && typeof sourceData.nerve.current !== 'undefined') nerveDisplayValue.textContent = `${sourceData.nerve.current}/${sourceData.nerve.maximum}`; else if (nerveDisplayValue) nerveDisplayValue.textContent = 'N/A';
        if (happinessDisplayValue && sourceData.happy && typeof sourceData.happy.current !== 'undefined') happinessDisplayValue.textContent = `${sourceData.happy.current}/${sourceData.happy.maximum}`; else if (happinessDisplayValue) happinessDisplayValue.textContent = 'N/A';
        
        if (sourceData.cooldowns) {
            if (boosterDisplayValue) { 
                boosterDisplayValue.textContent = sourceData.cooldowns.booster > 0 ? 'Active' : 'Ready'; 
                if (flashOnBoosterReady && sourceData.cooldowns.booster === 0) boosterDisplayValue.classList.add('flashing'); else boosterDisplayValue.classList.remove('flashing'); 
                if (boosterTimerDisplay) { if (flashOnBoosterReady && sourceData.cooldowns.booster === 0) boosterTimerDisplay.classList.add('flashing'); else boosterTimerDisplay.classList.remove('flashing');}
            }
            if (medicalDisplayValue) { 
                medicalDisplayValue.textContent = sourceData.cooldowns.medical > 0 ? 'Active' : 'Ready'; 
                if (flashOnMedicalReady && sourceData.cooldowns.medical === 0) medicalDisplayValue.classList.add('flashing'); else medicalDisplayValue.classList.remove('flashing'); 
                if (medicalTimerDisplay) { if (flashOnMedicalReady && sourceData.cooldowns.medical === 0) medicalTimerDisplay.classList.add('flashing'); else medicalTimerDisplay.classList.remove('flashing');}
            }
            if (drugDisplayValue) { 
                drugDisplayValue.textContent = sourceData.cooldowns.drug > 0 ? 'Active' : 'Ready'; 
                if (flashOnDrugReady && sourceData.cooldowns.drug === 0) drugDisplayValue.classList.add('flashing'); else drugDisplayValue.classList.remove('flashing'); 
                if (drugTimerDisplay) { if (flashOnDrugReady && sourceData.cooldowns.drug === 0) drugTimerDisplay.classList.add('flashing'); else drugTimerDisplay.classList.remove('flashing');}
            }
        } else { 
            if (boosterDisplayValue) { boosterDisplayValue.textContent = 'N/A'; boosterDisplayValue.classList.remove('flashing'); if (boosterTimerDisplay) boosterTimerDisplay.classList.remove('flashing'); }
            if (medicalDisplayValue) { medicalDisplayValue.textContent = 'N/A'; medicalDisplayValue.classList.remove('flashing'); if (medicalTimerDisplay) medicalTimerDisplay.classList.remove('flashing');}
            if (drugDisplayValue) { drugDisplayValue.textContent = 'N/A'; drugDisplayValue.classList.remove('flashing'); if (drugTimerDisplay) drugTimerDisplay.classList.remove('flashing'); }
        }
        if (sourceData.refills) {
            if (energyRefillStatus) { energyRefillStatus.textContent = sourceData.refills.energy_refill_used ? 'Used' : 'Ready'; energyRefillStatus.className = sourceData.refills.energy_refill_used ? 'refill-status used' : 'refill-status ready';}
            if (nerveRefillStatus) { nerveRefillStatus.textContent = sourceData.refills.nerve_refill_used ? 'Used' : 'Ready'; nerveRefillStatus.className = sourceData.refills.nerve_refill_used ? 'refill-status used' : 'refill-status ready';}
            if (tokenRefillStatus) { tokenRefillStatus.textContent = sourceData.refills.token_refill_used ? 'Used' : 'Ready'; tokenRefillStatus.className = sourceData.refills.token_refill_used ? 'refill-status used' : 'refill-status ready';}
        } else { 
            if (energyRefillStatus) energyRefillStatus.textContent = 'N/A'; if (nerveRefillStatus) nerveRefillStatus.textContent = 'N/A'; if (tokenRefillStatus) tokenRefillStatus.textContent = 'N/A';
        }

        if (energyTimerDisplay && sourceData.energy) {
            if (flashOnEnergyFull && sourceData.energy.fulltime <= 0) energyTimerDisplay.classList.add('flashing');
            else energyTimerDisplay.classList.remove('flashing');
        }
        if (nerveTimerDisplay && sourceData.nerve) {
            if (flashOnNerveFull && sourceData.nerve.fulltime <= 0) nerveTimerDisplay.classList.add('flashing');
            else nerveTimerDisplay.classList.remove('flashing');
        }
        if (happinessTimerDisplay && sourceData.happy) {
            if (flashOnHappyFull && sourceData.happy.fulltime <= 0) happinessTimerDisplay.classList.add('flashing');
            else happinessTimerDisplay.classList.remove('flashing');
        }
    }
    function updateTravelDisplay(travelData) { 
        if (!travelStatusDiv || !travelLabelElement || !travelDestinationValue || !travelTimerDisplay) return;
        const currentTravelData = travelData || (lastGoodPrimaryData ? lastGoodPrimaryData.travel : null);
        if (intervals.travelEndFlashTimeout) { clearTimeout(intervals.travelEndFlashTimeout); intervals.travelEndFlashTimeout = null; }
        if (flashOnTravelArrived) travelLabelElement.classList.remove('label-flash-red'); 
        else travelLabelElement.classList.remove('label-flash-red'); 

        if (currentTravelData && currentTravelData.time_left > 0) { 
            travelStatusDiv.style.display = 'block';
            travelDestinationValue.textContent = currentTravelData.destination || "Unknown";
            travelTimerDisplay.textContent = formatSecondsToHMS(currentTravelData.time_left);
            travelTimerDisplay.dataset.tooltipContent = `Arriving in ${currentTravelData.destination || "Unknown"}`;
            travelTimerDisplay.classList.remove('soon'); 
        } else { 
             if (currentTravelData && currentTravelData.destination && lastGoodPrimaryData && lastGoodPrimaryData.travel && lastGoodPrimaryData.travel.time_left > 0 && currentTravelData.time_left <= 0) {
                if(notifyOnTravelArrival) triggerSendNotification("Arrival", `You have arrived in ${currentTravelData.destination}.`, 'icons/icon.png', 'travelArrival');
            }
            if (!flashOnTravelArrived || !travelLabelElement.classList.contains('label-flash-red')) {
                 travelStatusDiv.style.display = 'none';
            }
            if (intervals.travel) { clearTimeout(intervals.travel); intervals.travel = null; }
        }
    }
    function updateRaceDisplay(raceData) { 
        if (!raceStatusDiv || !raceLabelElement || !raceInfoValue || !raceTimerDisplay) return;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const currentRaceDataToDisplay = raceData || lastGoodRaceData;
        if (intervals.raceEndFlashTimeout) { clearTimeout(intervals.raceEndFlashTimeout); intervals.raceEndFlashTimeout = null; }
        if(flashOnRaceFinished) raceLabelElement.classList.remove('label-flash-red');
        else raceLabelElement.classList.remove('label-flash-red');


        if (currentRaceDataToDisplay && currentRaceDataToDisplay.races && currentRaceDataToDisplay.races.length > 0) {
            const race = currentRaceDataToDisplay.races[0]; 
            const trackName = trackNames[race.track_id.toString()] || `Track ${race.track_id}`;

            if (race.status === "starting" || race.status === "active" || race.status === "in_progress" || (race.status === "scheduled" && race.schedule.start > currentTimestamp)) {
                raceStatusDiv.style.display = 'block';
                let infoText = `Track: ${trackName}`; 
                let timerValue = '--:--:--'; let tooltip = `Race: ${race.title} on ${trackName}`;
                raceTimerDisplay.classList.remove('soon');
                if (race.status === "starting" || (race.status === "scheduled" && race.schedule.start > currentTimestamp)) { 
                    const timeToStart = race.schedule.start - currentTimestamp;
                    if (timeToStart > 0) { timerValue = formatSecondsToHMS(timeToStart); infoText = `Starts in:`; tooltip += `\nStarts: ${new Date(race.schedule.start * 1000).toLocaleTimeString()}`; } 
                    else { infoText = (race.status === "in_progress" ? "In Progress" : "Active"); timerValue = "Ongoing"; tooltip += `\nStatus: ${race.status}`; }
                } else if (race.status === "active" || race.status === "in_progress") { 
                    infoText = race.status === "in_progress" ? "In Progress" : "Active";
                    const timeToEnd = race.schedule.end - currentTimestamp;
                    timerValue = timeToEnd > 0 ? formatSecondsToHMS(timeToEnd) : "Ending soon";
                    tooltip += `\nEnds: ${new Date(race.schedule.end * 1000).toLocaleTimeString()}`;
                }
                raceInfoValue.textContent = infoText; raceTimerDisplay.textContent = timerValue; raceTimerDisplay.dataset.tooltipContent = tooltip;
                return; 
            }
        }
        if (!flashOnRaceFinished || !raceLabelElement.classList.contains('label-flash-red')) {
            raceStatusDiv.style.display = 'none';
        }
        if (intervals.race) { clearTimeout(intervals.race); intervals.race = null; }
    }
    function startTimers(data) { 
        const nonRaceTravelTimerKeys = ['energy', 'nerve', 'happiness', 'booster', 'medical', 'drug']; 
        nonRaceTravelTimerKeys.forEach(key => { if (intervals[key]) { clearTimeout(intervals[key]); intervals[key] = null; }});
        if (data.energy && typeof data.energy.fulltime !== 'undefined' && energyTimerDisplay) updateTimer('energy', data.energy.fulltime, energyTimerDisplay, 0, "Energy full!", 'energyFull'); else if (energyTimerDisplay) { energyTimerDisplay.textContent = "N/A"; energyTimerDisplay.classList.remove('full') }
        if (data.nerve && typeof data.nerve.fulltime !== 'undefined' && nerveTimerDisplay) updateTimer('nerve', data.nerve.fulltime, nerveTimerDisplay, 0, "Nerve full!", 'nerveFull'); else if (nerveTimerDisplay) { nerveTimerDisplay.textContent = "N/A"; nerveTimerDisplay.classList.remove('full') }
        if (data.happy && typeof data.happy.fulltime !== 'undefined' && happinessTimerDisplay) updateTimer('happiness', data.happy.fulltime, happinessTimerDisplay, 0, "Happiness full!", null); else if (happinessTimerDisplay) { happinessTimerDisplay.textContent = "N/A"; happinessTimerDisplay.classList.remove('full') } 
        if (data.cooldowns) {
            if (typeof data.cooldowns.booster !== 'undefined' && boosterTimerDisplay) { if (data.cooldowns.booster > 0) updateTimer('booster', data.cooldowns.booster, boosterTimerDisplay, userMaxBoosterCooldownSeconds, "Booster cooldown finished!", 'boosterReady'); else { boosterTimerDisplay.textContent = formatSecondsToHMS(userMaxBoosterCooldownSeconds); if(flashOnBoosterReady) boosterTimerDisplay.classList.add('full', 'flashing'); if (boosterDisplayValue && flashOnBoosterReady) boosterDisplayValue.classList.add('flashing'); boosterTimerDisplay.dataset.tooltipContent = `Ready\nMax Duration: ${formatSecondsToHMS(userMaxBoosterCooldownSeconds)}`; }} else if (boosterTimerDisplay) { boosterTimerDisplay.textContent = "N/A"; boosterTimerDisplay.classList.remove('full', 'flashing'); if (boosterDisplayValue) boosterDisplayValue.classList.remove('flashing'); boosterTimerDisplay.dataset.tooltipContent = "Booster: N/A"; }
            if (typeof data.cooldowns.medical !== 'undefined' && medicalTimerDisplay) { if (data.cooldowns.medical > 0) updateTimer('medical', data.cooldowns.medical, medicalTimerDisplay, userMaxMedicalCooldownSeconds, "Medical cooldown finished!", 'medicalReady'); else { medicalTimerDisplay.textContent = formatSecondsToHMS(userMaxMedicalCooldownSeconds); if(flashOnMedicalReady) medicalTimerDisplay.classList.add('full', 'flashing'); if(medicalDisplayValue && flashOnMedicalReady) medicalDisplayValue.classList.add('flashing'); medicalTimerDisplay.dataset.tooltipContent = `Ready\nMax Duration: ${formatSecondsToHMS(userMaxMedicalCooldownSeconds)}`; }} else if (medicalTimerDisplay) { medicalTimerDisplay.textContent = "N/A"; medicalTimerDisplay.classList.remove('full', 'flashing'); if (medicalDisplayValue) medicalDisplayValue.classList.remove('flashing'); medicalTimerDisplay.dataset.tooltipContent = "Medical: N/A"; }
            if (typeof data.cooldowns.drug !== 'undefined' && drugTimerDisplay) { if (data.cooldowns.drug > 0) updateTimer('drug', data.cooldowns.drug, drugTimerDisplay, 0, "Drug cooldown finished!", 'drugReady'); else { drugTimerDisplay.textContent = 'Ready'; if(flashOnDrugReady) drugTimerDisplay.classList.add('full', 'flashing'); if (drugDisplayValue && flashOnDrugReady) drugDisplayValue.classList.add('flashing'); drugTimerDisplay.dataset.tooltipContent = `Ready`; }} else if (drugTimerDisplay) { drugTimerDisplay.textContent = "N/A"; drugTimerDisplay.classList.remove('full', 'flashing'); if (drugDisplayValue) drugDisplayValue.classList.remove('flashing'); drugTimerDisplay.dataset.tooltipContent = "Drug: N/A"; }
        }
        startNewDayTimer(); startTravelTimer(data.travel); 
    }
    function startTravelTimer(travelData) { 
        if (intervals.travel) clearTimeout(intervals.travel); 
        if (intervals.travelEndFlashTimeout) { clearTimeout(intervals.travelEndFlashTimeout); intervals.travelEndFlashTimeout = null; if (travelLabelElement && flashOnTravelArrived) travelLabelElement.classList.remove('label-flash-red'); else if (travelLabelElement) travelLabelElement.classList.remove('label-flash-red');}
        
        const currentTravelData = travelData || (lastGoodPrimaryData ? lastGoodPrimaryData.travel : null);
        if (!travelTimerDisplay || !currentTravelData || currentTravelData.time_left <= 0) { 
            if (travelStatusDiv && !(travelLabelElement && travelLabelElement.classList.contains('label-flash-red') && flashOnTravelArrived )) travelStatusDiv.style.display = 'none'; 
            travelLandingSoonNotifiedThisTrip = false; 
            return; 
        }
        let secondsRemaining = currentTravelData.time_left;
        travelStatusDiv.style.display = 'block'; 
        if (travelLabelElement && flashOnTravelArrived) travelLabelElement.classList.remove('label-flash-red'); 
        else if (travelLabelElement) travelLabelElement.classList.remove('label-flash-red');
        
        if (lastGoodPrimaryData && lastGoodPrimaryData.travel && lastGoodPrimaryData.travel.destination !== currentTravelData.destination) {
            travelLandingSoonNotifiedThisTrip = false;
        }


        function tick() {
            if (secondsRemaining <= 120 && secondsRemaining > 0 && !travelLandingSoonNotifiedThisTrip && notifyOnTravelLandingSoon) {
                triggerSendNotification(
                    "Travel Landing Soon", 
                    `Arriving in ${currentTravelData.destination || "Unknown"} in approximately 2 minutes.`, 
                    'icons/icon.png', 
                    'travelLandingSoon'
                );
                travelLandingSoonNotifiedThisTrip = true; 
            }

            if (secondsRemaining <= 0) { 
                travelTimerDisplay.textContent = "Arrived!"; travelTimerDisplay.classList.remove('soon');
                travelDestinationValue.textContent = currentTravelData.destination || "Destination";
                if (travelLabelElement && flashOnTravelArrived) travelLabelElement.classList.add('label-flash-red'); 
                intervals.travel = null; 
                if(notifyOnTravelArrival) triggerSendNotification("Arrival", `You have arrived in ${currentTravelData.destination || "Unknown"}.`, 'icons/icon.png', 'travelArrival'); 
                if (intervals.travelEndFlashTimeout) clearTimeout(intervals.travelEndFlashTimeout);
                intervals.travelEndFlashTimeout = setTimeout(() => { if (travelLabelElement && flashOnTravelArrived) travelLabelElement.classList.remove('label-flash-red'); else if (travelLabelElement) travelLabelElement.classList.remove('label-flash-red'); if (travelStatusDiv) travelStatusDiv.style.display = 'none'; resizeWindowToContent(); }, 10000); 
                travelLandingSoonNotifiedThisTrip = false; 
            } else { 
                travelTimerDisplay.textContent = formatSecondsToHMS(secondsRemaining);
                travelDestinationValue.textContent = currentTravelData.destination || "Destination";
                const arrivalDate = new Date((Math.floor(Date.now() / 1000) + secondsRemaining) * 1000);
                travelTimerDisplay.dataset.tooltipContent = `Arriving in ${currentTravelData.destination || "Unknown"} at ${arrivalDate.toLocaleTimeString()}`;
                if (secondsRemaining <= 60) travelTimerDisplay.classList.add('soon'); else travelTimerDisplay.classList.remove('soon');
                secondsRemaining--; intervals.travel = setTimeout(tick, 1000); 
            }
        }
        tick(); 
    }
    function startRaceTimer(raceData) { 
        if (intervals.race) clearTimeout(intervals.race); 
        if (intervals.raceEndFlashTimeout) { clearTimeout(intervals.raceEndFlashTimeout); intervals.raceEndFlashTimeout = null; if (raceLabelElement && flashOnRaceFinished) raceLabelElement.classList.remove('label-flash-red'); else if (raceLabelElement) raceLabelElement.classList.remove('label-flash-red'); }
        const currentRaceDataToDisplay = raceData || lastGoodRaceData;
        if (!raceTimerDisplay || !currentRaceDataToDisplay || !currentRaceDataToDisplay.races || currentRaceDataToDisplay.races.length === 0) { if (raceStatusDiv && !(raceLabelElement && raceLabelElement.classList.contains('label-flash-red') && flashOnRaceFinished)) raceStatusDiv.style.display = 'none'; return; }
        const race = currentRaceDataToDisplay.races[0]; 
        const trackName = trackNames[race.track_id.toString()] || `Track ${race.track_id}`;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        let secondsRemaining = 0; let raceState = "none"; 
        if (race.status === "starting" || (race.status === "scheduled" && race.schedule.start > currentTimestamp)) { secondsRemaining = race.schedule.start - currentTimestamp; raceState = "starting"; } 
        else if (race.status === "active" || race.status === "in_progress") { secondsRemaining = race.schedule.end - currentTimestamp; raceState = "active_ending"; }
        if (raceState === "none" || secondsRemaining < 0) { 
            if (race.status === "finished" || race.status === "ended" || (race.status === "scheduled" && race.schedule.start <= currentTimestamp && race.schedule.end <= currentTimestamp) ) { 
                if (lastGoodRaceData && lastGoodRaceData.races && lastGoodRaceData.races[0] && (lastGoodRaceData.races[0].status === "active" || lastGoodRaceData.races[0].status === "in_progress")){
                    if(notifyOnRaceFinished) triggerSendNotification("Race Finished", `Your race on ${trackName} has finished!`, 'icons/icon.png', 'raceFinished');
                }
                if (raceStatusDiv && !(raceLabelElement && raceLabelElement.classList.contains('label-flash-red') && flashOnRaceFinished)) raceStatusDiv.style.display = 'none';
            } 
            else if (raceStatusDiv && !(raceLabelElement && raceLabelElement.classList.contains('label-flash-red') && flashOnRaceFinished)) raceStatusDiv.style.display = 'none';
            return; 
        }
        raceStatusDiv.style.display = 'block'; 
        if (raceLabelElement && flashOnRaceFinished) raceLabelElement.classList.remove('label-flash-red'); 
        else if (raceLabelElement) raceLabelElement.classList.remove('label-flash-red');
        function tick() {
            if (secondsRemaining <= 0) { 
                intervals.race = null; 
                if (raceState === "starting") { 
                    raceInfoValue.textContent = (race.status === "in_progress" ? "In Progress" : "Active"); 
                    raceTimerDisplay.textContent = "Ongoing"; 
                    raceTimerDisplay.dataset.tooltipContent = `Race: ${race.title} on ${trackName}\nStatus: ${race.status}`; 
                    if(notifyOnRaceStarting) triggerSendNotification("Race Started", `Your race on ${trackName} is starting!`, 'icons/icon.png', 'raceStarting');
                } 
                else if (raceState === "active_ending") { 
                    raceInfoValue.textContent = "Finished!"; 
                    raceTimerDisplay.textContent = "--:--:--"; 
                    raceTimerDisplay.dataset.tooltipContent = `Race: ${race.title} on ${trackName}\nStatus: Finished`; 
                    if (raceLabelElement && flashOnRaceFinished) raceLabelElement.classList.add('label-flash-red'); 
                    if(notifyOnRaceFinished) triggerSendNotification("Race Finished", `Your race on ${trackName} has finished!`, 'icons/icon.png', 'raceFinished');
                    if (intervals.raceEndFlashTimeout) clearTimeout(intervals.raceEndFlashTimeout); 
                    intervals.raceEndFlashTimeout = setTimeout(() => { if (raceLabelElement && flashOnRaceFinished) raceLabelElement.classList.remove('label-flash-red'); else if (raceLabelElement) raceLabelElement.classList.remove('label-flash-red'); if (raceStatusDiv) raceStatusDiv.style.display = 'none'; resizeWindowToContent(); }, 10000); 
                }
                return; 
            }
            raceTimerDisplay.textContent = formatSecondsToHMS(secondsRemaining);
            if (raceState === "starting") { raceInfoValue.textContent = "Starts in:"; raceTimerDisplay.dataset.tooltipContent = `Race: ${race.title} on ${trackName}\nStarts at: ${new Date(race.schedule.start * 1000).toLocaleTimeString()}`; } 
            else if (raceState === "active_ending") { raceInfoValue.textContent = race.status === "in_progress" ? "In Progress" : "Active"; raceTimerDisplay.dataset.tooltipContent = `Race: ${race.title} on ${trackName}\nEnds at: ${new Date(race.schedule.end * 1000).toLocaleTimeString()}`; }
            if (secondsRemaining <= 60) raceTimerDisplay.classList.add('soon'); else raceTimerDisplay.classList.remove('soon');
            secondsRemaining--; intervals.race = setTimeout(tick, 1000); 
        }
        tick(); 
    }
    function startNewDayTimer() { 
        if (intervals.newDay) clearInterval(intervals.newDay); 
        if (!newDayTimerDisplay) return;
        
        if (intervals.newDaySoonNotificationTimeout) clearTimeout(intervals.newDaySoonNotificationTimeout);
        if (intervals.newDayNotificationTimeout) clearTimeout(intervals.newDayNotificationTimeout);
        newDayNotified = false;
        newDaySoonNotified = false;

        function update() {
            const now = new Date();
            const tomorrowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
            const diffSeconds = Math.floor((tomorrowUTC.getTime() - now.getTime()) / 1000);
            
            const isWarningPeriod = diffSeconds < 3600 && diffSeconds >= 0; 
            if (isWarningPeriod) newDayTimerDisplay.classList.add('new-day-warning'); else newDayTimerDisplay.classList.remove('new-day-warning');
            newDayTimerDisplay.textContent = formatSecondsToHMS(diffSeconds >= 0 ? diffSeconds : 0);
            let newDayShouldFlashOverall = false;
            [energyRefillStatus, nerveRefillStatus, tokenRefillStatus].forEach(refillStatusEl => {
                if (refillStatusEl) { if (isWarningPeriod && refillStatusEl.textContent === 'Ready') { refillStatusEl.classList.add('flashing'); newDayShouldFlashOverall = true; } else refillStatusEl.classList.remove('flashing');}
            });
            if (newDayShouldFlashOverall && isWarningPeriod) newDayTimerDisplay.classList.add('flashing'); else newDayTimerDisplay.classList.remove('flashing');

            if (diffSeconds <= 3600 && diffSeconds > 0 && !newDaySoonNotified && notifyOnNewDaySoon) {
                triggerSendNotification("New Day Approaching", "New day in Torn is approximately 1 hour away.", 'icons/icon.png', 'newDaySoon');
                newDaySoonNotified = true; 
            }

            if (diffSeconds <= 0 && !newDayNotified && notifyOnNewDay) {
                triggerSendNotification("New Day!", "It's a new day in Torn!", 'icons/icon.png', 'newDay');
                newDayNotified = true; 
                setTimeout(() => {
                    newDayNotified = false;
                    newDaySoonNotified = false;
                }, 60000); 
            }
        }
        update(); intervals.newDay = setInterval(update, 1000); 
    }
    function updateTimer(barName, initialSecondsRemaining, displayElement, maxCooldownSeconds, notificationMessage = null, notificationType = null) { 
        if (!displayElement) return;
        if (intervals[barName]) clearTimeout(intervals[barName]); 
        let secondsRemaining = Number(initialSecondsRemaining);
        if (isNaN(secondsRemaining)) { 
            displayElement.textContent = "Error"; displayElement.classList.remove('full', 'flashing');
            if (barName === 'booster' && boosterDisplayValue) boosterDisplayValue.classList.remove('flashing');
            if (barName === 'medical' && medicalDisplayValue) medicalDisplayValue.classList.remove('flashing');
            if (barName === 'drug' && drugDisplayValue) drugDisplayValue.classList.remove('flashing');
            displayElement.dataset.tooltipContent = "Error"; intervals[barName] = null; return;
        }
        let valueDisplayElement = null; 
        if (barName === 'booster') valueDisplayElement = boosterDisplayValue;
        else if (barName === 'medical') valueDisplayElement = medicalDisplayValue;
        else if (barName === 'drug') valueDisplayElement = drugDisplayValue;
        
        let shouldFlash = false;
        if (barName === 'energy' && flashOnEnergyFull) shouldFlash = true;
        else if (barName === 'nerve' && flashOnNerveFull) shouldFlash = true;
        else if (barName === 'happiness' && flashOnHappyFull) shouldFlash = true;
        else if (barName === 'booster' && flashOnBoosterReady) shouldFlash = true;
        else if (barName === 'medical' && flashOnMedicalReady) shouldFlash = true;
        else if (barName === 'drug' && flashOnDrugReady) shouldFlash = true;


        function tick() {
            let currentTooltipText = ''; const now = Date.now(); 
            if (secondsRemaining <= 0) { 
                displayElement.classList.add('full'); intervals[barName] = null; 
                
                let canNotify = false;
                if (notificationType === 'boosterReady' && !boosterReadyNotified) { canNotify = true; boosterReadyNotified = true; }
                else if (notificationType === 'medicalReady' && !medicalReadyNotified) { canNotify = true; medicalReadyNotified = true; }
                else if (notificationType === 'drugReady' && !drugReadyNotified) { canNotify = true; drugReadyNotified = true; }
                else if (notificationType === 'energyFull' && !energyFullNotified) { canNotify = true; energyFullNotified = true; }
                else if (notificationType === 'nerveFull' && !nerveFullNotified) { canNotify = true; nerveFullNotified = true; }

                if (canNotify && notificationMessage && notificationType) { 
                    triggerSendNotification("Torn Status Update", notificationMessage, 'icons/icon.png', notificationType);
                }
                
                if ((barName === 'booster' || barName === 'medical' || barName === 'drug')) { 
                    if (valueDisplayElement) valueDisplayElement.textContent = 'Ready'; 
                    if (shouldFlash && valueDisplayElement) valueDisplayElement.classList.add('flashing'); 
                    if (shouldFlash) displayElement.classList.add('flashing'); 
                } else { 
                     if (shouldFlash) displayElement.classList.add('flashing');
                }

                if ((barName === 'booster' || barName === 'medical') && maxCooldownSeconds > 0) { displayElement.textContent = formatSecondsToHMS(maxCooldownSeconds); currentTooltipText = `Ready\nMax Duration: ${formatSecondsToHMS(maxCooldownSeconds)}`; } 
                else if (barName === 'drug') { displayElement.textContent = "Ready"; currentTooltipText = `Ready`; } 
                else { displayElement.textContent = "Full"; currentTooltipText = `Full`; } 
                displayElement.dataset.tooltipContent = currentTooltipText;
            } else { 
                if (notificationType === 'boosterReady') boosterReadyNotified = false;
                else if (notificationType === 'medicalReady') medicalReadyNotified = false;
                else if (notificationType === 'drugReady') drugReadyNotified = false;
                else if (notificationType === 'energyFull') energyFullNotified = false;
                else if (notificationType === 'nerveFull') nerveFullNotified = false;

                displayElement.classList.remove('full', 'flashing'); 
                if (valueDisplayElement) valueDisplayElement.classList.remove('flashing');
                if (valueDisplayElement && (barName === 'booster' || barName === 'medical' || barName === 'drug')) valueDisplayElement.textContent = 'Active'; 
                const endsTimestamp = new Date(now + secondsRemaining * 1000).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' });
                if ((barName === 'booster' || barName === 'medical') && maxCooldownSeconds > 0) { displayElement.textContent = formatSecondsToHMS(secondsRemaining); currentTooltipText = `Ends: ${endsTimestamp}\nRemaining: ${formatSecondsToHMS(secondsRemaining)}`; } 
                else if (barName === 'drug') { displayElement.textContent = formatSecondsToHMS(secondsRemaining); currentTooltipText = `Ends: ${endsTimestamp}\n(Drug active)`; } 
                else { displayElement.textContent = formatSecondsToHMS(secondsRemaining); currentTooltipText = `Full at: ${endsTimestamp}`; }
                displayElement.dataset.tooltipContent = currentTooltipText;
                secondsRemaining--; intervals[barName] = setTimeout(tick, 1000); 
            }
        }
        tick(); 
    }
    function clearAllTimers() { 
        Object.keys(intervals).forEach(key => { if (intervals[key]) { if (key === 'update' || key === 'newDay') clearInterval(intervals[key]); else clearTimeout(intervals[key]); intervals[key] = null; }});
        lastGoodPrimaryData = null; lastGoodRaceData = null; lastLifeValue = null;
        lifeAlreadyNotifiedMax = false; 
        newDayNotified = false; newDaySoonNotified = false; travelLandingSoonNotifiedThisTrip = false;
        boosterReadyNotified = false;
        medicalReadyNotified = false;
        drugReadyNotified = false;
        energyFullNotified = false;
        nerveFullNotified = false;

        const elementsToClearFlash = [ energyRefillStatus, nerveRefillStatus, tokenRefillStatus, newDayTimerDisplay, boosterDisplayValue, boosterTimerDisplay, medicalDisplayValue, medicalTimerDisplay, drugDisplayValue, drugTimerDisplay, travelTimerDisplay, raceTimerDisplay, travelLabelElement, raceLabelElement, energyTimerDisplay, nerveTimerDisplay, happinessTimerDisplay ];
        elementsToClearFlash.forEach(el => { if (el) el.classList.remove('flashing', 'new-day-warning', 'soon', 'label-flash-red'); });
        const timersToResetText = [ energyTimerDisplay, nerveTimerDisplay, happinessTimerDisplay, boosterTimerDisplay, medicalTimerDisplay, drugTimerDisplay, newDayTimerDisplay, travelTimerDisplay, raceTimerDisplay ];
        timersToResetText.forEach(timer => { if (timer) { timer.textContent = '--:--:--'; if (timer.classList) timer.classList.remove('full'); if (timer.dataset) timer.dataset.tooltipContent = ""; }});
        if (lifeDisplayValue) lifeDisplayValue.textContent = '--/--'; if (healthBarFillDisplay) healthBarFillDisplay.style.width = '0%';
        if (energyDisplayValue) energyDisplayValue.textContent = '--/--'; if (nerveDisplayValue) nerveDisplayValue.textContent = '--/--'; if (happinessDisplayValue) happinessDisplayValue.textContent = '--/--';
        if (boosterDisplayValue) boosterDisplayValue.textContent = '--'; if (medicalDisplayValue) medicalDisplayValue.textContent = '--'; if (drugDisplayValue) drugDisplayValue.textContent = '--';
        if (messagesIconDisplay) messagesIconDisplay.innerHTML = mailIconSVG; if (messagesCountDisplay) { messagesCountDisplay.textContent = '--'; messagesIconDisplay.className = 'notification-icon messages-icon green'; messagesCountDisplay.className = 'notification-count messages-count green'; }
        if (eventsIconDisplay) eventsIconDisplay.innerHTML = eventIconSVG; if (eventsCountDisplay) { eventsCountDisplay.textContent = '--'; eventsIconDisplay.className = 'notification-icon events-icon green'; eventsCountDisplay.className = 'notification-count events-count green'; }
        if (energyRefillStatus) energyRefillStatus.textContent = '--'; if (nerveRefillStatus) nerveRefillStatus.textContent = '--'; if (tokenRefillStatus) tokenRefillStatus.textContent = '--';
        if (travelDestinationValue) travelDestinationValue.textContent = '--'; if (raceInfoValue) raceInfoValue.textContent = '--';
        if (travelStatusDiv) travelStatusDiv.style.display = 'none'; if (raceStatusDiv) raceStatusDiv.style.display = 'none';
    }
    function clearDataDisplayTimers() { 
        const dataTimerKeys = ['energy', 'nerve', 'happiness', 'booster', 'medical', 'drug', 'travel', 'race', 'travelEndFlashTimeout', 'raceEndFlashTimeout'];
        dataTimerKeys.forEach(key => { if (intervals[key]) { clearTimeout(intervals[key]); intervals[key] = null; }});
        const elementsToClearFlash = [ boosterDisplayValue, boosterTimerDisplay, medicalDisplayValue, medicalTimerDisplay, drugDisplayValue, drugTimerDisplay, travelTimerDisplay, raceTimerDisplay, travelLabelElement, raceLabelElement, energyTimerDisplay, nerveTimerDisplay, happinessTimerDisplay ];
        elementsToClearFlash.forEach(el => { if (el) el.classList.remove('flashing', 'soon', 'label-flash-red'); });
        const timersToResetText = [ energyTimerDisplay, nerveTimerDisplay, happinessTimerDisplay, boosterTimerDisplay, medicalTimerDisplay, drugTimerDisplay, travelTimerDisplay, raceTimerDisplay ];
        timersToResetText.forEach(timer => { if (timer) { timer.textContent = '--:--:--'; if (timer.classList) timer.classList.remove('full'); if (timer.dataset) timer.dataset.tooltipContent = ""; }});
        if (travelStatusDiv && (!apiKey || (travelErrorDiv && travelErrorDiv.textContent)) && !(travelLabelElement && travelLabelElement.classList.contains('label-flash-red'))) travelStatusDiv.style.display = 'none';
        if (raceStatusDiv && (!apiKey || (raceErrorDiv && raceErrorDiv.textContent)) && !(raceLabelElement && raceLabelElement.classList.contains('label-flash-red'))) raceStatusDiv.style.display = 'none';
    }
    function clearErrorMessages(type = 'all') { 
        if (type === 'all' || type === 'primary') {
            const apiErrorMainDiv = apiSetupDiv ? apiSetupDiv.querySelector('.api-error-main') : null;
            const settingsApiErrorDiv = settingsPanel ? settingsPanel.querySelector('.api-error-settings') : null;
            const statusErrDiv = guiContainer ? guiContainer.querySelector('.status-error') : null;
            if (apiErrorMainDiv) apiErrorMainDiv.textContent = ''; if (settingsApiErrorDiv) settingsApiErrorDiv.textContent = ''; if (statusErrDiv) statusErrDiv.textContent = '';
        }
        if (type === 'all' || type === 'race') { if (raceErrorDiv) raceErrorDiv.textContent = ''; }
    }

    async function toggleMinimize() {
        if (!store || !guiContainer || !minimizeButton) {
            console.error('[TRACE] toggleMinimize: Store, guiContainer, or minimizeButton not available.');
            return;
        }
        console.log('[TRACE] toggleMinimize called. Current isMinimized state:', isMinimized);
        isMinimized = !isMinimized; 
        guiContainer.classList.toggle('minimized', isMinimized);
        minimizeButton.textContent = isMinimized ? '□' : '−'; 
        minimizeButton.title = isMinimized ? 'Restore' : 'Minimize';

        try {
            await store.set(GUI_MINIMIZED_STORAGE, isMinimized.toString()); 
            await store.save();
            console.log('[TRACE] toggleMinimize: Minimized state saved to store:', isMinimized);

            if (isMinimized) {
                const currentSize = await appWindowInstance.innerSize(); 
                if (currentSize.width !== MINIMIZED_WIDTH || currentSize.height !== MINIMIZED_HEIGHT) {
                    lastNormalWindowSize = { width: currentSize.width, height: currentSize.height };
                    await store.set(LAST_WINDOW_SIZE_STORAGE, lastNormalWindowSize); 
                    await store.save();
                     console.log('[TRACE] toggleMinimize: Stored last normal window size:', lastNormalWindowSize);
                }
                await appWindowInstance.setSize(new PhysicalSize(MINIMIZED_WIDTH, MINIMIZED_HEIGHT));
                console.log(`[TRACE] toggleMinimize: Window resized to ${MINIMIZED_WIDTH}x${MINIMIZED_HEIGHT}`);
            } else {
                let sizeToRestore = lastNormalWindowSize; 
                if (!sizeToRestore) { 
                    sizeToRestore = await store.get(LAST_WINDOW_SIZE_STORAGE);
                }

                if (sizeToRestore && sizeToRestore.width && sizeToRestore.height) {
                    await appWindowInstance.setSize(new PhysicalSize(sizeToRestore.width, sizeToRestore.height));
                    console.log(`[TRACE] toggleMinimize: Window restored to ${sizeToRestore.width}x${sizeToRestore.height}`);
                } else {
                    console.log('[TRACE] toggleMinimize: No stored normal size, recalculating based on content.');
                    if (settingsPanel && settingsPanel.style.display === 'flex') {
                    } else if (apiKey && tosAccepted) {
                        switchView(true); 
                    } else {
                        switchView(false); 
                    }
                    await resizeWindowToContent(); 
                }
            }
        } catch (e) {
            console.error('[TRACE] toggleMinimize: Error saving state or resizing window:', e);
        }
        if (!isMinimized) {
            if (settingsPanel && settingsPanel.style.display === 'flex') {
            } else if (apiKey && tosAccepted) {
                switchView(true); 
            } else {
                switchView(false); 
            }
            if (!lastNormalWindowSize) {
                 setTimeout(resizeWindowToContent, 100); 
            }
        }
    }
    
    async function saveApiKey(inputElement, errorElement, fromSettings = false) { 
        if (!store) { if (errorElement) errorElement.textContent = "Error: Settings store unavailable."; return; }
        if (!inputElement || !errorElement) return;
        const newKey = inputElement.value.trim();
        if (!fromSettings && tosCheckbox && !tosCheckbox.checked) { errorElement.textContent = "Please accept the Terms of Service."; return; }
        if (newKey && /^[a-zA-Z0-9]{16}$/.test(newKey)) { 
            apiKey = newKey; 
            try {
                await store.set(API_KEY_STORAGE, apiKey);
                if (!fromSettings) { await store.set(TOS_ACCEPTED_STORAGE, 'true'); tosAccepted = true; }
                await store.save(); 
                if (tosSection) tosSection.style.display = 'none'; 
                inputElement.value = ''; clearErrorMessages(); switchView(true); 
                if (intervals.update) clearInterval(intervals.update);
                fetchData(); intervals.update = setInterval(fetchData, UPDATE_INTERVAL_MS); 
                if (fromSettings) toggleSettingsPanel(); 
            } catch (e) {
                if (errorElement) errorElement.textContent = "Error saving settings.";
            }
        } else errorElement.textContent = "Invalid Key format (16 letters/numbers)";
        if (!fromSettings) updateApiKeySaveButtonState(); 
    }
    async function promptClearApiKey() { 
        if (!store) { if (settingsApiError) settingsApiError.textContent = "Error: Settings store unavailable."; return; }
        apiKey = null; 
        try {
            await store.delete(API_KEY_STORAGE); 
            await store.save(); 
            if (intervals.update) { clearInterval(intervals.update); intervals.update = null; }
            clearAllTimers(); updateDisplay({ error: "API Key cleared. Enter a new key.", target: 'api_settings', isTransient: false });
            switchView(false); 
            if (settingsApiKeyInput) settingsApiKeyInput.value = ''; 
            if (settingsPanel && settingsPanel.style.display !== 'flex') toggleSettingsPanel();
            if (apiErrorMain) apiErrorMain.textContent = "API Key cleared. Enter a new key."; 
        } catch (e) {
            if (settingsApiError) settingsApiError.textContent = "Error clearing key.";
        }
    }
    function switchView(showStatus) { 
        if (!apiSetupDiv || !notificationsDiv || !statusDiv || !refillsDiv || !guiContainer || !firstRunAutostartOptionDiv || !travelStatusDiv || !raceStatusDiv || !tosSection) return;
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
            if (!tosAccepted) tosSection.style.display = 'block'; 
            else tosSection.style.display = 'none';
            firstRunAutostartOptionDiv.style.display = (!apiKey && tosAccepted) ? 'block' : 'none';
            updateApiKeySaveButtonState(); 
        }
        requestAnimationFrame(resizeWindowToContent); 
    }
    function isNewerVersion(latestVersionTag, currentVersion) { 
        const latest = latestVersionTag.replace(/^v/, '').split('.').map(Number);
        const current = currentVersion.replace(/^v/, '').split('.').map(Number);
        for (let i = 0; i < Math.max(latest.length, current.length); i++) {
            const latestPart = latest[i] || 0; const currentPart = current[i] || 0;
            if (latestPart > currentPart) return true; if (latestPart < currentPart) return false;
        } return false; 
    }
    async function checkForUpdates() { 
        try {
            const response = await fetch(GITHUB_RELEASES_API_URL);
            if (!response.ok) {
                console.warn(`[TRACE] checkForUpdates: Failed to fetch update info. Status: ${response.status}`);
                return;
            }
            const releaseData = await response.json();
            const latestVersionTag = releaseData.tag_name;
            if (latestVersionTag && isNewerVersion(latestVersionTag, SCRIPT_VERSION)) {
                if (updateNotificationElement) {
                    const updateLink = updateNotificationElement.querySelector('a');
                    if (updateLink) { updateLink.href = GITHUB_RELEASES_PAGE_URL; updateLink.textContent = `Update to ${latestVersionTag} available!`; }
                    updateNotificationElement.style.display = 'inline'; 
                    requestAnimationFrame(resizeWindowToContent); 
                }
            } else if (updateNotificationElement) {
                updateNotificationElement.style.display = 'none';
                requestAnimationFrame(resizeWindowToContent);
            }
        } catch (error) { console.error("[TRACE] Failed to check for updates:", error); }
    }

    async function init() {
        console.log('[TRACE] init: Starting initialization.');
        try {
            store = await Store.load(STORE_FILE_NAME);
            await store.set('__initialization_check__', true);
            const check = await store.get('__initialization_check__');
            if (check !== true) throw new Error("Store integrity check failed after initialization.");
            await store.delete('__initialization_check__'); await store.save();
        } catch (e) {
            console.error('[TRACE] init: CRITICAL ERROR creating, loading, or verifying main store instance:', e);
            if (!apiSetupDiv && typeof cacheGUIElements === 'function' && !guiContainer) cacheGUIElements(); 
            const errorMsg = `Critical Error: Settings store failed (${e.message || e}). App cannot function.`;
            if (apiErrorMain) { apiErrorMain.textContent = errorMsg; if(apiSetupDiv) apiSetupDiv.style.setProperty('display', 'block', 'important'); } 
            else if (document.body) document.body.innerHTML = `<div style="color: red; padding: 20px; font-family: sans-serif; background: #333;">${errorMsg}</div>`;
            if (typeof resizeWindowToContent === 'function') requestAnimationFrame(resizeWindowToContent); 
            return; 
        }
        try {
            apiKey = await store.get(API_KEY_STORAGE) || null;
            const minimizedStr = await store.get(GUI_MINIMIZED_STORAGE);
            isMinimized = minimizedStr === 'true';
            const tosAcceptedStr = await store.get(TOS_ACCEPTED_STORAGE);
            tosAccepted = tosAcceptedStr === 'true';
            lastNormalWindowSize = await store.get(LAST_WINDOW_SIZE_STORAGE) || null; 
        } catch (e) {
            console.error('[TRACE] init: CRITICAL ERROR during initial store GET operations (post-init):', e);
            if (!apiErrorMain && typeof cacheGUIElements === 'function' && !guiContainer) cacheGUIElements();
            if (apiErrorMain) { apiErrorMain.textContent = `Error accessing settings (${e.message || e}). Please restart.`; if(apiSetupDiv) apiSetupDiv.style.setProperty('display', 'block', 'important');}
            apiKey = null; isMinimized = false; tosAccepted = false; lastNormalWindowSize = null;
        }
        
        if (!cacheGUIElements()) { 
             console.error("[TRACE] init: cacheGUIElements failed. Aborting further initialization as guiContainer is missing.");
             if (apiErrorMain && apiSetupDiv) { 
                 apiErrorMain.textContent = "Critical UI Error (guiContainer missing). Please restart."; 
                 apiSetupDiv.style.setProperty('display', 'block', 'important');
             }
             return; 
        }

        try {
            await appWindowInstance.setIgnoreCursorEvents(true);
            console.log('[TRACE] Initializing window to be click-through.');
        } catch (e) {
            console.error('[TRACE] Error setting initial click-through state:', e);
        }

        await initializeAutostart();
        await initializeAlwaysOnTop();
        await initializeLinkTypeSettings();
        await initializeCloseToTray(); 
        await initializeDesktopNotifications(); 
        await initializeNotificationSettings(); 
        await initializeFlashingSettings();   
        
        checkForUpdates(); // Initial check
        const UPDATE_CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes in milliseconds
        setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL_MS); // Periodic check
        console.log(`[TRACE] init: Periodic update check configured every ${UPDATE_CHECK_INTERVAL_MS / 60000} minutes.`);

        await testStoreFunction(); 

        if (isMinimized) {
            guiContainer.classList.add('minimized');
            if (minimizeButton) { minimizeButton.textContent = '□'; minimizeButton.title = 'Restore'; }
            try {
                await appWindowInstance.setSize(new PhysicalSize(MINIMIZED_WIDTH, MINIMIZED_HEIGHT));
                console.log(`[TRACE] init: Window set to initial minimized size ${MINIMIZED_WIDTH}x${MINIMIZED_HEIGHT}`);
            } catch (e) { console.error("[TRACE] Error setting initial minimized window size:", e); }
            if (apiSetupDiv) apiSetupDiv.style.display = 'none';
            if (notificationsDiv) notificationsDiv.style.display = 'none';
            if (statusDiv) statusDiv.style.display = 'none';
            if (refillsDiv) refillsDiv.style.display = 'none';
            if (travelStatusDiv) travelStatusDiv.style.display = 'none';
            if (raceStatusDiv) raceStatusDiv.style.display = 'none';
            if (firstRunAutostartOptionDiv) firstRunAutostartOptionDiv.style.display = 'none';
            if (tosSection) tosSection.style.display = 'none';
            if (settingsPanel) settingsPanel.style.display = 'none'; 

        } else if (lastNormalWindowSize && lastNormalWindowSize.width && lastNormalWindowSize.height) {
             try {
                await appWindowInstance.setSize(new PhysicalSize(lastNormalWindowSize.width, lastNormalWindowSize.height));
                console.log(`[TRACE] init: Window restored to last normal size ${lastNormalWindowSize.width}x${lastNormalWindowSize.height}`);
            } catch (e) { console.error("[TRACE] Error setting initial normal window size:", e); }
        }

        if (!apiKey || !tosAccepted) { 
            if (!isMinimized) switchView(false); 
            else { 
                if (apiSetupDiv) apiSetupDiv.style.setProperty('display', 'block', 'important'); 
                if (notificationsDiv) notificationsDiv.style.setProperty('display', 'none', 'important');
                 if (!tosAccepted && tosSection) tosSection.style.display = 'block'; 
                 else if (tosSection) tosSection.style.display = 'none';
                 if (firstRunAutostartOptionDiv) firstRunAutostartOptionDiv.style.display = (!apiKey && tosAccepted) ? 'block' : 'none';
                 requestAnimationFrame(resizeWindowToContent); 
            }
            if (!apiKey) clearAllTimers(); 
            updateApiKeySaveButtonState(); 
        } else { 
            if (intervals.update) clearInterval(intervals.update); 
            fetchData(); 
            intervals.update = setInterval(fetchData, UPDATE_INTERVAL_MS); 
            if (isMinimized) { 
                if (notificationsDiv) notificationsDiv.style.setProperty('display', 'flex', 'important');
                if (statusDiv) statusDiv.style.setProperty('display', 'block', 'important');
                if (refillsDiv) refillsDiv.style.setProperty('display', 'block', 'important');
                if (apiSetupDiv) apiSetupDiv.style.setProperty('display', 'none', 'important');
                requestAnimationFrame(resizeWindowToContent); 
            } else {
                 switchView(true); 
            }
        }
        console.log('[TRACE] init: Initial setup complete.');
        setTimeout(resizeWindowToContent, 100); 
        console.log('[TRACE] init: Initialization finished.');
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('[TRACE] DOM already complete/interactive, calling init.');
        init();
    } else {
        console.log('[TRACE] DOM not ready, adding DOMContentLoaded listener for init.');
        document.addEventListener('DOMContentLoaded', init);
    }
})();

