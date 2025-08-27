declare global {
  // Minimal shim so TS accepts google maps usage without installing @types/google.maps
  const google: any;
}
export {}
