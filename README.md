# Stride League site

Static site for [strideleague.me](https://strideleague.me), hosted on Netlify. Sign-in, invite, and share links are Apple universal links (and Android App Links). If the app is installed, the phone opens Stride League. If it isn’t, Netlify serves `404.html` at the original URL, and that page sends the person to the store.

iOS bundle id: `com.koffeekinggamer.strideleague`  
Android package: `com.koffeekinggamer.strideleague`  
Contact: nckoffeeking@gmail.com

There is no build command. `netlify.toml` sets `publish = "."`, so Netlify publishes the repo root as-is, including `.well-known`.

Asset paths are root-absolute (`/site.css`, `/config.js`) because fallback URLs look like `/join/ABC123`.

## Netlify

Create a Netlify site from this repo. The publish directory and the lack of a build command come from `netlify.toml`. In site settings, add the custom domains `strideleague.me` and `www.strideleague.me`, then turn on HTTPS. The Netlify subdomain will look like `<site>.netlify.app`. Use that hostname in the `www` record below.

## DNS on GoDaddy

Remove any other A, AAAA, or CNAME records on `@` and `www`, then add:

| Host | Type | Value |
| --- | --- | --- |
| `@` | A | `75.2.60.5` |
| `www` | CNAME | `<site>.netlify.app` |

`75.2.60.5` is Netlify’s load balancer. `<site>` is the name Netlify assigns this site. In GoDaddy, the `www` CNAME value is that full hostname, such as `strideleague.netlify.app`.

Do not redirect the apex to `www`, or the reverse. Apple rejects a redirect in front of the association file.

## Link fallbacks

`netlify.toml` rewrites these paths to `404.html` with status 200. That is not a 3xx redirect, so the address bar stays on the link the person opened:

- `/auth/callback` and `/auth/callback/`
- `/join/*`
- `/i/*`
- `/j/*`
- `/race/*`

Any other missing path still uses `404.html` as Netlify’s 404 page. The script on that page reads the original path. Join links show the code in large type with a Copy button. Race links (`/race/<id>`, from the Android widget and race deep links) show **Open this race in Stride League** with both an App Store line and a Google Play line, whatever the device; each says the listing is coming soon until its URL is set in `config.js`. The page does not try a custom URL scheme. An empty store URL in `config.js` shows Coming soon.

## Association files

`_headers` and `netlify.toml` (`[[headers]]`) both set `Content-Type: application/json` for:

- `/.well-known/apple-app-site-association`
- `/.well-known/assetlinks.json`

After DNS is live, confirm the Apple file is JSON and is not redirected:

```bash
curl -sI https://strideleague.me/.well-known/apple-app-site-association
```

You want `HTTP/2 200`, no `location` header, and `content-type: application/json`.

`netlify dev` may still show `application/octet-stream` for the extensionless file. The CDN applies `_headers` on the deployed site. Check the live URL, not the local proxy.

## Fill in when they exist

The Apple Team ID is set (`FA99PQ835U`, so the appID is `FA99PQ835U.com.koffeekinggamer.strideleague` in `.well-known/apple-app-site-association`, applinks `appID` and webcredentials). The App Store id is not created yet. Leave the remaining placeholders until they exist.

| What | Where | Placeholder |
| --- | --- | --- |
| App Store URL | `config.js` → `APP_STORE_URL` | `""` (empty shows **Coming soon** and is not a link). Use the full `https://apps.apple.com/...` URL. |
| Play Store URL | `config.js` → `PLAY_STORE_URL` | `""` (same Coming soon behavior on Android). |
| Play signing certificate | `.well-known/assetlinks.json` | `SHA256_PLACEHOLDER` in `sha256_cert_fingerprints`. |

In the iOS app, the associated domains entitlement should include `applinks:strideleague.me` and `webcredentials:strideleague.me`. Shared links should use these lowercase paths:

- `/auth/callback` — sign-in return
- `/join/<code>` and `/j/<code>` — invites
- `/i/<code>` — older invite shape the app still accepts
- `/race/<id>` — a race (Android widget tap and race deep links)

On Android, the app has a separate verified `https` intent filter on `strideleague.me` for each of `/join`, `/i`, `/auth`, and `/race`. `assetlinks.json` has no path list. It covers every path on the domain, so `/race/*` needs no change there once the real certificate fingerprint replaces `SHA256_PLACEHOLDER`.

## Supabase

In the Supabase project, set the Site URL and the allowed redirect URL to:

`https://strideleague.me/auth/callback`

That path is listed in the Apple app site association file, so a finished sign-in opens the app when it is installed. The rewrite keeps query parameters on that URL, and the page does not display them.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Landing page |
| `privacy.html`, `terms.html` | Privacy policy and terms |
| `help/step-sources/index.html` | Step source help. The app’s “How to connect your watch” link and sync-stall fallback open `https://strideleague.me/help/step-sources`. |
| `404.html`, `fallback.js` | Universal-link fallback |
| `config.js` | `APP_STORE_URL` and `PLAY_STORE_URL` |
| `site.css`, `favicon.svg` | Styles and icon |
| `netlify.toml` | Publish directory, link rewrites, and JSON content type for the association files |
| `_headers` | JSON content type for the association files |
| `.well-known/apple-app-site-association` | iOS universal links and webcredentials |
| `.well-known/assetlinks.json` | Android App Links |
