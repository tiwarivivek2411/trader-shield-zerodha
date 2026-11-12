const assert = require('assert');
const { getISTDate, isMarketHours, parseExpiryDateFromSymbol } = require('../utils/expiry_parser');

console.log('🧪 Running TraderShield Expiry Parser Tests...\n');

// Test 1: Match 0-DTE symbol on the same day
const todayRef = new Date(2026, 8, 21); // 21 Sep 2026
const res1 = parseExpiryDateFromSymbol('NIFTY 21SEP 24500 CE', todayRef);
assert.strictEqual(res1.isZeroDte, true, 'Should mark NIFTY 21SEP as 0-DTE on Sep 21');
console.log('✅ Test 1 Passed: 0-DTE contract correctly detected for 21SEP on Sep 21');

// Test 2: Next week symbol should NOT be 0-DTE
const res2 = parseExpiryDateFromSymbol('NIFTY 28SEP 24500 CE', todayRef);
assert.strictEqual(res2.isZeroDte, false, 'Should NOT mark NIFTY 28SEP as 0-DTE on Sep 21');
console.log('✅ Test 2 Passed: Non-zero DTE contract (28SEP) correctly allowed');

// Test 3: BANKNIFTY 0-DTE contract with explicit year 26
const res3 = parseExpiryDateFromSymbol('BANKNIFTY 21SEP26 51000 PE', todayRef);
assert.strictEqual(res3.isZeroDte, true, 'Should mark BANKNIFTY 21SEP26 as 0-DTE');
console.log('✅ Test 3 Passed: BANKNIFTY 21SEP26 0-DTE contract correctly detected');

// Test 4: Market Hours logic
const morningTime = new Date('2026-09-21T09:30:00+05:30'); // 9:30 AM IST (Monday)
assert.strictEqual(isMarketHours(morningTime), true, '9:30 AM IST Monday should be market hours');

const eveningTime = new Date('2026-09-21T18:00:00+05:30'); // 6:00 PM IST
assert.strictEqual(isMarketHours(eveningTime), false, '6:00 PM IST should NOT be market hours');

const sundayTime = new Date('2026-09-20T11:00:00+05:30'); // 11:00 AM IST Sunday
assert.strictEqual(isMarketHours(sundayTime), false, 'Sunday should NOT be market hours');

console.log('✅ Test 4 Passed: IST Market hours checks working accurately');

console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
