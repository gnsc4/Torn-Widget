// Tauri API imports
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
// import { invoke } from '@tauri-apps/api/core'; // invoke was not used
import { Store } from '@tauri-apps/plugin-store';
import { enable as enableAutostart, disable as disableAutostart, isEnabled as isAutostartEnabled } from '@tauri-apps/plugin-autostart';

// Get the current window instance
const appWindowInstance = getCurrentWindow();
console.log('[TRACE] appWindowInstance obtained:', appWindowInstance);

// Main store instance will be declared here and initialized in init()
let store;
const STORE_FILE_NAME = 'widgetsettings.dat'; // Main store filename
const DEBUG_STORE_FILE_NAME = 'debugteststore.dat'; // Debug store filename
const PROBE_STORE_FILE_NAME = 'probestore.dat'; // Filename for testing Store functionality itself

(async function() { // This is the start of the IIFE (Immediately Invoked Function Expression)
    'use strict';
    console.log('[TRACE] IIFE started.');

    // ===== Test Store Function (Keep for sanity check) =====
    // This function is defined early but typically called after main store init or within init()
    // It helps verify that the Store plugin is working as expected.
    async function testStoreFunction() {
        console.log('[TRACE] testStoreFunction: Starting test...');
        if (!Store) {
            console.error('[TRACE] testStoreFunction: Store class is not available. Skipping test.');
            return;
        }
        // Check if the main store failed to initialize AND if probing a new store also fails.
        // This helps determine if the Store plugin itself is fundamentally non-functional.
        if (!store && !(await (async () => {
            try {
                const probe = await Store.load(PROBE_STORE_FILE_NAME); // Use static load for probe
                return !!probe; // Check if probe is truthy (successfully loaded)
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
            testStoreInstance = await Store.load(DEBUG_STORE_FILE_NAME); // Use static load
            console.log('[TRACE] testStoreFunction: Test store instance loaded via Store.load():', testStoreInstance, 'with path:', DEBUG_STORE_FILE_NAME);

            console.log('[TRACE] testStoreFunction: Attempting to get keys from test store first.');
            const initialKeys = await testStoreInstance.keys();
            console.log('[TRACE] testStoreFunction: Initial keys from test store:', initialKeys);

            console.log('[TRACE] testStoreFunction: Attempting to set "debugKey" to "debugValue"');
            await testStoreInstance.set('debugKey', 'debugValue');
            console.log('[TRACE] testStoreFunction: Successfully set value.');

            console.log('[TRACE] testStoreFunction: Attempting to get "debugKey"');
            const value = await testStoreInstance.get('debugKey');
            console.log('[TRACE] testStoreFunction: Got value:', value);

            if (value !== 'debugValue') {
                console.error('[TRACE] testStoreFunction: Value mismatch! Expected "debugValue", got:', value);
            } else {
                console.log('[TRACE] testStoreFunction: Value matches. Test successful so far.');
            }

            console.log('[TRACE] testStoreFunction: Attempting to save test store.');
            await testStoreInstance.save(); // Explicit save
            console.log('[TRACE] testStoreFunction: Test store saved.');

            console.log('[TRACE] testStoreFunction: Attempting to clear "debugKey".');
            await testStoreInstance.delete('debugKey');
            console.log('[TRACE] testStoreFunction: "debugKey" cleared.');

            const clearedValue = await testStoreInstance.get('debugKey');
            console.log('[TRACE] testStoreFunction: Value after clear:', clearedValue);
            if (clearedValue !== null && typeof clearedValue !== 'undefined') { // `get` returns null or undefined if key doesn't exist
                 console.error('[TRACE] testStoreFunction: Key not properly cleared, value is:', clearedValue);
            } else {
                 console.log('[TRACE] testStoreFunction: Key successfully cleared.');
            }
            // Clean up test store file (optional, could use fs plugin or store.deleteStore() if available/needed)
            // For now, clearing keys is sufficient for this test.
            console.log('[TRACE] testStoreFunction: Test store cleanup would happen here if direct FS access was simple or store.deleteStore() was used.');


        } catch (e) {
            console.error('[TRACE] testStoreFunction: Error during test:', e);
        }
        console.log('[TRACE] testStoreFunction: Test finished.');
    }

    // ===== Constants =====
    const SCRIPT_VERSION = "1.0.42";
    const FORUM_THREAD_URL = "https://www.torn.com/forums.php#/p=threads&f=67&t=16473214&b=0&a=0";
    const AUTHOR_NAME = "GNSC4 [268863]";
    const AUTHOR_URL = "https://www.torn.com/profiles.php?XID=268863";
    const GITHUB_RELEASES_API_URL = "https://api.github.com/repos/gnsc4/Torn-Widget/releases/latest";
    const GITHUB_RELEASES_PAGE_URL = "https://github.com/gnsc4/Torn-Widget/releases";

    const UPDATE_INTERVAL_MS = 15 * 1000; // 15 seconds for API data refresh
    // Storage keys for tauri-plugin-store
    const API_KEY_STORAGE = 'torn_status_api_key_v1_widget';
    const GUI_MINIMIZED_STORAGE = 'torn_status_gui_minimized_v1_widget';
    const AUTOSTART_PREFERENCE_STORAGE = 'torn_autostart_preference_v1_widget';
    const ALWAYS_ON_TOP_PREFERENCE_STORAGE = 'torn_always_on_top_preference_v1_widget';
    const LINK_TYPE_SETTINGS_PREFIX = 'torn_link_type_v1_widget_'; // Prefix for item link preferences
    const TOS_ACCEPTED_STORAGE = 'torn_tos_accepted_v1_widget';

    // ===== State Variables =====
    let apiKey, isMinimized, tosAccepted;
    let intervals = { // To store interval/timeout IDs for clearing them later
        update: null, energy: null, nerve: null, happiness: null,
        booster: null, medical: null, drug: null, newDay: null,
        travel: null, race: null,
        travelEndFlashTimeout: null, raceEndFlashTimeout: null
    };

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
    let settingsPanel, settingsApiKeyInput, settingsApiKeySaveButton, settingsApiKeyClearButton, settingsApiError, settingsAutostartCheckbox, settingsAlwaysOnTopCheckbox, settingsPanelCloseButton;

    let tosSection, tosCheckbox;

    // Default cooldowns, can be updated from API if user has perks
    let userMaxBoosterCooldownSeconds = 48 * 3600; // Default 48 hours
    let userMaxMedicalCooldownSeconds = 6 * 3600;  // Default 6 hours

    // To store the last successfully fetched data, for display during transient errors
    let lastGoodPrimaryData = null;
    let lastGoodRaceData = null;

    // SVG icons for notifications
    const mailIconSVG = `<svg viewBox="0 0 24 24" fill="currentColor" width="16px" height="16px"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`;
    const eventIconSVG = `<svg viewBox="0 0 24 24" fill="currentColor" width="16px" height="16px"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;

    // Configuration for item link destinations (personal vs. faction)
    const itemLinkUrls = {
        drug: { personal: 'https://www.torn.com/item.php#drugs-items', faction: 'https://www.torn.com/factions.php?step=your&type=1#/tab=armoury&start=0&sub=drugs', elementId: 'drug-cooldown-link', toggleId: 'drug-link-type-toggle', personalLabelId: 'drug-personal-label', factionLabelId: 'drug-faction-label' },
        booster: { personal: 'https://www.torn.com/item.php#energy-d-items', faction: 'https://www.torn.com/factions.php?step=your&type=1#/tab=armoury&start=0&sub=boosters', elementId: 'booster-cooldown-link', toggleId: 'booster-link-type-toggle', personalLabelId: 'booster-personal-label', factionLabelId: 'booster-faction-label' },
        medical: { personal: 'https://www.torn.com/item.php#medical-items', faction: 'https://www.torn.com/factions.php?step=your&type=1#/tab=armoury&start=0&sub=medical', elementIds: ['medical-cooldown-link', 'life-link'], toggleId: 'medical-link-type-toggle', personalLabelId: 'medical-personal-label', factionLabelId: 'medical-faction-label' },
        energyRefill: { personal: 'https://www.torn.com/page.php?sid=points', faction: 'https://www.torn.com/factions.php?step=your&type=1#/tab=armoury&start=0&sub=points', elementId: 'energy-refill-link', toggleId: 'energyRefill-link-type-toggle', personalLabelId: 'energyRefill-personal-label', factionLabelId: 'energyRefill-faction-label' },
        nerveRefill: { personal: 'https://www.torn.com/page.php?sid=points', faction: 'https://www.torn.com/factions.php?step=your&type=1#/tab=armoury&start=0&sub=points', elementId: 'nerve-refill-link', toggleId: 'nerveRefill-link-type-toggle', personalLabelId: 'nerveRefill-personal-label', factionLabelId: 'nerveRefill-faction-label' }
    };
    let linkTargetElements = {}; // To store references to the <a> elements
    let linkToggleElements = {}; // To store references to the toggle switch input and labels

    // ===== Autostart Plugin Functions =====
    async function enableAppAutostart() {
        try {
            await enableAutostart();
            console.log('[TRACE] Autostart enabled via plugin.');
        } catch (e) {
            console.error('[TRACE] Failed to enable autostart via plugin:', e);
        }
    }

    async function disableAppAutostart() {
        try {
            await disableAutostart();
            console.log('[TRACE] Autostart disabled via plugin.');
        } catch (e) {
            console.error('[TRACE] Failed to disable autostart via plugin:', e);
        }
    }

    async function isAppAutostartEnabled() { // Note: This checks if the plugin *thinks* it's enabled, actual OS status can vary.
        try {
            const enabled = await isAutostartEnabled();
            console.log('[TRACE] Plugin autostart status:', enabled);
            return enabled;
        } catch (e) {
            console.error('[TRACE] Failed to check plugin autostart status:', e);
            return false;
        }
    }

    // ===== Window and GUI Management Functions =====

    /**
     * Resizes the application window to fit its content.
     * This is crucial for a widget-like application where content size can change dynamically.
     */
    async function resizeWindowToContent() {
        console.log('[TRACE] resizeWindowToContent called.');
        if (!guiContainer || !versionDiv || !document.getElementById('torn-status-header')) {
            console.warn('[TRACE] resizeWindowToContent: Missing critical elements for resize. Aborting.');
            return;
        }

        // If the main GUI container is hidden, temporarily make it visible (but off-screen)
        // to calculate its height, then hide it again to prevent flicker.
        const wasGuiHidden = guiContainer.style.display === 'none';
        if (wasGuiHidden) {
            guiContainer.style.visibility = 'hidden'; // Hide before changing display to avoid flicker
            guiContainer.style.display = 'block';
        }

        guiContainer.offsetHeight; // Force browser reflow to get accurate dimensions

        const header = document.getElementById('torn-status-header');
        let calculatedInnerHeight = 0;

        // Add header height and its bottom margin
        calculatedInnerHeight += header.offsetHeight;
        calculatedInnerHeight += parseInt(getComputedStyle(header).marginBottom) || 0;

        // Calculate height of the main content area (either settings panel or other sections)
        if (settingsPanel && settingsPanel.style.display === 'flex') {
            calculatedInnerHeight += settingsPanel.offsetHeight;
            const settingsStyle = getComputedStyle(settingsPanel);
            calculatedInnerHeight += (parseInt(settingsStyle.paddingTop) || 0) + (parseInt(settingsStyle.paddingBottom) || 0);
        } else {
            let mainContentActualHeight = 0;
            const mainSections = [apiSetupDiv, notificationsDiv, travelStatusDiv, raceStatusDiv, statusDiv, refillsDiv, firstRunAutostartOptionDiv];
            let isFirstVisibleInSection = true;
            let previousMarginBottom = 0;

            // Iterate through sections to sum their heights, considering margin collapsing
            for (const section of mainSections) {
                if (section && getComputedStyle(section).display !== 'none') {
                    const sectionStyle = getComputedStyle(section);
                    const currentMarginTop = parseInt(sectionStyle.marginTop) || 0;

                    if (!isFirstVisibleInSection) {
                        // Approximate margin collapsing between sections
                        mainContentActualHeight += Math.max(previousMarginBottom, currentMarginTop);
                    } else {
                        // Top margin of the first visible section
                        mainContentActualHeight += currentMarginTop;
                    }
                    mainContentActualHeight += section.offsetHeight;
                    previousMarginBottom = parseInt(sectionStyle.marginBottom) || 0;
                    isFirstVisibleInSection = false;
                }
            }
            if (!isFirstVisibleInSection) { // Add the bottom margin of the last visible element
                mainContentActualHeight += previousMarginBottom;
            }
            calculatedInnerHeight += mainContentActualHeight;
        }

        // Add version div height and its top margin
        calculatedInnerHeight += parseInt(getComputedStyle(versionDiv).marginTop) || 0;
        calculatedInnerHeight += versionDiv.offsetHeight;

        // Add padding and border of the main GUI container
        const guiStyle = getComputedStyle(guiContainer);
        const finalWindowHeight = calculatedInnerHeight +
            (parseInt(guiStyle.paddingTop) || 0) +
            (parseInt(guiStyle.paddingBottom) || 0) +
            (parseInt(guiStyle.borderTopWidth) || 0) +
            (parseInt(guiStyle.borderBottomWidth) || 0) +
            // Add a small arbitrary padding if not showing settings panel. This might need refinement.
            ((settingsPanel && settingsPanel.style.display === 'flex') ? 0 : 10);

        console.log(`[TRACE] resizeWindowToContent: Calculated height: ${finalWindowHeight}, current width: ${guiContainer.offsetWidth}`);

        if (wasGuiHidden) {
            guiContainer.style.display = 'none'; // Restore display if it was hidden
            guiContainer.style.visibility = 'visible'; // Make visible again
        }

        // Use requestAnimationFrame for smoother resizing
        requestAnimationFrame(async () => {
            try {
                const currentWidth = guiContainer.offsetWidth; // Get current width, assuming it's mostly fixed by CSS min-width
                if (finalWindowHeight > 0 && currentWidth > 0) {
                    console.log(`[TRACE] resizeWindowToContent (RAF): Setting size to ${currentWidth}x${finalWindowHeight}`);
                    await appWindowInstance.setSize(new LogicalSize(Math.ceil(currentWidth), Math.ceil(finalWindowHeight)));
                } else {
                    console.warn(`[TRACE] resizeWindowToContent (RAF): Invalid dimensions for setSize - H:${finalWindowHeight}, W:${currentWidth}`);
                }
            } catch (e) {
                console.error("[TRACE] Error resizing window (RAF):", e);
            }
        });
    }

    /**
     * Formats a duration in seconds to HH:MM:SS string.
     * @param {number} totalSeconds - The total seconds to format.
     * @returns {string} Formatted time string.
     */
    function formatSecondsToHMS(totalSeconds) {
        if (isNaN(totalSeconds) || totalSeconds < 0) return '--:--:--';
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    /**
     * Caches references to frequently used DOM elements and sets up initial event listeners.
     * @returns {boolean} True if successful, false if critical elements like guiContainer are missing.
     */
    function cacheGUIElements() {
        console.log('[TRACE] cacheGUIElements: Starting.');
        guiContainer = document.getElementById('torn-status-gui');
        console.log('[TRACE] cacheGUIElements: guiContainer found?', !!guiContainer);
        if (!guiContainer) {
            console.error('[TRACE] cacheGUIElements: guiContainer NOT FOUND. Aborting further caching and listener attachment.');
            const body = document.body;
            if (body) {
                body.innerHTML = `<div style="color: red; padding: 20px; font-family: sans-serif;">Critical Error: UI container not found. JavaScript initialization failed.</div>`;
            }
            return false; // Indicate failure
        }

        // Cache header buttons and general UI elements
        minimizeButton = document.getElementById('torn-status-minimize-btn');
        closeButton = document.getElementById('torn-status-close-btn');
        settingsButton = document.getElementById('torn-status-settings-btn');
        customTooltipElement = document.getElementById('custom-tooltip');
        versionDiv = document.getElementById('widget-version');
        // updateNotificationElement will be cached after versionDiv.innerHTML is set

        // Cache API setup elements
        apiSetupDiv = document.getElementById('torn-status-api-setup');
        apiKeyInputMain = document.getElementById('torn-api-key-input-main');
        apiKeySaveButtonMain = document.getElementById('torn-api-key-save-btn-main');
        apiErrorMain = apiSetupDiv ? apiSetupDiv.querySelector('.api-error-main') : null;
        tosSection = document.getElementById('tos-section');
        tosCheckbox = document.getElementById('tos-checkbox');
        firstRunAutostartOptionDiv = document.getElementById('first-run-autostart-option');
        firstRunAutostartCheckbox = document.getElementById('first-run-autostart-checkbox');

        // Cache settings panel elements
        settingsPanel = document.getElementById('torn-status-settings-panel');
        settingsApiKeyInput = document.getElementById('torn-api-key-input-settings');
        settingsApiKeySaveButton = document.getElementById('torn-api-key-save-btn-settings');
        settingsApiKeyClearButton = document.getElementById('torn-api-key-clear-btn-settings');
        settingsApiError = settingsPanel ? settingsPanel.querySelector('.api-error-settings') : null;
        settingsAutostartCheckbox = document.getElementById('settings-autostart-checkbox');
        settingsAlwaysOnTopCheckbox = document.getElementById('settings-always-on-top-checkbox');
        settingsPanelCloseButton = document.getElementById('settings-panel-close-btn');

        // Cache travel and race status elements
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

        // Set version info and re-cache updateNotificationElement
        if (versionDiv) {
            versionDiv.innerHTML = `Author: <a href="${AUTHOR_URL}" target="_blank" title="View Author's Profile">${AUTHOR_NAME}</a> | <a href="${FORUM_THREAD_URL}" target="_blank" title="Go to Forum Thread">v${SCRIPT_VERSION}</a><span id="update-notification" style="display:none;"> <a href="#" target="_blank">New version available!</a></span>`;
            updateNotificationElement = document.getElementById('update-notification');
        }

        // Apply initial minimized state styling (isMinimized should be loaded from store before this)
        if (guiContainer){
            if (isMinimized) {
                guiContainer.classList.add('minimized');
                if (minimizeButton) { minimizeButton.textContent = '□'; minimizeButton.title = 'Maximize'; }
            } else {
                guiContainer.classList.remove('minimized');
                if (minimizeButton) { minimizeButton.textContent = '−'; minimizeButton.title = 'Minimize'; }
            }
        }

        // Cache main status display elements
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

        // Cache elements for link type preferences
        for (const key in itemLinkUrls) {
            const item = itemLinkUrls[key];
            if (item.elementId) {
                linkTargetElements[key] = document.getElementById(item.elementId);
            } else if (item.elementIds) { // For items affecting multiple links (e.g., medical)
                linkTargetElements[key] = item.elementIds.map(id => document.getElementById(id));
            }
            linkToggleElements[key] = {
                input: document.getElementById(item.toggleId),
                personalLabel: document.getElementById(item.personalLabelId),
                factionLabel: document.getElementById(item.factionLabelId)
            };
        }

        // Attach event listeners
        console.log('[TRACE] cacheGUIElements: Attaching event listeners.');
        if (minimizeButton) minimizeButton.addEventListener('click', toggleMinimize);
        if (closeButton) closeButton.addEventListener('click', async () => { console.log('[TRACE] Close button clicked.'); await appWindowInstance.close(); });
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

        const widgetHeader = document.getElementById('torn-status-header');
        if (widgetHeader) { // Allow clicking header to maximize if minimized
            widgetHeader.addEventListener('click', (e) => {
                if (isMinimized && guiContainer.classList.contains('minimized') && e.target === widgetHeader) {
                    toggleMinimize();
                }
            });
        }
        // Attach tooltip listeners
        const hoverAreas = guiContainer.querySelectorAll('.timer-hover-area');
        hoverAreas.forEach(area => {
            area.addEventListener('mouseover', handleTooltipMouseOver);
            area.addEventListener('mouseout', handleTooltipMouseOut);
            area.addEventListener('mousemove', handleTooltipMouseMove);
        });
        console.log('[TRACE] cacheGUIElements: Finished.');
        return true; // Indicate success
    }

    /**
     * Updates the enabled/disabled state of the main API key save button based on key validity and ToS acceptance.
     */
    function updateApiKeySaveButtonState() {
        if (!apiKeySaveButtonMain || !apiKeyInputMain || !tosCheckbox) return;
        const keyIsValid = /^[a-zA-Z0-9]{16}$/.test(apiKeyInputMain.value.trim());
        apiKeySaveButtonMain.disabled = !(keyIsValid && tosCheckbox.checked);
    }

    /**
     * Toggles the visibility of the settings panel.
     */
    function toggleSettingsPanel() {
        console.log('[TRACE] toggleSettingsPanel called.');
        if (!settingsPanel) {
            console.warn('[TRACE] toggleSettingsPanel: settingsPanel element not found.');
            return;
        }
        const isVisible = settingsPanel.style.display === 'flex';
        settingsPanel.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) { // When opening settings
            if (settingsApiKeyInput) settingsApiKeyInput.value = ''; // Clear previous input
            if (settingsApiError) settingsApiError.textContent = ''; // Clear previous error
        }
        resizeWindowToContent(); // Adjust window size after toggling
    }

    /**
     * Handles changes to the autostart checkbox (both in initial setup and settings).
     * @param {Event} event - The change event from the checkbox.
     */
    async function handleAutostartChange(event) {
        if (!store) { console.error('[TRACE] handleAutostartChange: Store not available.'); return; }
        const isEnabled = event.target.checked;
        console.log(`[TRACE] handleAutostartChange: Setting autostart preference to ${isEnabled}`);
        try {
            await store.set(AUTOSTART_PREFERENCE_STORAGE, isEnabled.toString());
            await store.save();

            if (isEnabled) {
                await enableAppAutostart();
            } else {
                await disableAppAutostart();
            }
            // Sync both checkboxes
            if (firstRunAutostartCheckbox) firstRunAutostartCheckbox.checked = isEnabled;
            if (settingsAutostartCheckbox) settingsAutostartCheckbox.checked = isEnabled;
        } catch (e) {
            console.error('[TRACE] handleAutostartChange: Error saving preference or enabling/disabling autostart:', e);
            // Optionally revert checkbox state or show error to user
        }
    }

    /**
     * Handles changes to the "Always on Top" checkbox.
     * @param {Event} event - The change event from the checkbox.
     */
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

    /**
     * Initializes autostart functionality based on stored preference or sets a default.
     */
    async function initializeAutostart() {
        if (!store) { console.error('[TRACE] initializeAutostart: Store not available.'); return; }
        console.log('[TRACE] initializeAutostart: Reading autostart preference.');
        try {
            let autostartPreference = await store.get(AUTOSTART_PREFERENCE_STORAGE);
            console.log('[TRACE] initializeAutostart: Current preference from store:', autostartPreference);
            let shouldEnablePlugin = false;

            if (autostartPreference === null) { // No preference saved yet
                shouldEnablePlugin = true; // Default to enabled for new users
                console.log('[TRACE] initializeAutostart: No preference found, defaulting to true and saving.');
                await store.set(AUTOSTART_PREFERENCE_STORAGE, 'true');
                await store.save();
                autostartPreference = 'true';
            } else {
                shouldEnablePlugin = autostartPreference === 'true';
            }

            if (shouldEnablePlugin) {
                console.log('[TRACE] initializeAutostart: Enabling autostart plugin.');
                await enableAppAutostart();
            } else {
                // If preference is false, ensure autostart is disabled (in case it was manually enabled outside app)
                // await disableAppAutostart(); // Consider if this is desired behavior
                console.log('[TRACE] initializeAutostart: Autostart plugin will not be enabled based on preference.');
            }

            const isChecked = autostartPreference === 'true';
            if (firstRunAutostartCheckbox) firstRunAutostartCheckbox.checked = isChecked;
            if (settingsAutostartCheckbox) settingsAutostartCheckbox.checked = isChecked;
            console.log('[TRACE] initializeAutostart: Checkboxes updated.');
        } catch (e) {
            console.error('[TRACE] initializeAutostart: Error during initialization:', e);
        }
    }

    /**
     * Initializes "Always on Top" functionality based on stored preference or sets a default.
     */
    async function initializeAlwaysOnTop() {
        if (!store) { console.error('[TRACE] initializeAlwaysOnTop: Store not available.'); return; }
        console.log('[TRACE] initializeAlwaysOnTop: Reading always on top preference.');
        try {
            let alwaysOnTopPreference = await store.get(ALWAYS_ON_TOP_PREFERENCE_STORAGE);
            console.log('[TRACE] initializeAlwaysOnTop: Current preference from store:', alwaysOnTopPreference);
            let shouldBeOnTop = true; // Default to true

            if (alwaysOnTopPreference === null) { // No preference saved
                console.log('[TRACE] initializeAlwaysOnTop: No preference found, defaulting to true and saving.');
                await store.set(ALWAYS_ON_TOP_PREFERENCE_STORAGE, 'true');
                await store.save();
            } else {
                shouldBeOnTop = alwaysOnTopPreference === 'true';
            }

            console.log(`[TRACE] initializeAlwaysOnTop: Setting always on top to: ${shouldBeOnTop}`);
            await appWindowInstance.setAlwaysOnTop(shouldBeOnTop);
            console.log(`[TRACE] initializeAlwaysOnTop: Initial Always on Top set to: ${shouldBeOnTop}`);

            if (settingsAlwaysOnTopCheckbox) {
                settingsAlwaysOnTopCheckbox.checked = shouldBeOnTop;
            }
            console.log('[TRACE] initializeAlwaysOnTop: Checkbox updated.');
        } catch (e) {
            console.error('[TRACE] initializeAlwaysOnTop: Failed to set initial always on top state or read/save preference:', e);
        }
    }

    /**
     * Updates the UI for a specific item's link type preference (personal/faction labels).
     * @param {string} itemKey - The key of the item (e.g., 'drug', 'booster').
     * @param {boolean} isFaction - True if faction link is active, false for personal.
     */
    function updateLinkPreferenceUI(itemKey, isFaction) {
        const toggleInfo = linkToggleElements[itemKey];
        if (toggleInfo && toggleInfo.personalLabel && toggleInfo.factionLabel) {
            toggleInfo.personalLabel.classList.toggle('active-preference', !isFaction);
            toggleInfo.factionLabel.classList.toggle('active-preference', isFaction);
        }
    }

    /**
     * Applies the link preference by updating the href of the target <a> element(s).
     * @param {string} itemKey - The key of the item.
     * @param {boolean} isFaction - True if faction link should be used.
     */
    async function applyLinkPreference(itemKey, isFaction) {
        const urlDetails = itemLinkUrls[itemKey];
        const targetLinkElementOrArray = linkTargetElements[itemKey];

        if (!urlDetails || !targetLinkElementOrArray) {
            console.warn(`[TRACE] applyLinkPreference: No URL details or target element for ${itemKey}`);
            return;
        }

        const newUrl = isFaction ? urlDetails.faction : urlDetails.personal;

        if (Array.isArray(targetLinkElementOrArray)) { // Handle items that update multiple links (e.g., medical)
            targetLinkElementOrArray.forEach(el => {
                if (el) el.href = newUrl;
            });
        } else { // Single link
            if (targetLinkElementOrArray) targetLinkElementOrArray.href = newUrl;
        }
        updateLinkPreferenceUI(itemKey, isFaction); // Update active label styling
    }

    /**
     * Initializes all item link type preferences from the store or sets defaults.
     */
    async function initializeLinkTypeSettings() {
        if (!store) { console.error('[TRACE] initializeLinkTypeSettings: Store not available.'); return; }
        console.log('[TRACE] initializeLinkTypeSettings: Initializing link type settings.');
        try {
            for (const itemKey of Object.keys(itemLinkUrls)) {
                const toggleInfo = linkToggleElements[itemKey];
                if (!toggleInfo || !toggleInfo.input) {
                    console.warn(`[TRACE] initializeLinkTypeSettings: Toggle input not found for ${itemKey}`);
                    continue;
                }

                console.log(`[TRACE] initializeLinkTypeSettings: Getting store value for ${LINK_TYPE_SETTINGS_PREFIX + itemKey}`);
                const savedSetting = await store.get(LINK_TYPE_SETTINGS_PREFIX + itemKey);
                console.log(`[TRACE] initializeLinkTypeSettings: Store value for ${itemKey} is "${savedSetting}"`);
                const isFaction = savedSetting === 'faction'; // Default to personal if not 'faction'

                toggleInfo.input.checked = isFaction;
                await applyLinkPreference(itemKey, isFaction);

                // Add event listener for this toggle
                toggleInfo.input.addEventListener('change', async (event) => {
                    if (!store) { console.error('[TRACE] Link type change: Store not available.'); return; }
                    const newIsFaction = event.target.checked;
                    console.log(`[TRACE] initializeLinkTypeSettings: Link type for ${itemKey} changed to ${newIsFaction ? 'faction' : 'personal'}. Saving.`);
                    try {
                        await store.set(LINK_TYPE_SETTINGS_PREFIX + itemKey, newIsFaction ? 'faction' : 'personal');
                        await store.save();
                        await applyLinkPreference(itemKey, newIsFaction);
                    } catch (e) {
                        console.error(`[TRACE] Error saving link preference for ${itemKey}:`, e);
                        // Optionally revert checkbox or show error
                    }
                });
            }
        } catch (e) {
            console.error('[TRACE] initializeLinkTypeSettings: Error during initialization:', e);
        }
        console.log('[TRACE] initializeLinkTypeSettings: Finished.');
    }

    // ===== Tooltip Functions =====
    function handleTooltipMouseOver(event) {
        const targetElement = event.currentTarget;
        const timerSpan = targetElement.querySelector('.timer'); // Tooltip content is expected on a .timer span
        if (customTooltipElement && timerSpan && timerSpan.dataset.tooltipContent) {
            customTooltipElement.innerHTML = timerSpan.dataset.tooltipContent;
            customTooltipElement.style.display = 'block';
            positionTooltip(event.pageX, event.pageY); // Position relative to mouse
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
        const offsetX = 10, offsetY = 15; // Offset from cursor
        let newX = x + offsetX;
        let newY = y + offsetY;

        const tooltipRect = customTooltipElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        // Adjust if tooltip goes off-screen
        if (newX + tooltipRect.width > viewportWidth) {
            newX = x - tooltipRect.width - offsetX; // Flip to left
        }
        if (newY + tooltipRect.height > viewportHeight) {
            newY = y - tooltipRect.height - offsetY; // Flip to top
        }
        // Ensure it doesn't go off-screen left/top either
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;

        customTooltipElement.style.left = `${newX}px`;
        customTooltipElement.style.top = `${newY}px`;
    }

    // ===== Data Fetching and Display Logic =====

    /**
     * Fetches user data from the Torn API.
     */
    async function fetchData() {
        console.log('[TRACE] fetchData: Called.');
        if (!store) {
            console.error('[TRACE] fetchData: Store not available. Cannot fetch data or save API key.');
            updateDisplay({ error: "Settings store unavailable.", target: 'api_main', isTransient: false });
            switchView(false); // Show API setup, though saving won't work
            return;
        }

        if (!apiKey) {
            console.log('[TRACE] fetchData: No API key, showing API setup.');
            updateDisplay({ error: "API Key needed", target: 'api_main', isTransient: false });
            switchView(false);
            if (intervals.update) { clearInterval(intervals.update); intervals.update = null; }
            clearAllTimers(); // Clear displayed data and timers
            return;
        }
        console.log('[TRACE] fetchData: API key present, proceeding.');

        // Fetch primary user data (bars, cooldowns, etc.)
        const primaryUrl = `https://api.torn.com/user/?selections=bars,cooldowns,refills,personalstats,notifications,travel&key=${apiKey}&comment=TornStatusWidget_v${SCRIPT_VERSION}`;
        const primaryController = new AbortController();
        const primaryTimeoutId = setTimeout(() => primaryController.abort(), 10000); // 10-second timeout

        try {
            console.log('[TRACE] fetchData: Fetching primary data...');
            const response = await fetch(primaryUrl, { method: 'GET', signal: primaryController.signal });
            clearTimeout(primaryTimeoutId);
            console.log('[TRACE] fetchData: Primary data response status:', response.status);

            if (!response.ok) {
                let errorData;
                try { errorData = await response.json(); }
                catch (parseErr) {
                    console.error('[TRACE] fetchData: Failed to parse error JSON for primary data.', parseErr);
                    throw new Error(`HTTP error ${response.status}`); // Rethrow generic HTTP error
                }

                if (errorData && errorData.error) {
                    const errMessage = `API Error ${errorData.error.code}`;
                    console.warn('[TRACE] fetchData: Primary API error:', errMessage, errorData.error);
                    if (errorData.error.code === 2) { // Invalid API Key
                        apiKey = null; // Clear local apiKey
                        await store.delete(API_KEY_STORAGE); // Remove from store
                        await store.save();
                        if (intervals.update) { clearInterval(intervals.update); intervals.update = null; }
                        clearAllTimers();
                        updateDisplay({ error: errMessage, target: 'api_main', isTransient: false });
                        switchView(false); // Show API setup
                        return; // Stop further processing for this fetch cycle
                    } else {
                        updateDisplay({ error: errMessage, target: 'status', isTransient: true }); // Show transient error
                    }
                } else {
                    updateDisplay({ error: `HTTP error ${response.status}`, target: 'status', isTransient: true });
                }
            } else { // Response OK
                const data = await response.json();
                if (data.error) { // API returned an error object despite 200 OK
                    console.warn('[TRACE] fetchData: Primary API error in successful response:', data.error.code, data.error);
                    if (data.error.code === 2) { // Invalid API Key
                        apiKey = null;
                        await store.delete(API_KEY_STORAGE);
                        await store.save();
                        if (intervals.update) { clearInterval(intervals.update); intervals.update = null; }
                        clearAllTimers();
                        updateDisplay({ error: `API Error ${data.error.code}`, target: 'api_main', isTransient: false });
                        switchView(false);
                        return;
                    } else {
                        updateDisplay({ error: `API Error ${data.error.code}`, target: 'status', isTransient: true });
                    }
                } else { // Successful data retrieval
                    console.log('[TRACE] fetchData: Primary data received successfully.');
                    lastGoodPrimaryData = data; // Store for potential use if next fetch fails
                    updateDisplay(lastGoodPrimaryData);
                    startTimers(lastGoodPrimaryData); // Start/reset countdown timers
                    clearErrorMessages('primary'); // Clear any previous primary errors
                }
            }
        } catch (error) {
            clearTimeout(primaryTimeoutId); // Clear timeout if fetch failed for other reasons (network, abort)
            const errorMsg = error.name === 'AbortError' ? 'Timeout (User Data)' : 'Network Error (User Data)';
            console.error('[TRACE] fetchData: Error fetching primary data:', errorMsg, error);
            updateDisplay({ error: errorMsg, target: 'status', isTransient: true }); // Show transient error
        }

        // Fetch race data (if API key is still valid)
        if (apiKey) {
            const raceUrl = `https://api.torn.com/v2/user/races?limit=1&sort=DESC&key=${apiKey}&comment=TornStatusWidget_v${SCRIPT_VERSION}`;
            const raceController = new AbortController();
            const raceTimeoutId = setTimeout(() => raceController.abort(), 10000); // 10-second timeout
            console.log('[TRACE] fetchData: Fetching race data...');
            try {
                const raceResponse = await fetch(raceUrl, { method: 'GET', signal: raceController.signal });
                clearTimeout(raceTimeoutId);
                console.log('[TRACE] fetchData: Race data response status:', raceResponse.status);

                if (!raceResponse.ok) {
                    let raceErrorData;
                    try { raceErrorData = await raceResponse.json(); } catch (e) { /* ignore parse error */ }
                    const raceErrCode = raceErrorData && raceErrorData.error ? raceErrorData.error.code : raceResponse.status;
                    if (raceErrorDiv) raceErrorDiv.textContent = `Race API Err: ${raceErrCode}`;
                    if (lastGoodRaceData) { // If previous race data exists, display it
                        updateRaceDisplay(lastGoodRaceData);
                        startRaceTimer(lastGoodRaceData);
                    } else {
                        updateRaceDisplay(null); // Clear race display
                    }
                } else { // Race response OK
                    const raceData = await raceResponse.json();
                    if (raceData.error) {
                        console.warn('[TRACE] fetchData: Race API error in successful response:', raceData.error.code, raceData.error);
                        if (raceErrorDiv) raceErrorDiv.textContent = `Race API Err: ${raceData.error.code}`;
                        if (lastGoodRaceData) { updateRaceDisplay(lastGoodRaceData); startRaceTimer(lastGoodRaceData); }
                        else { updateRaceDisplay(null); }
                    } else { // Successful race data
                        console.log('[TRACE] fetchData: Race data received successfully.');
                        if (raceErrorDiv) raceErrorDiv.textContent = ''; // Clear race error
                        lastGoodRaceData = raceData;
                        updateRaceDisplay(lastGoodRaceData);
                        startRaceTimer(lastGoodRaceData);
                    }
                }
            } catch (raceError) {
                clearTimeout(raceTimeoutId);
                console.error('[TRACE] fetchData: Error fetching race data:', raceError.name, raceError);
                if (raceErrorDiv) raceErrorDiv.textContent = raceError.name === 'AbortError' ? 'Race Timeout' : 'Race Net Err';
                if (lastGoodRaceData) { updateRaceDisplay(lastGoodRaceData); startRaceTimer(lastGoodRaceData); }
                else { updateRaceDisplay(null); }
            }
        } else { // No API key, so clear race display
            updateRaceDisplay(null);
        }

        // Ensure correct view is shown and resize window
        if (!isMinimized && !(settingsPanel && settingsPanel.style.display === 'flex')) {
            if (apiKey && tosAccepted) {
                switchView(true); // Show status view
            } else {
                switchView(false); // Show API setup view
            }
        }
        resizeWindowToContent();
    }

    /**
     * Updates the main GUI display with fetched data or error messages.
     * @param {object} data - The data object from API or an error object { error: string, target?: string, isTransient?: boolean }.
     */
    function updateDisplay(data) {
        console.log('[TRACE] updateDisplay called with data:', data);
        if (!guiContainer) {
            console.warn('[TRACE] updateDisplay: guiContainer not found. Cannot update display.');
            return;
        }
        const statusErrDiv = guiContainer.querySelector('.status-error'); // General status error display

        // Handle non-transient errors (e.g., API key issues, store failures)
        if (data.error && !data.isTransient) {
            // const currentApiErrorDiv = (settingsPanel && settingsPanel.style.display === 'flex') ? settingsApiError : apiErrorMain;
            if (data.target === 'api_main' && apiErrorMain) apiErrorMain.textContent = `Error: ${data.error}`;
            else if (data.target === 'api_settings' && settingsApiError) settingsApiError.textContent = `Error: ${data.error}`;
            else if (statusErrDiv) statusErrDiv.textContent = `Error: ${data.error}`; // Fallback to general status error

            if (data.target === 'api_main' || data.target === 'api_settings') return; // Don't process further if it's an API setup error
        } else if (data.error && data.isTransient) { // Handle transient errors (e.g., network issues)
            if (statusErrDiv) statusErrDiv.textContent = `Error: ${data.error}`;
        }

        // Use last good data if current fetch had an error, otherwise use current data
        const sourceData = data.error ? lastGoodPrimaryData : data;

        if (!sourceData) { // No data to display (e.g., first load failed and no lastGoodPrimaryData)
            console.log('[TRACE] updateDisplay: No sourceData to display.');
            // Clear travel/race specific errors if this wasn't an error update itself
            if (travelErrorDiv && !data.error) travelErrorDiv.textContent = '';
            if (raceErrorDiv && !data.error) raceErrorDiv.textContent = '';
            return;
        }

        // If this update is successful (no error in `data`), clear previous errors
        if (!data.error) {
            if (apiErrorMain) apiErrorMain.textContent = '';
            if (settingsApiError) settingsApiError.textContent = '';
            if (statusErrDiv) statusErrDiv.textContent = '';
        }

        // Update travel display first as it's a separate section
        updateTravelDisplay(sourceData.travel);

        // Update user-specific cooldown maximums if available from personalstats
        if (sourceData.personalstats && typeof sourceData.personalstats.boosters_max_cooldown_hours === 'number') {
            userMaxBoosterCooldownSeconds = sourceData.personalstats.boosters_max_cooldown_hours * 3600;
        }
         if (sourceData.personalstats && typeof sourceData.personalstats.medical_max_cooldown_hours === 'number') {
            userMaxMedicalCooldownSeconds = sourceData.personalstats.medical_max_cooldown_hours * 3600;
        }

        // Update notifications (messages, events)
        if (sourceData.notifications) {
            const msgCount = sourceData.notifications.messages || 0;
            const evtCount = sourceData.notifications.events || 0;
            if (messagesIconDisplay) messagesIconDisplay.innerHTML = mailIconSVG;
            if (messagesCountDisplay) {
                messagesCountDisplay.textContent = msgCount;
                // Style based on count
                messagesIconDisplay.className = msgCount > 0 ? 'notification-icon messages-icon red' : 'notification-icon messages-icon green';
                messagesCountDisplay.className = msgCount > 0 ? 'notification-count messages-count red' : 'notification-count messages-count green';
            }
            if (eventsIconDisplay) eventsIconDisplay.innerHTML = eventIconSVG;
            if (eventsCountDisplay) {
                eventsCountDisplay.textContent = evtCount;
                eventsIconDisplay.className = evtCount > 0 ? 'notification-icon events-icon red' : 'notification-icon events-icon green';
                eventsCountDisplay.className = evtCount > 0 ? 'notification-count events-count red' : 'notification-count events-count green';
            }
        } else { // Fallback if notifications data is missing
            if (messagesIconDisplay) messagesIconDisplay.innerHTML = mailIconSVG;
            if (messagesCountDisplay) { messagesCountDisplay.textContent = 'N/A'; messagesIconDisplay.className = 'notification-icon messages-icon green'; messagesCountDisplay.className = 'notification-count messages-count green'; }
            if (eventsIconDisplay) eventsIconDisplay.innerHTML = eventIconSVG;
            if (eventsCountDisplay) { eventsCountDisplay.textContent = 'N/A'; eventsIconDisplay.className = 'notification-icon events-icon green'; eventsCountDisplay.className = 'notification-count events-count green'; }
        }

        // Update life bar and value
        if (lifeDisplayValue && sourceData.life && typeof sourceData.life.current !== 'undefined' && typeof sourceData.life.maximum !== 'undefined' && sourceData.life.maximum > 0) {
            lifeDisplayValue.textContent = `${sourceData.life.current}/${sourceData.life.maximum}`;
            if (healthBarFillDisplay) {
                const percentage = (sourceData.life.current / sourceData.life.maximum) * 100;
                healthBarFillDisplay.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
                // Change health bar color based on percentage
                if (percentage <= 25) healthBarFillDisplay.style.backgroundColor = '#dc3545'; // Red
                else if (percentage <= 50) healthBarFillDisplay.style.backgroundColor = '#ffc107'; // Yellow
                else healthBarFillDisplay.style.backgroundColor = '#28a745'; // Green
            }
        } else if (lifeDisplayValue) { // Fallback for life
            lifeDisplayValue.textContent = 'N/A';
            if (healthBarFillDisplay) { healthBarFillDisplay.style.width = '0%'; healthBarFillDisplay.style.backgroundColor = '#444'; }
        }

        // Update energy, nerve, happiness values
        if (energyDisplayValue && sourceData.energy && typeof sourceData.energy.current !== 'undefined') energyDisplayValue.textContent = `${sourceData.energy.current}/${sourceData.energy.maximum}`; else if (energyDisplayValue) energyDisplayValue.textContent = 'N/A';
        if (nerveDisplayValue && sourceData.nerve && typeof sourceData.nerve.current !== 'undefined') nerveDisplayValue.textContent = `${sourceData.nerve.current}/${sourceData.nerve.maximum}`; else if (nerveDisplayValue) nerveDisplayValue.textContent = 'N/A';
        if (happinessDisplayValue && sourceData.happy && typeof sourceData.happy.current !== 'undefined') happinessDisplayValue.textContent = `${sourceData.happy.current}/${sourceData.happy.maximum}`; else if (happinessDisplayValue) happinessDisplayValue.textContent = 'N/A';

        // Update cooldowns status (booster, medical, drug)
        if (sourceData.cooldowns) {
            if (boosterDisplayValue) {
                boosterDisplayValue.textContent = sourceData.cooldowns.booster > 0 ? 'Active' : 'Ready';
                // Flash if ready
                if (sourceData.cooldowns.booster === 0) boosterDisplayValue.classList.add('flashing');
                else boosterDisplayValue.classList.remove('flashing');
                if (boosterTimerDisplay) { // Also manage timer flashing consistency
                     if (sourceData.cooldowns.booster === 0) boosterTimerDisplay.classList.add('flashing');
                     else boosterTimerDisplay.classList.remove('flashing');
                }
            }
            if (medicalDisplayValue) {
                medicalDisplayValue.textContent = sourceData.cooldowns.medical > 0 ? 'Active' : 'Ready';
                if (sourceData.cooldowns.medical === 0) medicalDisplayValue.classList.add('flashing');
                else medicalDisplayValue.classList.remove('flashing');
                 if (medicalTimerDisplay) {
                     if (sourceData.cooldowns.medical === 0) medicalTimerDisplay.classList.add('flashing');
                     else medicalTimerDisplay.classList.remove('flashing');
                }
            }
            if (drugDisplayValue) {
                drugDisplayValue.textContent = sourceData.cooldowns.drug > 0 ? 'Active' : 'Ready';
                if (sourceData.cooldowns.drug === 0) drugDisplayValue.classList.add('flashing');
                else drugDisplayValue.classList.remove('flashing');
                 if (drugTimerDisplay) {
                     if (sourceData.cooldowns.drug === 0) drugTimerDisplay.classList.add('flashing');
                     else drugTimerDisplay.classList.remove('flashing');
                }
            }
        } else { // Fallback for cooldowns
            if (boosterDisplayValue) { boosterDisplayValue.textContent = 'N/A'; boosterDisplayValue.classList.remove('flashing'); if (boosterTimerDisplay) boosterTimerDisplay.classList.remove('flashing'); }
            if (medicalDisplayValue) { medicalDisplayValue.textContent = 'N/A'; medicalDisplayValue.classList.remove('flashing'); if (medicalTimerDisplay) medicalTimerDisplay.classList.remove('flashing');}
            if (drugDisplayValue) { drugDisplayValue.textContent = 'N/A'; drugDisplayValue.classList.remove('flashing'); if (drugTimerDisplay) drugTimerDisplay.classList.remove('flashing'); }
        }

        // Update refills status
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
        } else { // Fallback for refills
            if (energyRefillStatus) energyRefillStatus.textContent = 'N/A';
            if (nerveRefillStatus) nerveRefillStatus.textContent = 'N/A';
            if (tokenRefillStatus) tokenRefillStatus.textContent = 'N/A';
        }
        console.log('[TRACE] updateDisplay: Finished.');
    }

    /**
     * Updates the travel status display section.
     * @param {object|null} travelData - The travel object from API response, or null.
     */
    function updateTravelDisplay(travelData) {
        if (!travelStatusDiv || !travelLabelElement || !travelDestinationValue || !travelTimerDisplay) return;

        // Use current travelData if provided, otherwise fallback to last known good travel data
        const currentTravelData = travelData || (lastGoodPrimaryData ? lastGoodPrimaryData.travel : null);

        // Clear any existing "arrival flash" timeout and class
        if (intervals.travelEndFlashTimeout) {
            clearTimeout(intervals.travelEndFlashTimeout);
            intervals.travelEndFlashTimeout = null;
        }
        travelLabelElement.classList.remove('label-flash-red');

        if (currentTravelData && currentTravelData.time_left > 0) { // Currently traveling
            travelStatusDiv.style.display = 'block';
            travelDestinationValue.textContent = currentTravelData.destination || "Unknown";
            travelTimerDisplay.textContent = formatSecondsToHMS(currentTravelData.time_left);
            travelTimerDisplay.dataset.tooltipContent = `Arriving in ${currentTravelData.destination || "Unknown"}`;
            travelTimerDisplay.classList.remove('soon'); // Remove 'soon' class if previously set
        } else { // Not traveling or travel data unavailable
            // Only hide the section if it's not currently in the "arrival flash" state
            if (!travelLabelElement.classList.contains('label-flash-red')) {
                travelStatusDiv.style.display = 'none';
            }
            // Clear travel timer if it was running
            if (intervals.travel) {
                clearTimeout(intervals.travel);
                intervals.travel = null;
            }
        }
    }

    /**
     * Updates the race status display section.
     * @param {object|null} raceData - The race data object from API, or null.
     */
    function updateRaceDisplay(raceData) {
        if (!raceStatusDiv || !raceLabelElement || !raceInfoValue || !raceTimerDisplay) return;
        const currentTimestamp = Math.floor(Date.now() / 1000);

        // Use current raceData or fallback to last known good race data
        const currentRaceDataToDisplay = raceData || lastGoodRaceData;

        // Clear any existing "race end flash" timeout and class
        if (intervals.raceEndFlashTimeout) {
            clearTimeout(intervals.raceEndFlashTimeout);
            intervals.raceEndFlashTimeout = null;
        }
        raceLabelElement.classList.remove('label-flash-red');

        if (currentRaceDataToDisplay && currentRaceDataToDisplay.races && currentRaceDataToDisplay.races.length > 0) {
            const race = currentRaceDataToDisplay.races[0]; // Get the latest race
            // Check if race is scheduled, starting, or active/in_progress
            if (race.status === "starting" || race.status === "active" || race.status === "in_progress" || (race.status === "scheduled" && race.schedule.start > currentTimestamp)) {
                raceStatusDiv.style.display = 'block';
                let infoText = `Track: ${race.track_id}`; // Default info
                let timerValue = '--:--:--';
                let tooltip = `Race: ${race.title}`;
                raceTimerDisplay.classList.remove('soon');

                if (race.status === "starting" || (race.status === "scheduled" && race.schedule.start > currentTimestamp)) { // Race is upcoming
                    const timeToStart = race.schedule.start - currentTimestamp;
                    if (timeToStart > 0) {
                        timerValue = formatSecondsToHMS(timeToStart);
                        infoText = `Starts in:`;
                        tooltip += `\nStarts: ${new Date(race.schedule.start * 1000).toLocaleTimeString()}`;
                    } else { // Race should be starting now or is already in progress (API lag)
                        infoText = (race.status === "in_progress" ? "In Progress" : "Active");
                        timerValue = "Ongoing";
                        tooltip += `\nStatus: ${race.status}`;
                    }
                } else if (race.status === "active" || race.status === "in_progress") { // Race is currently active
                    infoText = race.status === "in_progress" ? "In Progress" : "Active";
                    const timeToEnd = race.schedule.end - currentTimestamp;
                    timerValue = timeToEnd > 0 ? formatSecondsToHMS(timeToEnd) : "Ending soon";
                    tooltip += `\nEnds: ${new Date(race.schedule.end * 1000).toLocaleTimeString()}`;
                }

                raceInfoValue.textContent = infoText;
                raceTimerDisplay.textContent = timerValue;
                raceTimerDisplay.dataset.tooltipContent = tooltip;
                return; // Race display is active, exit function
            }
        }
        // If no active/upcoming race, hide the section (unless it's flashing for a recent end)
        if (!raceLabelElement.classList.contains('label-flash-red')) {
            raceStatusDiv.style.display = 'none';
        }
        // Clear race timer if it was running
        if (intervals.race) {
            clearTimeout(intervals.race);
            intervals.race = null;
        }
    }

    /**
     * Starts or updates all countdown timers based on the fetched data.
     * @param {object} data - The primary user data from API.
     */
    function startTimers(data) {
        console.log('[TRACE] startTimers called with data:', data);
        // Clear existing timers (except update and newDay, which are intervals)
        const nonRaceTravelTimerKeys = ['energy', 'nerve', 'happiness', 'booster', 'medical', 'drug']; // Removed 'newDay' as it's an interval
        nonRaceTravelTimerKeys.forEach(key => {
            if (intervals[key]) {
                clearTimeout(intervals[key]);
                intervals[key] = null;
            }
        });
        // newDay is an interval, clear it specifically if needed (done at start of startNewDayTimer)

        // Start timers for energy, nerve, happiness
        if (data.energy && typeof data.energy.fulltime !== 'undefined' && energyTimerDisplay) updateTimer('energy', data.energy.fulltime, energyTimerDisplay, 0); else if (energyTimerDisplay) { energyTimerDisplay.textContent = "N/A"; energyTimerDisplay.classList.remove('full') }
        if (data.nerve && typeof data.nerve.fulltime !== 'undefined' && nerveTimerDisplay) updateTimer('nerve', data.nerve.fulltime, nerveTimerDisplay, 0); else if (nerveTimerDisplay) { nerveTimerDisplay.textContent = "N/A"; nerveTimerDisplay.classList.remove('full') }
        if (data.happy && typeof data.happy.fulltime !== 'undefined' && happinessTimerDisplay) updateTimer('happiness', data.happy.fulltime, happinessTimerDisplay, 0); else if (happinessTimerDisplay) { happinessTimerDisplay.textContent = "N/A"; happinessTimerDisplay.classList.remove('full') }

        // Start timers for cooldowns (booster, medical, drug)
        if (data.cooldowns) {
            if (typeof data.cooldowns.booster !== 'undefined' && boosterTimerDisplay) {
                if (data.cooldowns.booster > 0) { // Cooldown active
                    updateTimer('booster', data.cooldowns.booster, boosterTimerDisplay, userMaxBoosterCooldownSeconds);
                } else { // Cooldown ready
                    boosterTimerDisplay.textContent = formatSecondsToHMS(userMaxBoosterCooldownSeconds); // Show max duration
                    boosterTimerDisplay.classList.add('full', 'flashing');
                    if (boosterDisplayValue) boosterDisplayValue.classList.add('flashing');
                    boosterTimerDisplay.dataset.tooltipContent = `Ready\nMax Duration: ${formatSecondsToHMS(userMaxBoosterCooldownSeconds)}`;
                }
            } else if (boosterTimerDisplay) { // Data missing
                boosterTimerDisplay.textContent = "N/A";
                boosterTimerDisplay.classList.remove('full', 'flashing');
                if (boosterDisplayValue) boosterDisplayValue.classList.remove('flashing');
                boosterTimerDisplay.dataset.tooltipContent = "Booster: N/A";
            }

            if (typeof data.cooldowns.medical !== 'undefined' && medicalTimerDisplay) {
                if (data.cooldowns.medical > 0) {
                    updateTimer('medical', data.cooldowns.medical, medicalTimerDisplay, userMaxMedicalCooldownSeconds);
                } else {
                    medicalTimerDisplay.textContent = formatSecondsToHMS(userMaxMedicalCooldownSeconds);
                    medicalTimerDisplay.classList.add('full', 'flashing');
                    if(medicalDisplayValue) medicalDisplayValue.classList.add('flashing');
                    medicalTimerDisplay.dataset.tooltipContent = `Ready\nMax Duration: ${formatSecondsToHMS(userMaxMedicalCooldownSeconds)}`;
                }
            } else if (medicalTimerDisplay) {
                medicalTimerDisplay.textContent = "N/A";
                medicalTimerDisplay.classList.remove('full', 'flashing');
                if (medicalDisplayValue) medicalDisplayValue.classList.remove('flashing');
                medicalTimerDisplay.dataset.tooltipContent = "Medical: N/A";
            }

            if (typeof data.cooldowns.drug !== 'undefined' && drugTimerDisplay) {
                if (data.cooldowns.drug > 0) {
                    updateTimer('drug', data.cooldowns.drug, drugTimerDisplay, 0); // Max cooldown for drug is not typically displayed like booster/medical
                } else {
                    drugTimerDisplay.textContent = 'Ready';
                    drugTimerDisplay.classList.add('full', 'flashing');
                    if (drugDisplayValue) drugDisplayValue.classList.add('flashing');
                    drugTimerDisplay.dataset.tooltipContent = `Ready`;
                }
            } else if (drugTimerDisplay) {
                drugTimerDisplay.textContent = "N/A";
                drugTimerDisplay.classList.remove('full', 'flashing');
                if (drugDisplayValue) drugDisplayValue.classList.remove('flashing');
                drugTimerDisplay.dataset.tooltipContent = "Drug: N/A";
            }
        }
        // Start/Restart other timers
        startNewDayTimer(); // This is an interval, handles its own clearing
        startTravelTimer(data.travel); // This is a timeout-based chain
        // Race timer is started/updated via updateRaceDisplay which is called from fetchData
        console.log('[TRACE] startTimers: Finished.');
    }

    /**
     * Starts or updates the travel timer.
     * @param {object|null} travelData - The travel object from API.
     */
    function startTravelTimer(travelData) {
        if (intervals.travel) clearTimeout(intervals.travel); // Clear existing travel timeout
        // Clear "arrival flash" if it's running
        if (intervals.travelEndFlashTimeout) {
            clearTimeout(intervals.travelEndFlashTimeout);
            intervals.travelEndFlashTimeout = null;
            if (travelLabelElement) travelLabelElement.classList.remove('label-flash-red');
        }

        const currentTravelData = travelData || (lastGoodPrimaryData ? lastGoodPrimaryData.travel : null);

        if (!travelTimerDisplay || !currentTravelData || currentTravelData.time_left <= 0) {
            // Not traveling or data missing, ensure section is hidden (if not flashing arrival)
            if (travelStatusDiv && !(travelLabelElement && travelLabelElement.classList.contains('label-flash-red'))) {
                travelStatusDiv.style.display = 'none';
            }
            return; // No active travel to time
        }

        let secondsRemaining = currentTravelData.time_left;
        travelStatusDiv.style.display = 'block'; // Ensure travel section is visible
        if (travelLabelElement) travelLabelElement.classList.remove('label-flash-red'); // Remove flash if it was on

        function tick() {
            if (secondsRemaining <= 0) { // Arrived
                travelTimerDisplay.textContent = "Arrived!";
                travelTimerDisplay.classList.remove('soon');
                travelDestinationValue.textContent = currentTravelData.destination || "Destination";
                if (travelLabelElement) travelLabelElement.classList.add('label-flash-red'); // Flash label
                intervals.travel = null; // Clear timer ID

                // Set a timeout to stop flashing and hide the section
                if (intervals.travelEndFlashTimeout) clearTimeout(intervals.travelEndFlashTimeout);
                intervals.travelEndFlashTimeout = setTimeout(() => {
                    if (travelLabelElement) travelLabelElement.classList.remove('label-flash-red');
                    if (travelStatusDiv) travelStatusDiv.style.display = 'none'; // Hide after flashing
                    resizeWindowToContent(); // Resize after hiding
                }, 10000); // Flash for 10 seconds
            } else { // Still traveling
                travelTimerDisplay.textContent = formatSecondsToHMS(secondsRemaining);
                travelDestinationValue.textContent = currentTravelData.destination || "Destination";
                const arrivalDate = new Date((Math.floor(Date.now() / 1000) + secondsRemaining) * 1000);
                travelTimerDisplay.dataset.tooltipContent = `Arriving in ${currentTravelData.destination || "Unknown"} at ${arrivalDate.toLocaleTimeString()}`;

                if (secondsRemaining <= 60) travelTimerDisplay.classList.add('soon'); // Add 'soon' class if <1 min
                else travelTimerDisplay.classList.remove('soon');

                secondsRemaining--;
                intervals.travel = setTimeout(tick, 1000); // Continue countdown
            }
        }
        tick(); // Start the countdown
    }

    /**
     * Starts or updates the race timer.
     * @param {object|null} raceData - The race data object from API.
     */
    function startRaceTimer(raceData) {
        if (intervals.race) clearTimeout(intervals.race); // Clear existing race timeout
        // Clear "race end flash" if it's running
        if (intervals.raceEndFlashTimeout) {
            clearTimeout(intervals.raceEndFlashTimeout);
            intervals.raceEndFlashTimeout = null;
            if (raceLabelElement) raceLabelElement.classList.remove('label-flash-red');
        }

        const currentRaceDataToDisplay = raceData || lastGoodRaceData;

        if (!raceTimerDisplay || !currentRaceDataToDisplay || !currentRaceDataToDisplay.races || currentRaceDataToDisplay.races.length === 0) {
            // No race data, ensure section is hidden (if not flashing end)
            if (raceStatusDiv && !(raceLabelElement && raceLabelElement.classList.contains('label-flash-red'))) {
                raceStatusDiv.style.display = 'none';
            }
            return; // No race to time
        }

        const race = currentRaceDataToDisplay.races[0]; // Assuming latest race is first
        const currentTimestamp = Math.floor(Date.now() / 1000);
        let secondsRemaining = 0;
        let raceState = "none"; // Possible states: "starting", "active_ending", "none"

        // Determine race state and time remaining
        if (race.status === "starting" || (race.status === "scheduled" && race.schedule.start > currentTimestamp)) {
            secondsRemaining = race.schedule.start - currentTimestamp;
            raceState = "starting";
        } else if (race.status === "active" || race.status === "in_progress") {
            secondsRemaining = race.schedule.end - currentTimestamp;
            raceState = "active_ending";
        }

        if (raceState === "none" || secondsRemaining < 0) { // Race is over or not in a state to be timed
            if (race.status === "finished" || race.status === "ended" || (race.status === "scheduled" && race.schedule.start <= currentTimestamp && race.schedule.end <= currentTimestamp) ) {
                 if (raceStatusDiv && !(raceLabelElement && raceLabelElement.classList.contains('label-flash-red'))) {
                    raceStatusDiv.style.display = 'none';
                }
            } else if (raceStatusDiv && !(raceLabelElement && raceLabelElement.classList.contains('label-flash-red'))) {
                 raceStatusDiv.style.display = 'none';
            }
            return;
        }

        raceStatusDiv.style.display = 'block'; // Show race section
        if (raceLabelElement) raceLabelElement.classList.remove('label-flash-red'); // Remove flash if it was on

        function tick() {
            if (secondsRemaining <= 0) { // Timer reached zero
                intervals.race = null; // Clear timer ID
                if (raceState === "starting") { // Race was starting, now likely active
                    // fetchData will update this more accurately soon
                    raceInfoValue.textContent = (race.status === "in_progress" ? "In Progress" : "Active"); // Tentative display
                    raceTimerDisplay.textContent = "Ongoing";
                    raceTimerDisplay.dataset.tooltipContent = `Race: ${race.title}\nStatus: ${race.status}`;
                    // No flashing here, this is a transition, not an "end" event for this timer part
                } else if (raceState === "active_ending") { // Race was active, now finished
                    raceInfoValue.textContent = "Finished!";
                    raceTimerDisplay.textContent = "--:--:--";
                    raceTimerDisplay.dataset.tooltipContent = `Race: ${race.title}\nStatus: Finished`;
                    if (raceLabelElement) raceLabelElement.classList.add('label-flash-red'); // Flash label

                    // Set a timeout to stop flashing and hide the section
                    if (intervals.raceEndFlashTimeout) clearTimeout(intervals.raceEndFlashTimeout);
                    intervals.raceEndFlashTimeout = setTimeout(() => {
                        if (raceLabelElement) raceLabelElement.classList.remove('label-flash-red');
                        if (raceStatusDiv) raceStatusDiv.style.display = 'none';
                        resizeWindowToContent();
                    }, 10000); // Flash for 10 seconds
                }
                return; // Stop countdown
            }

            // Update timer display and tooltip
            raceTimerDisplay.textContent = formatSecondsToHMS(secondsRemaining);
            if (raceState === "starting") {
                raceInfoValue.textContent = "Starts in:";
                raceTimerDisplay.dataset.tooltipContent = `Race: ${race.title}\nStarts at: ${new Date(race.schedule.start * 1000).toLocaleTimeString()}`;
            } else if (raceState === "active_ending") {
                raceInfoValue.textContent = race.status === "in_progress" ? "In Progress" : "Active"; // Keep label consistent
                raceTimerDisplay.dataset.tooltipContent = `Race: ${race.title}\nEnds at: ${new Date(race.schedule.end * 1000).toLocaleTimeString()}`;
            }

            if (secondsRemaining <= 60) raceTimerDisplay.classList.add('soon'); // Add 'soon' class if <1 min
            else raceTimerDisplay.classList.remove('soon');

            secondsRemaining--;
            intervals.race = setTimeout(tick, 1000); // Continue countdown
        }
        tick(); // Start the countdown
    }

    /**
     * Starts the timer that counts down to the next Torn new day (UTC midnight).
     * Also handles flashing for refills if new day is approaching.
     */
    function startNewDayTimer() {
        if (intervals.newDay) clearInterval(intervals.newDay); // Clear existing interval
        if (!newDayTimerDisplay) return;

        function update() {
            const now = new Date();
            // Calculate UTC midnight for the *next* day
            const tomorrowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
            const diffSeconds = Math.floor((tomorrowUTC.getTime() - now.getTime()) / 1000);
            const isWarningPeriod = diffSeconds < 3600 && diffSeconds >= 0; // Warning period: last hour before new day

            // Style new day timer if in warning period
            if (isWarningPeriod) newDayTimerDisplay.classList.add('new-day-warning');
            else newDayTimerDisplay.classList.remove('new-day-warning');
            newDayTimerDisplay.textContent = formatSecondsToHMS(diffSeconds >= 0 ? diffSeconds : 0);

            // Handle flashing for ready refills during warning period
            let newDayShouldFlashOverall = false;
            [energyRefillStatus, nerveRefillStatus, tokenRefillStatus].forEach(refillStatusEl => {
                if (refillStatusEl) {
                    if (isWarningPeriod && refillStatusEl.textContent === 'Ready') {
                        refillStatusEl.classList.add('flashing');
                        newDayShouldFlashOverall = true;
                    } else {
                        refillStatusEl.classList.remove('flashing');
                    }
                }
            });

            if (newDayShouldFlashOverall && isWarningPeriod) newDayTimerDisplay.classList.add('flashing');
            else newDayTimerDisplay.classList.remove('flashing');
        }
        update(); // Initial call
        intervals.newDay = setInterval(update, 1000); // Update every second
    }

    /**
     * Generic function to update a countdown timer display.
     * @param {string} barName - The name of the bar/cooldown (e.g., 'energy', 'booster').
     * @param {number} initialSecondsRemaining - Seconds remaining for the timer.
     * @param {HTMLElement} displayElement - The DOM element to update with the timer.
     * @param {number} maxCooldownSeconds - Max duration for cooldowns (booster/medical) to display when ready.
     */
    function updateTimer(barName, initialSecondsRemaining, displayElement, maxCooldownSeconds) {
        if (!displayElement) return;
        if (intervals[barName]) clearTimeout(intervals[barName]); // Clear existing timeout for this bar

        let secondsRemaining = Number(initialSecondsRemaining);
        if (isNaN(secondsRemaining)) { // Handle invalid input
            displayElement.textContent = "Error";
            displayElement.classList.remove('full', 'flashing');
            // Clear flashing for associated value display if it's a cooldown
            if (barName === 'booster' && boosterDisplayValue) boosterDisplayValue.classList.remove('flashing');
            if (barName === 'medical' && medicalDisplayValue) medicalDisplayValue.classList.remove('flashing');
            if (barName === 'drug' && drugDisplayValue) drugDisplayValue.classList.remove('flashing');
            displayElement.dataset.tooltipContent = "Error";
            intervals[barName] = null;
            return;
        }

        let valueDisplayElement = null; // Corresponding value element (e.g., boosterDisplayValue)
        if (barName === 'booster') valueDisplayElement = boosterDisplayValue;
        else if (barName === 'medical') valueDisplayElement = medicalDisplayValue;
        else if (barName === 'drug') valueDisplayElement = drugDisplayValue;

        function tick() {
            let currentTooltipText = '';
            const now = Date.now(); // For calculating end timestamp in tooltip

            if (secondsRemaining <= 0) { // Timer reached zero
                displayElement.classList.add('full'); // Mark as full/ready
                intervals[barName] = null; // Clear timer ID

                if ((barName === 'booster' || barName === 'medical' || barName === 'drug')) {
                    if (valueDisplayElement) valueDisplayElement.textContent = 'Ready';
                    // Flash when ready for these cooldowns
                    if (valueDisplayElement) valueDisplayElement.classList.add('flashing');
                    displayElement.classList.add('flashing');
                }

                // Set display text and tooltip for ready/full state
                if ((barName === 'booster' || barName === 'medical') && maxCooldownSeconds > 0) {
                    displayElement.textContent = formatSecondsToHMS(maxCooldownSeconds); // Show max duration
                    currentTooltipText = `Ready\nMax Duration: ${formatSecondsToHMS(maxCooldownSeconds)}`;
                } else if (barName === 'drug') {
                    displayElement.textContent = "Ready";
                    currentTooltipText = `Ready`;
                } else { // For energy, nerve, happy
                    displayElement.textContent = "Full";
                    currentTooltipText = `Full`;
                }
                displayElement.dataset.tooltipContent = currentTooltipText;

            } else { // Timer still running
                displayElement.classList.remove('full', 'flashing'); // Not full/ready, so remove flashing
                if (valueDisplayElement) valueDisplayElement.classList.remove('flashing');
                if (valueDisplayElement && (barName === 'booster' || barName === 'medical' || barName === 'drug')) {
                    valueDisplayElement.textContent = 'Active'; // Set value display to 'Active'
                }

                const endsTimestamp = new Date(now + secondsRemaining * 1000).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' });

                // Set display text and tooltip for active state
                if ((barName === 'booster' || barName === 'medical') && maxCooldownSeconds > 0) {
                    displayElement.textContent = formatSecondsToHMS(secondsRemaining);
                    currentTooltipText = `Ends: ${endsTimestamp}\nRemaining: ${formatSecondsToHMS(secondsRemaining)}`;
                } else if (barName === 'drug') {
                    displayElement.textContent = formatSecondsToHMS(secondsRemaining);
                    currentTooltipText = `Ends: ${endsTimestamp}\n(Drug active)`;
                } else { // For energy, nerve, happy
                    displayElement.textContent = formatSecondsToHMS(secondsRemaining);
                    currentTooltipText = `Full at: ${endsTimestamp}`;
                }
                displayElement.dataset.tooltipContent = currentTooltipText;
                secondsRemaining--;
                intervals[barName] = setTimeout(tick, 1000); // Continue countdown
            }
        }
        tick(); // Start the countdown
    }

    /**
     * Clears all active timers and resets displayed data to defaults.
     * Typically used when API key is cleared or becomes invalid.
     */
    function clearAllTimers() {
        console.log('[TRACE] clearAllTimers called.');
        // Clear all intervals and timeouts
        Object.keys(intervals).forEach(key => {
            if (intervals[key]) {
                if (key === 'update' || key === 'newDay') clearInterval(intervals[key]);
                else clearTimeout(intervals[key]);
                intervals[key] = null;
            }
        });
        lastGoodPrimaryData = null; // Clear cached data
        lastGoodRaceData = null;

        // Remove flashing classes from relevant elements
        const elementsToClearFlash = [
            energyRefillStatus, nerveRefillStatus, tokenRefillStatus, newDayTimerDisplay,
            boosterDisplayValue, boosterTimerDisplay, medicalDisplayValue, medicalTimerDisplay,
            drugDisplayValue, drugTimerDisplay, travelTimerDisplay, raceTimerDisplay,
            travelLabelElement, raceLabelElement
        ];
        elementsToClearFlash.forEach(el => {
            if (el) el.classList.remove('flashing', 'new-day-warning', 'soon', 'label-flash-red');
        });

        // Reset text content of timers and value displays
        const timersToResetText = [
            energyTimerDisplay, nerveTimerDisplay, happinessTimerDisplay,
            boosterTimerDisplay, medicalTimerDisplay, drugTimerDisplay,
            newDayTimerDisplay, travelTimerDisplay, raceTimerDisplay
        ];
        timersToResetText.forEach(timer => {
            if (timer) { timer.textContent = '--:--:--'; if (timer.classList) timer.classList.remove('full'); if (timer.dataset) timer.dataset.tooltipContent = ""; }
        });

        // Reset main value displays
        if (lifeDisplayValue) lifeDisplayValue.textContent = '--/--';
        if (healthBarFillDisplay) healthBarFillDisplay.style.width = '0%';
        if (energyDisplayValue) energyDisplayValue.textContent = '--/--';
        if (nerveDisplayValue) nerveDisplayValue.textContent = '--/--';
        if (happinessDisplayValue) happinessDisplayValue.textContent = '--/--';
        if (boosterDisplayValue) boosterDisplayValue.textContent = '--';
        if (medicalDisplayValue) medicalDisplayValue.textContent = '--';
        if (drugDisplayValue) drugDisplayValue.textContent = '--';

        // Reset notification displays
        if (messagesIconDisplay) messagesIconDisplay.innerHTML = mailIconSVG;
        if (messagesCountDisplay) { messagesCountDisplay.textContent = '--'; messagesIconDisplay.className = 'notification-icon messages-icon green'; messagesCountDisplay.className = 'notification-count messages-count green'; }
        if (eventsIconDisplay) eventsIconDisplay.innerHTML = eventIconSVG;
        if (eventsCountDisplay) { eventsCountDisplay.textContent = '--'; eventsIconDisplay.className = 'notification-icon events-icon green'; eventsCountDisplay.className = 'notification-count events-count green'; }

        // Reset refill displays
        if (energyRefillStatus) energyRefillStatus.textContent = '--';
        if (nerveRefillStatus) nerveRefillStatus.textContent = '--';
        if (tokenRefillStatus) tokenRefillStatus.textContent = '--';

        // Reset travel and race specific displays
        if (travelDestinationValue) travelDestinationValue.textContent = '--';
        if (raceInfoValue) raceInfoValue.textContent = '--';
        if (travelStatusDiv) travelStatusDiv.style.display = 'none';
        if (raceStatusDiv) raceStatusDiv.style.display = 'none';
    }

    /**
     * Clears only the data display timers (not the main update interval or new day timer).
     * Used when API key becomes invalid during an update cycle but before full clearAllTimers.
     */
    function clearDataDisplayTimers() {
        const dataTimerKeys = ['energy', 'nerve', 'happiness', 'booster', 'medical', 'drug', 'travel', 'race', 'travelEndFlashTimeout', 'raceEndFlashTimeout'];
        dataTimerKeys.forEach(key => {
            if (intervals[key]) {
                clearTimeout(intervals[key]);
                intervals[key] = null;
            }
        });
        // Clear flashing from specific elements related to these timers
        const elementsToClearFlash = [
            boosterDisplayValue, boosterTimerDisplay, medicalDisplayValue, medicalTimerDisplay,
            drugDisplayValue, drugTimerDisplay, travelTimerDisplay, raceTimerDisplay,
            travelLabelElement, raceLabelElement
        ];
        elementsToClearFlash.forEach(el => {
            if (el) el.classList.remove('flashing', 'soon', 'label-flash-red');
        });

        const timersToResetText = [
            energyTimerDisplay, nerveTimerDisplay, happinessTimerDisplay,
            boosterTimerDisplay, medicalTimerDisplay, drugTimerDisplay,
            travelTimerDisplay, raceTimerDisplay
        ];
        timersToResetText.forEach(timer => {
            if (timer) { timer.textContent = '--:--:--'; if (timer.classList) timer.classList.remove('full'); if (timer.dataset) timer.dataset.tooltipContent = ""; }
        });

        // Hide travel/race sections if API key is gone or there's an error, and not currently flashing an end event
        if (travelStatusDiv && (!apiKey || (travelErrorDiv && travelErrorDiv.textContent)) && !(travelLabelElement && travelLabelElement.classList.contains('label-flash-red'))) {
            travelStatusDiv.style.display = 'none';
        }
        if (raceStatusDiv && (!apiKey || (raceErrorDiv && raceErrorDiv.textContent)) && !(raceLabelElement && raceLabelElement.classList.contains('label-flash-red'))) {
            raceStatusDiv.style.display = 'none';
        }
    }

    /**
     * Clears error messages from the UI.
     * @param {string} type - 'all', 'primary', or 'race' to specify which errors to clear.
     */
    function clearErrorMessages(type = 'all') {
        if (type === 'all' || type === 'primary') {
            const apiErrorMainDiv = apiSetupDiv ? apiSetupDiv.querySelector('.api-error-main') : null;
            const settingsApiErrorDiv = settingsPanel ? settingsPanel.querySelector('.api-error-settings') : null;
            const statusErrDiv = guiContainer ? guiContainer.querySelector('.status-error') : null;
            if (apiErrorMainDiv) apiErrorMainDiv.textContent = '';
            if (settingsApiErrorDiv) settingsApiErrorDiv.textContent = '';
            if (statusErrDiv) statusErrDiv.textContent = '';
        }
        if (type === 'all' || type === 'race') {
            if (raceErrorDiv) raceErrorDiv.textContent = '';
        }
    }

    /**
     * Toggles the minimized state of the widget.
     */
    async function toggleMinimize() {
        if (!store) { console.error('[TRACE] toggleMinimize: Store not available.'); return; }
        console.log('[TRACE] toggleMinimize called.');
        isMinimized = !isMinimized; // Toggle state
        if (guiContainer) guiContainer.classList.toggle('minimized', isMinimized);
        if (minimizeButton) {
            minimizeButton.textContent = isMinimized ? '□' : '−'; // Update button icon
            minimizeButton.title = isMinimized ? 'Maximize' : 'Minimize';
        }
        try {
            await store.set(GUI_MINIMIZED_STORAGE, isMinimized.toString()); // Persist state
            await store.save();
        } catch (e) {
            console.error('[TRACE] toggleMinimize: Error saving minimized state:', e);
        }

        // Adjust window size after toggling minimize state
        if (!isMinimized && settingsPanel && settingsPanel.style.display === 'flex') {
            // If un-minimizing and settings panel was open, resize carefully
            settingsPanel.style.display = 'none'; // Temporarily hide for correct sizing
            resizeWindowToContent();
            settingsPanel.style.display = 'flex'; // Show it again
            resizeWindowToContent();
        } else {
            resizeWindowToContent();
        }

        // Ensure correct view is shown if un-minimizing
        if (!isMinimized && apiKey && tosAccepted) {
            switchView(true);
        } else if (!isMinimized && (!apiKey || !tosAccepted)) {
            switchView(false);
        }
    }

    /**
     * Saves the API key entered by the user.
     * @param {HTMLInputElement} inputElement - The input field containing the API key.
     * @param {HTMLElement} errorElement - The DOM element to display errors.
     * @param {boolean} [fromSettings=false] - True if called from the settings panel.
     */
    async function saveApiKey(inputElement, errorElement, fromSettings = false) {
        if (!store) {
            console.error('[TRACE] saveApiKey: Store not available.');
            if (errorElement) errorElement.textContent = "Error: Settings store unavailable.";
            return;
        }
        console.log('[TRACE] saveApiKey called. From settings:', fromSettings);
        if (!inputElement || !errorElement) {
            console.error('[TRACE] saveApiKey: Missing inputElement or errorElement.');
            return;
        }
        const newKey = inputElement.value.trim();

        // If saving from main setup, ToS must be accepted
        if (!fromSettings && tosCheckbox && !tosCheckbox.checked) {
            errorElement.textContent = "Please accept the Terms of Service.";
            return;
        }

        if (newKey && /^[a-zA-Z0-9]{16}$/.test(newKey)) { // Validate API key format
            apiKey = newKey;
            console.log('[TRACE] saveApiKey: New API key set:', apiKey);
            try {
                await store.set(API_KEY_STORAGE, apiKey);
                if (!fromSettings) { // If from main setup, also save ToS acceptance
                    await store.set(TOS_ACCEPTED_STORAGE, 'true');
                    tosAccepted = true;
                    console.log('[TRACE] saveApiKey: ToS accepted and stored.');
                }
                await store.save(); // Persist changes
                console.log('[TRACE] saveApiKey: Store saved.');

                if (tosSection) tosSection.style.display = 'none'; // Hide ToS section after acceptance

                inputElement.value = ''; // Clear input field
                clearErrorMessages(); // Clear any previous errors
                switchView(true); // Switch to status view

                // Restart data fetching with new key
                if (intervals.update) clearInterval(intervals.update);
                fetchData(); // Fetch immediately
                intervals.update = setInterval(fetchData, UPDATE_INTERVAL_MS); // Resume polling

                if (fromSettings) toggleSettingsPanel(); // Close settings panel if saved from there
            } catch (e) {
                console.error('[TRACE] saveApiKey: Error saving API key or ToS to store:', e);
                if (errorElement) errorElement.textContent = "Error saving settings.";
            }
        } else {
            errorElement.textContent = "Invalid Key format (16 letters/numbers)";
        }
        if (!fromSettings) updateApiKeySaveButtonState(); // Update save button state for main setup
    }

    /**
     * Clears the stored API key and updates the UI.
     */
    async function promptClearApiKey() {
        if (!store) {
            console.error('[TRACE] promptClearApiKey: Store not available.');
             if (settingsApiError) settingsApiError.textContent = "Error: Settings store unavailable.";
            return;
        }
        console.log('[TRACE] promptClearApiKey called.');
        apiKey = null; // Clear local variable
        try {
            await store.delete(API_KEY_STORAGE); // Remove from store
            // Do NOT clear TOS_ACCEPTED_STORAGE here, user accepted it once.
            await store.save(); // Persist change
            console.log('[TRACE] promptClearApiKey: API key deleted from store.');

            if (intervals.update) { // Stop data fetching
                clearInterval(intervals.update);
                intervals.update = null;
            }
            clearAllTimers(); // Clear all displayed data and timers
            updateDisplay({ error: "API Key cleared. Enter a new key.", target: 'api_settings', isTransient: false });
            switchView(false); // Switch to API setup view

            if (settingsApiKeyInput) settingsApiKeyInput.value = ''; // Clear input in settings
            // Ensure settings panel is open if called from there (should always be the case)
            if (settingsPanel && settingsPanel.style.display !== 'flex') {
                 toggleSettingsPanel();
            }
            if (apiErrorMain) apiErrorMain.textContent = "API Key cleared. Enter a new key."; // Show on main setup if visible
        } catch (e) {
            console.error('[TRACE] promptClearApiKey: Error deleting API key from store:', e);
            if (settingsApiError) settingsApiError.textContent = "Error clearing key.";
        }
    }

    /**
     * Switches between the API setup view and the main status display view.
     * @param {boolean} showStatus - True to show status view, false for API setup view.
     */
    function switchView(showStatus) {
        console.log('[TRACE] switchView called. showStatus:', showStatus, 'apiKey:', !!apiKey, 'tosAccepted:', tosAccepted);
        // Ensure critical elements are cached before proceeding
        if (!apiSetupDiv || !notificationsDiv || !statusDiv || !refillsDiv || !guiContainer || !firstRunAutostartOptionDiv || !travelStatusDiv || !raceStatusDiv || !tosSection) {
            console.warn('[TRACE] switchView: One or more critical UI elements not found. This may be due to an earlier initialization error.');
            return;
        }

        if (showStatus && apiKey && tosAccepted) { // Show status view
            console.log('[TRACE] switchView: Showing status view.');
            notificationsDiv.style.setProperty('display', 'flex', 'important');
            statusDiv.style.setProperty('display', 'block', 'important');
            refillsDiv.style.setProperty('display', 'block', 'important');
            // Travel and Race divs are managed by their respective updateDisplay functions
            apiSetupDiv.style.setProperty('display', 'none', 'important');
            firstRunAutostartOptionDiv.style.display = 'none';
            tosSection.style.display = 'none';
        } else { // Show API setup view
            console.log('[TRACE] switchView: Showing API setup view.');
            apiSetupDiv.style.setProperty('display', 'block', 'important');
            notificationsDiv.style.setProperty('display', 'none', 'important');
            statusDiv.style.setProperty('display', 'none', 'important');
            refillsDiv.style.setProperty('display', 'none', 'important');
            travelStatusDiv.style.setProperty('display', 'none', 'important'); // Explicitly hide
            raceStatusDiv.style.setProperty('display', 'none', 'important');   // Explicitly hide

            if (!tosAccepted) tosSection.style.display = 'block'; // Show ToS if not accepted
            else tosSection.style.display = 'none';

            // Show autostart option on first run (no API key) only if ToS has been accepted
            firstRunAutostartOptionDiv.style.display = (!apiKey && tosAccepted) ? 'block' : 'none';
            updateApiKeySaveButtonState(); // Update save button based on current state
        }
        resizeWindowToContent(); // Adjust window size after view switch
    }

    // ===== Update Checking =====
    /**
     * Compares two version strings.
     * @param {string} latestVersionTag - e.g., "v1.2.3" or "1.2.3"
     * @param {string} currentVersion - e.g., "v1.2.0" or "1.2.0"
     * @returns {boolean} True if latestVersionTag is newer than currentVersion.
     */
    function isNewerVersion(latestVersionTag, currentVersion) {
        const latest = latestVersionTag.replace(/^v/, '').split('.').map(Number);
        const current = currentVersion.replace(/^v/, '').split('.').map(Number);

        for (let i = 0; i < Math.max(latest.length, current.length); i++) {
            const latestPart = latest[i] || 0; // Default to 0 if part doesn't exist
            const currentPart = current[i] || 0;
            if (latestPart > currentPart) return true;
            if (latestPart < currentPart) return false;
        }
        return false; // Versions are identical
    }

    /**
     * Checks for application updates from GitHub releases.
     */
    async function checkForUpdates() {
        console.log('[TRACE] checkForUpdates called.');
        try {
            const response = await fetch(GITHUB_RELEASES_API_URL);
            if (!response.ok) {
                console.error(`[TRACE] GitHub API error: ${response.status} when checking for updates.`);
                return;
            }
            const releaseData = await response.json();
            const latestVersionTag = releaseData.tag_name;
            console.log('[TRACE] checkForUpdates: Latest version tag from GitHub:', latestVersionTag);

            if (latestVersionTag && isNewerVersion(latestVersionTag, SCRIPT_VERSION)) {
                console.log('[TRACE] checkForUpdates: New version available!');
                if (updateNotificationElement) {
                    const updateLink = updateNotificationElement.querySelector('a');
                    if (updateLink) {
                        updateLink.href = GITHUB_RELEASES_PAGE_URL; // Link to releases page
                        updateLink.textContent = `Update to ${latestVersionTag} available!`;
                    }
                    updateNotificationElement.style.display = 'inline'; // Show notification
                    resizeWindowToContent(); // Adjust window size if notification changes height
                }
            } else {
                console.log('[TRACE] checkForUpdates: No new version or current is up to date.');
                if (updateNotificationElement) updateNotificationElement.style.display = 'none';
            }
        } catch (error) {
            console.error("[TRACE] Failed to check for updates:", error);
        }
    }

    // ===== Initialization Function =====
    async function init() {
        console.log('[TRACE] init: Starting initialization.');

        // Initialize tauri-plugin-store
        try {
            // Use the static Store.load() method to ensure the store is fully loaded
            // before any operations are attempted on it.
            store = await Store.load(STORE_FILE_NAME);
            console.log('[TRACE] init: Main store instance loaded via Store.load():', store, 'with path:', STORE_FILE_NAME);

            // Perform a quick integrity check on the store instance
            await store.set('__initialization_check__', true);
            const check = await store.get('__initialization_check__');
            if (check !== true) {
                throw new Error("Store integrity check failed after initialization (get returned unexpected value).");
            }
            await store.delete('__initialization_check__');
            await store.save(); // Ensure changes (like deleting the check key) are persisted
            console.log('[TRACE] init: Store integrity check passed.');

        } catch (e) {
            console.error('[TRACE] init: CRITICAL ERROR creating, loading, or verifying main store instance:', e);
            // Attempt to cache GUI elements if not done yet, to display the error
            if (!apiSetupDiv && typeof cacheGUIElements === 'function' && !guiContainer) cacheGUIElements();

            const errorMsg = `Critical Error: Settings store failed (${e.message || e}). App cannot function.`;
            if (apiErrorMain) { // apiErrorMain should be available after cacheGUIElements
                 apiErrorMain.textContent = errorMsg;
                 if(apiSetupDiv) apiSetupDiv.style.setProperty('display', 'block', 'important'); // Ensure setup view is visible for error
            } else if (document.body) { // Fallback if even apiSetupDiv isn't found
                 document.body.innerHTML = `<div style="color: red; padding: 20px; font-family: sans-serif; background: #333;">${errorMsg}</div>`;
            }
            // Attempt to resize to show the error, if resize function is available
            if (typeof resizeWindowToContent === 'function') resizeWindowToContent();
            return; // Stop further initialization if store is unusable
        }

        // Load initial values from the successfully initialized store
        try {
            console.log('[TRACE] init: Attempting to get initial keys from main store (post-init).');
            const initialMainKeys = await store.keys(); // Check current keys (optional debug)
            console.log('[TRACE] init: Initial keys from main store (post-init):', initialMainKeys);

            console.log('[TRACE] init: Attempting to get API_KEY_STORAGE');
            apiKey = await store.get(API_KEY_STORAGE); // Returns null if not found
            apiKey = apiKey || null; // Ensure it's explicitly null if undefined/empty
            console.log('[TRACE] init: API key from store:', apiKey ? '********' : null); // Don't log actual key

            console.log('[TRACE] init: Attempting to get GUI_MINIMIZED_STORAGE');
            const minimizedStr = await store.get(GUI_MINIMIZED_STORAGE);
            isMinimized = minimizedStr === 'true'; // Convert string to boolean
            console.log('[TRACE] init: isMinimized from store:', isMinimized, `(raw: "${minimizedStr}")`);

            console.log('[TRACE] init: Attempting to get TOS_ACCEPTED_STORAGE');
            const tosAcceptedStr = await store.get(TOS_ACCEPTED_STORAGE);
            tosAccepted = tosAcceptedStr === 'true';
            console.log('[TRACE] init: tosAccepted from store:', tosAccepted, `(raw: "${tosAcceptedStr}")`);

        } catch (e) {
            console.error('[TRACE] init: CRITICAL ERROR during initial store GET operations (post-init):', e);
            // Try to cache GUI elements if not done, to display the error
            if (!apiErrorMain && typeof cacheGUIElements === 'function' && !guiContainer) cacheGUIElements();
            
            if (apiErrorMain) {
                apiErrorMain.textContent = `Error accessing settings (${e.message || e}). Please restart.`;
                if(apiSetupDiv) apiSetupDiv.style.setProperty('display', 'block', 'important');
            }
            // Fallback values if store reading fails, allowing UI to at least load with defaults/errors
            apiKey = null;
            isMinimized = false;
            tosAccepted = false;
            // Do not return here; allow cacheGUIElements and other UI setup to proceed to show the error.
        }

        console.log('[TRACE] init: Caching GUI elements.');
        if (!cacheGUIElements()) { // If caching fails (e.g., guiContainer not found)
             console.error("[TRACE] init: cacheGUIElements failed. Aborting further initialization.");
             if (apiErrorMain && apiSetupDiv) { // Ensure error is visible if possible
                apiErrorMain.textContent = "Critical UI Error. Please restart the application.";
                apiSetupDiv.style.setProperty('display', 'block', 'important');
             }
             return; // Stop init if UI cannot be cached
        }
        
        // Initialize other application features that might depend on the store
        console.log('[TRACE] init: Initializing autostart.');
        await initializeAutostart();
        console.log('[TRACE] init: Initializing always on top.');
        await initializeAlwaysOnTop();
        console.log('[TRACE] init: Initializing link type settings.');
        await initializeLinkTypeSettings();
        
        console.log('[TRACE] init: Checking for updates.');
        checkForUpdates(); // Check for new versions in the background
        
        console.log('[TRACE] init: Running testStoreFunction for diagnostics.');
        await testStoreFunction(); // Run diagnostic store test

        if (!guiContainer) { // Double check guiContainer after caching (should be redundant but safe)
            console.error("[TRACE] init: guiContainer is null after cacheGUIElements. Aborting init.");
            return;
        }

        // Determine initial view based on API key and ToS status
        if (!apiKey || !tosAccepted) { // API key missing or ToS not accepted
            console.log('[TRACE] init: API key not found or ToS not accepted.');
            if (!isMinimized) { // If not minimized, show setup view
                console.log('[TRACE] init: Not minimized, switching to setup view.');
                switchView(false);
            } else { // If minimized, prepare setup view elements for when it's unminimized
                console.log('[TRACE] init: Minimized, but setup needed. Ensuring setup UI elements are ready for sizing if unminimized.');
                // Manually set display properties for elements that would be shown in setup view
                // This helps `resizeWindowToContent` calculate correctly if unminimized later.
                if (apiSetupDiv) apiSetupDiv.style.setProperty('display', 'block', 'important');
                if (notificationsDiv) notificationsDiv.style.setProperty('display', 'none', 'important');
                if (statusDiv) statusDiv.style.setProperty('display', 'none', 'important');
                if (refillsDiv) refillsDiv.style.setProperty('display', 'none', 'important');
                if (travelStatusDiv) travelStatusDiv.style.setProperty('display', 'none', 'important');
                if (raceStatusDiv) raceStatusDiv.style.setProperty('display', 'none', 'important');

                if (!tosAccepted && tosSection) tosSection.style.display = 'block';
                else if (tosSection) tosSection.style.display = 'none';
                if (firstRunAutostartOptionDiv) firstRunAutostartOptionDiv.style.display = (!apiKey && tosAccepted) ? 'block' : 'none';
            }
            if (!apiKey) { // If no API key, ensure all data timers are cleared
                console.log('[TRACE] init: No API key, clearing all timers.');
                clearAllTimers(); 
            }
            updateApiKeySaveButtonState(); // Update save button state for API setup
        }
        else { // API Key exists and ToS accepted: proceed to show status
            console.log('[TRACE] init: API key found and ToS accepted.');
            if (intervals.update) clearInterval(intervals.update); // Clear any existing update interval
            console.log('[TRACE] init: Performing initial data fetch.');
            fetchData(); // Fetch data immediately
            intervals.update = setInterval(fetchData, UPDATE_INTERVAL_MS); // Start polling for updates

            if (isMinimized) { // If minimized, prepare status view elements for when unminimized
                 console.log('[TRACE] init: Minimized, setup complete. Ensuring status UI elements are ready for sizing if unminimized.');
                // Manually set display for status view elements
                if (notificationsDiv) notificationsDiv.style.setProperty('display', 'flex', 'important');
                if (statusDiv) statusDiv.style.setProperty('display', 'block', 'important');
                if (refillsDiv) refillsDiv.style.setProperty('display', 'block', 'important');
                if (apiSetupDiv) apiSetupDiv.style.setProperty('display', 'none', 'important');
                if (firstRunAutostartOptionDiv) firstRunAutostartOptionDiv.style.display = 'none';
                if (tosSection) tosSection.style.display = 'none';
                // Travel/Race divs will be handled by their update functions called within fetchData
            } else {
                 // If not minimized, fetchData will call switchView(true) which handles display properties.
            }
        }

        console.log('[TRACE] init: Scheduling initial resize.');
        // Delay resize slightly to allow DOM to fully render and styles to apply
        setTimeout(resizeWindowToContent, 250); 
        console.log('[TRACE] init: Initialization finished.');
    }

    // ===== Entry Point =====
    // Ensure DOM is fully loaded before running initialization logic
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('[TRACE] DOM already complete/interactive, calling init.');
        init();
    } else {
        console.log('[TRACE] DOM not ready, adding DOMContentLoaded listener for init.');
        document.addEventListener('DOMContentLoaded', init);
    }
})();
