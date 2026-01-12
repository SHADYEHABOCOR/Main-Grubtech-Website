import { describe, it, expect } from 'vitest';
import en from '../en.json';
import ar from '../ar.json';
import es from '../es.json';
import pt from '../pt.json';

// Helper function to get all keys from nested object with path
function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const key in obj) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    keys.push(fullPath);
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value as Record<string, unknown>, fullPath));
    } else if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        if (typeof item === 'object' && item !== null) {
          keys = keys.concat(getAllKeys(item as Record<string, unknown>, `${fullPath}[${idx}]`));
        }
      });
    }
  }
  return keys;
}

describe('Translation Key Parity Verification', () => {
  const enKeys = new Set(getAllKeys(en as Record<string, unknown>));

  it('should have valid JSON for all translation files', () => {
    expect(en).toBeDefined();
    expect(ar).toBeDefined();
    expect(es).toBeDefined();
    expect(pt).toBeDefined();
  });

  it('should have the same number of keys in Arabic as English', () => {
    const arKeys = new Set(getAllKeys(ar as Record<string, unknown>));
    const missingInAr = [...enKeys].filter(k => !arKeys.has(k));
    const extraInAr = [...arKeys].filter(k => !enKeys.has(k));

    console.log(`\n📊 Arabic (ar.json) Key Comparison:`);
    console.log(`   English baseline: ${enKeys.size} keys`);
    console.log(`   Arabic keys: ${arKeys.size} keys`);

    if (missingInAr.length > 0) {
      console.log(`   ❌ Missing in Arabic: ${missingInAr.length} keys`);
      console.log(`   First 10:`, missingInAr.slice(0, 10));
    }
    if (extraInAr.length > 0) {
      console.log(`   ⚠️  Extra in Arabic (not in EN): ${extraInAr.length} keys`);
      console.log(`   First 10:`, extraInAr.slice(0, 10));
    }
    if (missingInAr.length === 0 && extraInAr.length === 0) {
      console.log(`   ✅ Perfect match!`);
    }

    expect(missingInAr).toHaveLength(0);
    expect(extraInAr).toHaveLength(0);
  });

  it('should have the same number of keys in Spanish as English', () => {
    const esKeys = new Set(getAllKeys(es as Record<string, unknown>));
    const missingInEs = [...enKeys].filter(k => !esKeys.has(k));
    const extraInEs = [...esKeys].filter(k => !enKeys.has(k));

    console.log(`\n📊 Spanish (es.json) Key Comparison:`);
    console.log(`   English baseline: ${enKeys.size} keys`);
    console.log(`   Spanish keys: ${esKeys.size} keys`);

    if (missingInEs.length > 0) {
      console.log(`   ❌ Missing in Spanish: ${missingInEs.length} keys`);
      console.log(`   First 10:`, missingInEs.slice(0, 10));
    }
    if (extraInEs.length > 0) {
      console.log(`   ⚠️  Extra in Spanish (not in EN): ${extraInEs.length} keys`);
      console.log(`   First 10:`, extraInEs.slice(0, 10));
    }
    if (missingInEs.length === 0 && extraInEs.length === 0) {
      console.log(`   ✅ Perfect match!`);
    }

    expect(missingInEs).toHaveLength(0);
    expect(extraInEs).toHaveLength(0);
  });

  it('should have the same number of keys in Portuguese as English', () => {
    const ptKeys = new Set(getAllKeys(pt as Record<string, unknown>));
    const missingInPt = [...enKeys].filter(k => !ptKeys.has(k));
    const extraInPt = [...ptKeys].filter(k => !enKeys.has(k));

    console.log(`\n📊 Portuguese (pt.json) Key Comparison:`);
    console.log(`   English baseline: ${enKeys.size} keys`);
    console.log(`   Portuguese keys: ${ptKeys.size} keys`);

    if (missingInPt.length > 0) {
      console.log(`   ❌ Missing in Portuguese: ${missingInPt.length} keys`);
      console.log(`   First 10:`, missingInPt.slice(0, 10));
    }
    if (extraInPt.length > 0) {
      console.log(`   ⚠️  Extra in Portuguese (not in EN): ${extraInPt.length} keys`);
      console.log(`   First 10:`, extraInPt.slice(0, 10));
    }
    if (missingInPt.length === 0 && extraInPt.length === 0) {
      console.log(`   ✅ Perfect match!`);
    }

    expect(missingInPt).toHaveLength(0);
    expect(extraInPt).toHaveLength(0);
  });

  it('should have matching top-level structure across all languages', () => {
    const enTopKeys = Object.keys(en).sort();
    const arTopKeys = Object.keys(ar).sort();
    const esTopKeys = Object.keys(es).sort();
    const ptTopKeys = Object.keys(pt).sort();

    console.log(`\n📊 Top-Level Structure Check:`);
    console.log(`   English top-level keys: ${enTopKeys.length}`);

    expect(arTopKeys).toEqual(enTopKeys);
    expect(esTopKeys).toEqual(enTopKeys);
    expect(ptTopKeys).toEqual(enTopKeys);

    console.log(`   ✅ All languages have matching top-level structure`);
  });

  it('should generate summary report', () => {
    const arKeys = new Set(getAllKeys(ar as Record<string, unknown>));
    const esKeys = new Set(getAllKeys(es as Record<string, unknown>));
    const ptKeys = new Set(getAllKeys(pt as Record<string, unknown>));

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 TRANSLATION KEY PARITY VERIFICATION REPORT`);
    console.log(`${'='.repeat(60)}`);
    console.log(`\n📊 Summary:`);
    console.log(`   English (baseline): ${enKeys.size} total key paths`);
    console.log(`   Arabic:             ${arKeys.size} total key paths`);
    console.log(`   Spanish:            ${esKeys.size} total key paths`);
    console.log(`   Portuguese:         ${ptKeys.size} total key paths`);

    const arMissing = [...enKeys].filter(k => !arKeys.has(k));
    const esMissing = [...enKeys].filter(k => !esKeys.has(k));
    const ptMissing = [...enKeys].filter(k => !ptKeys.has(k));

    const arExtra = [...arKeys].filter(k => !enKeys.has(k));
    const esExtra = [...esKeys].filter(k => !enKeys.has(k));
    const ptExtra = [...ptKeys].filter(k => !enKeys.has(k));

    console.log(`\n📈 Parity Status:`);
    console.log(`   Arabic:     ${arMissing.length === 0 && arExtra.length === 0 ? '✅ PASS' : '❌ FAIL'} (missing: ${arMissing.length}, extra: ${arExtra.length})`);
    console.log(`   Spanish:    ${esMissing.length === 0 && esExtra.length === 0 ? '✅ PASS' : '❌ FAIL'} (missing: ${esMissing.length}, extra: ${esExtra.length})`);
    console.log(`   Portuguese: ${ptMissing.length === 0 && ptExtra.length === 0 ? '✅ PASS' : '❌ FAIL'} (missing: ${ptMissing.length}, extra: ${ptExtra.length})`);

    const allPass = arMissing.length === 0 && arExtra.length === 0 &&
                    esMissing.length === 0 && esExtra.length === 0 &&
                    ptMissing.length === 0 && ptExtra.length === 0;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🏁 OVERALL RESULT: ${allPass ? '✅ ALL TRANSLATIONS HAVE KEY PARITY' : '❌ KEY MISMATCHES FOUND'}`);
    console.log(`${'='.repeat(60)}\n`);

    expect(allPass).toBe(true);
  });
});
