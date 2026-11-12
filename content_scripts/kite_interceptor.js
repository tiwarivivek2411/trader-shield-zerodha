/**
 * TraderShield - Zerodha Kite Content Script Interceptor
 * Injected directly on kite.zerodha.com
 */

(function () {
  console.log('🛡️ TraderShield active on Zerodha Kite');

  // Inject page_interceptor.js into main window context to intercept fetch requests
  function injectPageScript() {
    try {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('content_scripts/page_interceptor.js');
      script.onload = () => script.remove();
      (document.head || document.documentElement).appendChild(script);
    } catch (e) {
      console.error('TraderShield: Failed to inject page script:', e);
    }
  }

  injectPageScript();

  // Load settings
  let settings = {
    blockFundsDuringMarketHours: true,
    blockZeroDteOptions: true
  };

  chrome.storage.sync.get(settings, (stored) => {
    settings = stored;
  });

  chrome.storage.onChanged.addListener((changes) => {
    for (let key in changes) {
      settings[key] = changes[key].newValue;
    }
  });

  // UI Banner Creator for 0-DTE Blocking
  function injectWarningBanner(containerEl, message) {
    let existingBanner = containerEl.querySelector('.tradershield-banner');
    if (!existingBanner) {
      const banner = document.createElement('div');
      banner.className = 'tradershield-banner';
      banner.style.cssText = `
        background-color: #ffebe9;
        border: 2px solid #ff4d4f;
        color: #cf1322;
        padding: 10px 14px;
        margin: 10px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 13px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 99999;
      `;
      banner.innerHTML = `🛡️ <strong>TraderShield Limiter Active</strong><br/>${message}`;
      containerEl.prepend(banner);
    }
  }

  // Modal Creator for Fund Addition Blocker
  function showFundBlockedModal() {
    let modal = document.getElementById('tradershield-fund-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'tradershield-fund-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.65);
        display: flex; align-items: center; justify-content: center;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      `;
      modal.innerHTML = `
        <div style="background: #ffffff; width: 420px; padding: 28px; border-radius: 12px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
          <div style="font-size: 48px; margin-bottom: 12px;">🔒</div>
          <h2 style="margin: 0 0 10px 0; color: #1f1f1f; font-size: 20px;">Fund Additions Blocked</h2>
          <p style="color: #595959; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
            Adding funds is disabled during trading hours (<strong>09:15 AM - 03:30 PM IST</strong>) by your TraderShield discipline rules. Take a break to prevent emotional re-funding!
          </p>
          <button id="tradershield-close-modal" style="
            background: #1890ff; color: #fff; border: none; padding: 10px 24px;
            font-size: 14px; font-weight: 600; border-radius: 6px; cursor: pointer;
          ">I Understand</button>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('tradershield-close-modal').onclick = () => {
        modal.style.display = 'none';
      };
    } else {
      modal.style.display = 'flex';
    }
  }

  // Main DOM Monitor using MutationObserver
  const observer = new MutationObserver(() => {
    const isMarket = isMarketHours();

    // 1. FUND ADDITION LIMITER
    if (settings.blockFundsDuringMarketHours && isMarket) {
      // Find all fund links and buttons
      const fundElements = document.querySelectorAll(
        'a[href*="/funds"], button.add-funds, .add-funds, button:contains("Add funds")'
      );

      fundElements.forEach(el => {
        if (!el.dataset.tradershieldHandled) {
          el.dataset.tradershieldHandled = "true";
          el.style.opacity = "0.4";
          el.style.cursor = "not-allowed";
          el.title = "Fund addition blocked during market hours by TraderShield";

          el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showFundBlockedModal();
            return false;
          }, true);
        }
      });
    }

    // 2. 0-DTE OPTION BLOCKER
    if (settings.blockZeroDteOptions) {
      const orderWindows = document.querySelectorAll('.order-window, .modal-wrapper');

      orderWindows.forEach(windowEl => {
        // Extract instrument symbol text from window header
        const symbolEl = windowEl.querySelector('.title, .tradingsymbol, .instrument-name, header');
        if (symbolEl) {
          const symbolText = symbolEl.innerText || symbolEl.textContent;
          const expiryInfo = parseExpiryDateFromSymbol(symbolText);

          if (expiryInfo.isZeroDte) {
            // It's a 0-DTE contract! Disable Buy/Sell buttons
            const submitButtons = windowEl.querySelectorAll('button[type="submit"], #buy-submit, #sell-submit, .button-blue, .button-orange');

            submitButtons.forEach(btn => {
              btn.disabled = true;
              btn.style.opacity = '0.3';
              btn.style.pointerEvents = 'none';
              btn.style.filter = 'grayscale(100%)';
            });

            injectWarningBanner(
              windowEl,
              `<strong>${expiryInfo.symbol}</strong> is a 0-DTE contract expiring today. Order execution is disabled.`
            );
          }
        }
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
