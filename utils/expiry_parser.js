/**
 * TraderShield - Zerodha Kite Expiry Parser & Market Hours Utility
 */

const MONTH_MAP = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
};

/**
 * Returns current date and time in Indian Standard Time (IST - UTC+5:30)
 */
function getISTDate(date = new Date()) {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 5.5));
}

/**
 * Checks if current time is within Indian Stock Market trading hours:
 * Monday to Friday, 09:15 AM to 03:30 PM IST (excluding weekend).
 */
function isMarketHours(now = getISTDate()) {
  const day = now.getDay();
  // Sunday = 0, Saturday = 6
  if (day === 0 || day === 6) return false;

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  const marketStart = 9 * 60 + 15; // 09:15 AM (555 mins)
  const marketEnd = 15 * 60 + 30;   // 03:30 PM (930 mins)

  return timeInMinutes >= marketStart && timeInMinutes <= marketEnd;
}

/**
 * Parses Zerodha Kite option trading symbol strings and determines if it expires today.
 * Examples of Zerodha Option symbols:
 * - "NIFTY 21SEP 24500 CE"
 * - "BANKNIFTY 21SEP26 51000 PE"
 * - "NIFTY 26SEP26 24500 CE"
 * - "SENSEX 21SEP 82000 CE"
 * - "FINNIFTY 21SEP 23000 PE"
 */
function parseExpiryDateFromSymbol(symbolStr, referenceDate = getISTDate()) {
  if (!symbolStr || typeof symbolStr !== 'string') {
    return { isZeroDte: false, expiryDate: null, symbol: '' };
  }

  const cleanSymbol = symbolStr.toUpperCase().trim();
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();
  const refDay = referenceDate.getDate();

  // Pattern: DAY(1-2 digits) + MONTH(3 chars) + optional YEAR(2 digits immediately attached to month)
  // e.g., "21SEP", "21SEP26", "21 SEP"
  const match = cleanSymbol.match(/(\d{1,2})\s*([A-Z]{3})([0-9]{2})?/);

  if (match) {
    const day = parseInt(match[1], 10);
    const monthStr = match[2];
    const yearStr = match[3];

    if (MONTH_MAP.hasOwnProperty(monthStr)) {
      const month = MONTH_MAP[monthStr];
      let year = refYear;
      
      if (yearStr) {
        // If year is explicitly provided like '26' -> 2026
        year = 2000 + parseInt(yearStr, 10);
      }

      const expiryDate = new Date(year, month, day);

      const isZeroDte = (
        expiryDate.getFullYear() === refYear &&
        expiryDate.getMonth() === refMonth &&
        expiryDate.getDate() === refDay
      );

      return {
        isZeroDte,
        expiryDate,
        day,
        month: monthStr,
        symbol: cleanSymbol
      };
    }
  }

  return { isZeroDte: false, expiryDate: null, symbol: cleanSymbol };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getISTDate,
    isMarketHours,
    parseExpiryDateFromSymbol,
    MONTH_MAP
  };
}
