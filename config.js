/* Stride League store links.
   Leave a string empty until that listing exists.
   An empty URL shows "Coming soon" and is not a link.
   APP_STORE_URL example: https://apps.apple.com/app/id0000000000
   PLAY_STORE_URL example: https://play.google.com/store/apps/details?id=com.koffeekinggamer.strideleague
*/
var APP_STORE_URL = "https://apps.apple.com/app/id6819097146";
/* The App Store page 404s until the app is released.
   Keep this false until then so pages show "Coming soon" instead of a dead link.
   Flip to true on release day. */
var APP_STORE_RELEASED = false;
var PLAY_STORE_URL = "";

function strideStoreUrl(kind) {
  if (kind !== "play" && APP_STORE_RELEASED !== true) return "";
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
