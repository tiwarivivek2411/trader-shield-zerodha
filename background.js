/**
 * TraderShield Background Service Worker
 */

importScripts('utils/expiry_parser.js');

// Default config
const DEFAULT_SETTINGS = {
  blockFundsDuringMarketHours: true,
  blockZeroDteOptions: true,
  enableAntiTamperLock: false,
  cooldownUntil: null, // Timestamp for 12-hour lock
  lockPin: null
};

// Initialize settings on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (stored) => {
    chrome.storage.sync.set(stored);
    console.log('🛡️ TraderShield initialized with settings:', stored);
  });
});

// Listener for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'GET_STATUS') {
    const isMarket = isMarketHours();
    chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
      sendResponse({
        isMarketHours: isMarket,
        settings: settings
      });
    });
    return true; // async response
  }

  if (message.action === 'UPDATE_SETTINGS') {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (currentSettings) => {
      // Check if cooldown lock is active
      const now = Date.now();
      if (currentSettings.cooldownUntil && now < currentSettings.cooldownUntil) {
        const remainingHours = Math.ceil((currentSettings.cooldownUntil - now) / (1000 * 3600));
        sendResponse({
          success: false,
          error: `🔒 Anti-Tamper Cooldown Active! You cannot disable guardrails for another ${remainingHours} hours.`
        });
        return;
      }

      chrome.storage.sync.set(message.newSettings, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (message.action === 'START_COOLDOWN') {
    const twelveHoursInMs = 12 * 60 * 60 * 1000;
    const cooldownUntil = Date.now() + twelveHoursInMs;
    chrome.storage.sync.set({ cooldownUntil }, () => {
      sendResponse({ success: true, cooldownUntil });
    });
    return true;
  }
});
