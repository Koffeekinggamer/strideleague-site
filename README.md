# Stride League site

Static site for [strideleague.me](https://strideleague.me). GitHub Pages serves it at the domain root. Sign-in, invite, and share links are Apple universal links (and Android App Links). If the app is installed, the phone opens Stride League. If it isn’t, GitHub Pages serves `404.html` at the original URL, and that page sends the person to the store.

iOS bundle id: `com.koffeekinggamer.strideleague`  
Android package: `com.koffeekinggamer.strideleague`

## Enable GitHub Pages

In the repo settings, set Pages to deploy from the `main` branch, folder `/` (root). The custom domain is `strideleague.me` (the `CNAME` file). Turn on HTTPS after DNS is in place.

`.nojekyll` turns Jekyll off so `.well-known` is copied as-is. `_config.yml` includes `.well-known` if Jekyll is ever turned back on.

Asset paths are root-absolute (`/site.css`, `/config.js`) because fallback URLs look like `/join/ABC123`.

## DNS

At the registrar for `strideleague.me`, remove any other A or AAAA records on the apex, then add:

| Host | Type | Value |
| --- | --- | --- |
| `@` | A | `185.199.108.153` |
| `@` | A | `185.199.109.153` |
| `@` | A | `185.199.110.153` |
| `@` | A | `185.199.111.153` |
| `@` | AAAA | `2606:50c0:8000::153` |
| `@` | AAAA | `2606:50c0:8001::153` |
| `@` | AAAA | `2606:50c0:8002::153` |
| `@` | AAAA | `2606:50c0:8003::153` |
| `www` | CNAME | `koffeekinggamer.github.io` |

## Fill in when they exist

The App Store id and Apple Team ID are not created yet. Leave the placeholders until they are.

| What | Where | Placeholder |
| --- | --- | --- |
| Apple Team ID | `.well-known/apple-app-site-association` | `TEAMID` in `TEAMID.com.koffeekinggamer.strideleague` (applinks `appID` and webcredentials). Two occurrences. |
| App Store URL | `config.js` → `APP_STORE_URL` | `""` (empty shows **Coming soon** and is not a link). Use the full `https://apps.apple.com/...` URL. |
| Play Store URL | `config.js` → `PLAY_STORE_URL` | `""` (same Coming soon behavior on Android). |
| Play signing certificate | `.well-known/assetlinks.json` | `SHA256_PLACEHOLDER` in `sha256_cert_fingerprints`. |

In the iOS app, the associated domains entitlement should include `applinks:strideleague.me` and `webcredentials:strideleague.me`. Shared links should use these lowercase paths:

- `/auth/callback` — sign-in return
- `/join/<code>` and `/j/<code>` — invites
- `/race/<id>` — a race

The fallback page does not try a custom URL scheme. It shows a store button. Join links also show the code in large type with a Copy button, so it can be pasted after install. An empty store URL shows Coming soon.

## Apple association file

Apple requires `https://strideleague.me/.well-known/apple-app-site-association` to return HTTP 200, with `Content-Type: application/json`, and with no redirect.

GitHub Pages cannot do that. Checked on 1 Oct 2026 against a live GitHub Pages host (`server: GitHub.com`):

| URL | Result |
| --- | --- |
| `https://bitrequest.github.io/apple-app-site-association` | `200`, no `Location`, `content-type: application/octet-stream` |
| `https://bitrequest.github.io/.well-known/apple-app-site-association.json` | `200`, `content-type: application/json; charset=utf-8` |
| `https://bitrequest.github.io/.well-known/assetlinks.json` | `200`, `content-type: application/json; charset=utf-8` |

The extensionless file is the one Apple requests. Pages serves it as `application/octet-stream`. A `.json` name is `application/json`, but Apple will not look for that name. Serving it from a folder so the URL redirects to add a slash also fails Apple’s check.

This repo cannot be checked at the real URL yet:

- GitHub Pages is not enabled (`GET /repos/Koffeekinggamer/strideleague-site/pages` is 404). `https://koffeekinggamer.github.io/strideleague-site/.well-known/apple-app-site-association` is GitHub’s own 404 page.
- `strideleague.me` does not point at GitHub Pages. It resolves to `15.197.148.33` and `3.33.130.190`, and HTTPS to the association file fails the TLS handshake.

`.well-known/assetlinks.json` is fine on Pages because of the `.json` extension.

### Workaround

Put Cloudflare in front of GitHub Pages and set the header there. Pages still hosts the site.

1. Enable Pages on `main` / root, with the custom domain `strideleague.me`, and turn on HTTPS.
2. Add the domain to Cloudflare. Use the GitHub Pages A and AAAA records above, and the `www` CNAME, with the proxy on.
3. Set SSL/TLS to Full (strict). Do not redirect the apex to `www`, or the reverse, on this path.
4. Add a response-header transform rule: if the URI path is `/.well-known/apple-app-site-association`, set `Content-Type` to `application/json`.

Then confirm there is still no redirect:

```bash
curl -sI https://strideleague.me/.well-known/apple-app-site-association
```

You want `HTTP/2 200`, no `location` header, and `content-type: application/json`.

## Supabase

In the Supabase project, set the Site URL and the allowed redirect URL to:

`https://strideleague.me/auth/callback`

That path is listed in the Apple app site association file, so a finished sign-in opens the app when it is installed.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Landing page |
| `privacy.html`, `terms.html` | Privacy policy and terms |
| `404.html`, `fallback.js` | Universal-link fallback |
| `config.js` | `APP_STORE_URL` and `PLAY_STORE_URL` |
| `site.css`, `favicon.svg` | Styles and icon |
| `CNAME` | `strideleague.me` |
| `.nojekyll`, `_config.yml` | Publish `.well-known` |
| `.well-known/apple-app-site-association` | iOS universal links and webcredentials |
| `.well-known/assetlinks.json` | Android App Links |
