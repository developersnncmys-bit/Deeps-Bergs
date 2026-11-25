/**
 * India PIN code validation against the entered state and city.
 *
 * Rules (per India Post):
 *  - PIN is a 6-digit number.
 *  - First digit identifies the region (Postal Index zone) → state mapping below.
 *  - First 3 digits identify the sorting district → a handful of popular cities
 *    are mapped so an obvious typo like "560001" for Mysore is caught.
 */

// Zone (first digit) → list of states/UTs in that zone, lowercased for matching.
const ZONE_BY_STATE: Record<string, number> = {
  // Zone 1 — Northern
  delhi: 1,
  "new delhi": 1,
  haryana: 1,
  punjab: 1,
  "himachal pradesh": 1,
  "jammu and kashmir": 1,
  "jammu & kashmir": 1,
  ladakh: 1,
  chandigarh: 1,
  // Zone 2
  "uttar pradesh": 2,
  uttarakhand: 2,
  // Zone 3
  rajasthan: 3,
  gujarat: 3,
  "dadra and nagar haveli": 3,
  "daman and diu": 3,
  // Zone 4
  chhattisgarh: 4,
  "madhya pradesh": 4,
  maharashtra: 4,
  goa: 4,
  // Zone 5
  "andhra pradesh": 5,
  telangana: 5,
  karnataka: 5,
  // Zone 6
  kerala: 6,
  "tamil nadu": 6,
  puducherry: 6,
  lakshadweep: 6,
  // Zone 7
  "west bengal": 7,
  odisha: 7,
  assam: 7,
  "arunachal pradesh": 7,
  meghalaya: 7,
  mizoram: 7,
  manipur: 7,
  nagaland: 7,
  tripura: 7,
  sikkim: 7,
  "andaman and nicobar": 7,
  "andaman and nicobar islands": 7,
  // Zone 8
  bihar: 8,
  jharkhand: 8,
};

// First-3-digit prefix → list of cities that share that sorting district.
// A given city may have multiple valid prefixes; we match "starts with" against any.
const CITY_PREFIXES: Record<string, string[]> = {
  // Karnataka
  bengaluru: ["560", "561", "562"],
  bangalore: ["560", "561", "562"],
  mysore: ["570", "571"],
  mysuru: ["570", "571"],
  mangalore: ["575"],
  mangaluru: ["575"],
  hubli: ["580"],
  hubballi: ["580"],
  // Tamil Nadu
  chennai: ["600", "601", "602", "603"],
  coimbatore: ["641"],
  madurai: ["625"],
  salem: ["636"],
  // Kerala
  kochi: ["682"],
  cochin: ["682"],
  thiruvananthapuram: ["695"],
  trivandrum: ["695"],
  calicut: ["673"],
  kozhikode: ["673"],
  // Telangana / AP
  hyderabad: ["500", "501", "502"],
  secunderabad: ["500"],
  vijayawada: ["520"],
  visakhapatnam: ["530", "531"],
  vizag: ["530", "531"],
  // Maharashtra
  mumbai: ["400"],
  pune: ["411", "412"],
  nagpur: ["440", "441"],
  nashik: ["422"],
  thane: ["400", "401"],
  // Gujarat
  ahmedabad: ["380", "382"],
  surat: ["395"],
  vadodara: ["390", "391"],
  baroda: ["390", "391"],
  rajkot: ["360"],
  // Rajasthan
  jaipur: ["302", "303"],
  jodhpur: ["342"],
  udaipur: ["313"],
  // Delhi NCR
  delhi: ["110"],
  "new delhi": ["110"],
  gurgaon: ["122"],
  gurugram: ["122"],
  noida: ["201"],
  faridabad: ["121"],
  ghaziabad: ["201"],
  // Punjab / Haryana / HP
  chandigarh: ["160"],
  ludhiana: ["141"],
  amritsar: ["143"],
  shimla: ["171"],
  // Uttarakhand / UP
  dehradun: ["248"],
  lucknow: ["226"],
  kanpur: ["208"],
  varanasi: ["221"],
  agra: ["282"],
  // Bihar / Jharkhand
  patna: ["800"],
  ranchi: ["834"],
  // West Bengal
  kolkata: ["700"],
  calcutta: ["700"],
  howrah: ["711"],
  // Odisha / Assam
  bhubaneswar: ["751"],
  guwahati: ["781"],
};

export type PincodeCheck =
  | { ok: true }
  | { ok: false; reason: string };

export function validatePincode(
  pincode: string,
  state: string,
  city: string,
): PincodeCheck {
  const p = pincode.trim();

  if (!/^\d{6}$/.test(p)) {
    return { ok: false, reason: "Pincode must be 6 digits." };
  }

  const stateKey = state.trim().toLowerCase();
  if (stateKey) {
    const expectedZone = ZONE_BY_STATE[stateKey];
    if (expectedZone != null) {
      const actualZone = Number(p[0]);
      if (actualZone !== expectedZone) {
        return {
          ok: false,
          reason: `Pincode doesn't match ${state} — it should start with ${expectedZone}.`,
        };
      }
    }
  }

  const cityKey = city.trim().toLowerCase();
  if (cityKey) {
    const prefixes = CITY_PREFIXES[cityKey];
    if (prefixes && !prefixes.some((pref) => p.startsWith(pref))) {
      return {
        ok: false,
        reason: `Pincode doesn't match ${city} — expected ${prefixes.join(" / ")}xxx.`,
      };
    }
  }

  return { ok: true };
}
