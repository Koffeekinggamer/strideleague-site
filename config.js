/* Stride League store links.
   Leave a string empty until that listing exists.
   An empty URL shows "Coming soon" and is not a link.
   APP_STORE_URL example: https://apps.apple.com/app/id0000000000
   PLAY_STORE_URL example: https://play.google.com/store/apps/details?id=com.koffeekinggamer.strideleague
*/
var APP_STORE_URL = "";
var PLAY_STORE_URL = "";

function strideStoreUrl(kind) {
  var raw = kind === "play" ? PLAY_STORE_URL : APP_STORE_URL;
  if (typeof raw !== "string") return "";
  var trimmed = raw.trim();
  if (!trimmed) return "";
  try {
    var parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "";
    return parsed.href;
  } catch (err) {
    return "";
  }
}
