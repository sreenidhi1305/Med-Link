export type LngLat = { lng: number; lat: number };

export function haversineKm(a: LngLat, b: LngLat) {
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function etaMinutesFromKm(km: number, kmh = 30) {
  // simple street-level estimate; adjust later with routing
  const hrs = km / kmh;
  return Math.max(1, Math.round(hrs * 60));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
