# 🛡️ TraderShield - Zerodha Kite Discipline Guard

**TraderShield** is a Chrome Extension (Manifest V3) overlay specifically engineered for **Zerodha Kite (`kite.zerodha.com`)**. It enforces strict behavioral discipline rules to eliminate emotional, impulse, and revenge trading.

---

## ✨ Features

### 1. 🔒 Market Hours Fund Addition Lock
- **Active Hours**: 09:15 AM to 03:30 PM IST (Monday - Friday).
- Automatically hides and disables all **"Add Funds"** buttons, links, and order window margin deposit popups on `kite.zerodha.com`.
- Displays a modal warning: `"Fund additions are disabled during trading hours to prevent emotional top-ups."`

### 2. 🚫 0-DTE (Same-Day Expiry) Option Blocker
- Automatically detects index and stock option contracts expiring today (e.g. NIFTY Thursday, BANKNIFTY Wednesday, SENSEX Friday).
- **DOM Protection**: Disables the **BUY** and **SELL** order submit buttons in the Zerodha Kite order slip and injects a prominent red warning banner.
- **Network Level Protection**: Overrides page `window.fetch` to intercept outgoing `/orders` POST requests to Zerodha servers, rejecting 0-DTE orders at the API network layer before transmission.

### 3. ⏱️ 12-Hour Anti-Tamper Cooldown Lock
- Prevents traders from turning off guardrails during emotional loss streaks.
- Activating the Cooldown Lock locks all settings for a mandatory **12-Hour Timer**.

---

## 🚀 How to Install in Chrome / Brave / Edge

1. Open your browser (Google Chrome, Brave, Microsoft Edge, or Opera).
2. Navigate to `chrome://extensions` (or `brave://extensions` / `edge://extensions`).
3. Toggle **Developer mode** in the top right corner.
4. Click **Load unpacked** in the top left.
5. Select the extension directory:
   `/Users/nileshtiwari/.gemini/antigravity/scratch/trader_shield_zerodha`
6. Pin the **TraderShield 🛡️** icon to your browser toolbar!

---

## 🧪 Testing & Verification

Run the automated test suite to verify symbol parsing and market hours logic:

```bash
cd /Users/nileshtiwari/.gemini/antigravity/scratch/trader_shield_zerodha
node tests/expiry_parser.test.js
```

### Verified Test Cases:
- `NIFTY 21SEP 24500 CE` on 21 Sep -> Blocked (0-DTE)
- `NIFTY 28SEP 24500 CE` on 21 Sep -> Allowed (Next week expiry)
- `BANKNIFTY 21SEP26 51000 PE` on 21 Sep -> Blocked (0-DTE)
- IST Market hours calculation (09:15 - 15:30 IST Mon-Fri).

---

## 📁 File Structure

```
trader_shield_zerodha/
├── manifest.json                # Manifest V3 Configuration
├── background.js                # Service worker for market state & storage
├── utils/
│   └── expiry_parser.js         # Symbol parsing & IST market time utility
├── content_scripts/
│   ├── kite_interceptor.js      # DOM observer & overlay UI script
│   └── page_interceptor.js      # Window fetch API network interceptor
├── popup/
│   ├── popup.html               # Popup dashboard HTML
│   ├── popup.css                # Popup CSS
│   └── popup.js                 # Live clock & status script
├── options/
│   ├── options.html             # Settings page HTML
│   ├── options.css              # Settings CSS
│   └── options.js               # Settings & 12h cooldown lock logic
├── tests/
│   └── expiry_parser.test.js    # Node unit tests
└── README.md                    # Documentation
```
