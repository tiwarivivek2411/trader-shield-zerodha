/**
 * TraderShield Page Script Interceptor
 * Injected in window context to intercept raw fetch API calls to Zerodha Kite servers
 */

(function () {
  console.log('🛡️ TraderShield API Network Interceptor Active');

  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const [resource, config] = args;

    // Check if this is an order placement request
    if (typeof resource === 'string' && (resource.includes('/orders/') || resource.includes('/orders'))) {
      if (config && config.method && config.method.toUpperCase() === 'POST' && config.body) {
        try {
          let bodyStr = config.body;
          if (typeof bodyStr !== 'string' && bodyStr instanceof FormData) {
            bodyStr = new URLSearchParams(bodyStr).toString();
          }

          // Check if payload contains tradingsymbol
          const params = new URLSearchParams(bodyStr);
          const symbol = params.get('tradingsymbol') || '';

          if (symbol) {
            // Check if symbol matches today's expiry
            const MONTH_MAP = { JAN:0, FEB:1, MAR:2, APR:3, MAY:4, JUN:5, JUL:6, AUG:7, SEP:8, OCT:9, NOV:10, DEC:11 };
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const istNow = new Date(utc + (3600000 * 5.5));

            const match = symbol.toUpperCase().match(/(\d{1,2})\s*([A-Z]{3})([0-9]{2})?/);
            if (match) {
              const day = parseInt(match[1], 10);
              const monthStr = match[2];
              const yearStr = match[3];

              if (MONTH_MAP.hasOwnProperty(monthStr)) {
                const month = MONTH_MAP[monthStr];
                let year = istNow.getFullYear();
                if (yearStr) year = 2000 + parseInt(yearStr, 10);

                if (
                  year === istNow.getFullYear() &&
                  month === istNow.getMonth() &&
                  day === istNow.getDate()
                ) {
                  console.error('🚫 TraderShield: Blocked 0-DTE Order API Request:', symbol);
                  alert(`🚫 TraderShield Alert: Order blocked! ${symbol} is a 0-DTE contract expiring today.`);
                  return Promise.reject(new Error('TraderShield: 0-DTE Order Execution Blocked'));
                }
              }
            }
          }
        } catch (e) {
          console.warn('TraderShield network interceptor error:', e);
        }
      }
    }

    return originalFetch.apply(this, args);
  };
})();
