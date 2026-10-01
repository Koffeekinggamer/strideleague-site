/* Universal-link fallback.
   Netlify rewrites /auth/callback, /join/*, /j/*, and /race/* to this page
   and leaves the original URL in place. Shows a store button only.
   Does not open custom URL schemes or redirect. */
(function () {
  var title = document.getElementById("fallback-title");
  var lead = document.getElementById("fallback-lead");
  var note = document.getElementById("fallback-note");
  var codeBlock = document.getElementById("code-block");
  var codeValue = document.getElementById("code-value");
  var copyButton = document.getElementById("copy-button");
  var copyStatus = document.getElementById("copy-status");
  var storeSlot = document.getElementById("store-slot");

  var platform = detectPlatform();
  var route = parseRoute(location.pathname);

  render(route, platform);

  function detectPlatform() {
    var ua = navigator.userAgent || "";
    var iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (iOS) return "ios";
    if (/Android/i.test(ua)) return "android";
    return "other";
  }

  function parseRoute(pathname) {
    var parts = String(pathname || "").split("/").filter(Boolean).map(safeDecode);
    var head = (parts[0] || "").toLowerCase();
    var second = (parts[1] || "").toLowerCase();

    if (head === "auth" && second === "callback") {
      return { kind: "auth" };
    }
    if (head === "join" || head === "j") {
      return { kind: "join", code: cleanToken(parts[1]) };
    }
    if (head === "race") {
      return { kind: "race", id: cleanToken(parts[1]) };
    }
    return { kind: "missing" };
  }

  function safeDecode(value) {
    try {
      return decodeURIComponent(value);
    } catch (err) {
      return "";
    }
  }

  function cleanToken(value) {
    if (!value || !/^[A-Za-z0-9]{1,64}$/.test(value)) return "";
    return value;
  }

  function render(routeInfo, device) {
    var storeKind = device === "android" ? "play" : "app";
    var storeUrl = strideStoreUrl(storeKind);
    var storeName = storeKind === "play" ? "Google Play" : "the App Store";

    if (device === "android") {
      title.textContent = "Get Stride League";
    } else {
      title.textContent = "Open Stride League on your iPhone";
    }
    document.title = title.textContent;

    if (routeInfo.kind === "join" && routeInfo.code) {
      lead.textContent = device === "android"
        ? "This invite opens in Stride League. Copy the code, install the app, then paste it to join."
        : "This invite opens in Stride League. Copy the code, then paste it after you install the app.";
      codeValue.textContent = routeInfo.code;
      codeBlock.hidden = false;
      copyButton.addEventListener("click", function () {
        copyCode(routeInfo.code);
      });
    } else if (routeInfo.kind === "join") {
      lead.textContent = "This invite link is missing a code. Ask your friend to send it again.";
    } else if (routeInfo.kind === "auth") {
      lead.textContent = "This link finishes signing in. Get Stride League, then start sign-in again from the app.";
    } else if (routeInfo.kind === "race") {
      lead.textContent = routeInfo.id
        ? "This link opens a race in Stride League. Install the app, then open the link again."
        : "This race link is missing an ID. Ask your friend to send it again.";
    } else {
      title.textContent = "That page isn’t here";
      document.title = "Page not found · Stride League";
      lead.textContent = "The link doesn’t match a Stride League page. You can still get Stride League.";
    }

    if (storeUrl && routeInfo.kind !== "join") {
      note.hidden = false;
      note.textContent = "Open this link again from your phone after Stride League is installed.";
    } else {
      note.hidden = true;
      note.textContent = "";
    }

    storeSlot.replaceChildren(buildStoreControl(storeUrl, storeName));
  }

  function buildStoreControl(url, storeName) {
    if (!url) {
      var badge = document.createElement("p");
      badge.className = "store-badge";
      badge.id = "store-badge";
      var kicker = document.createElement("span");
      kicker.className = "store-badge-kicker";
      kicker.textContent = "Coming soon";
      var name = document.createElement("span");
      name.className = "store-badge-name";
      name.textContent = "to " + storeName;
      badge.appendChild(kicker);
      badge.appendChild(name);
      return badge;
    }

    var link = document.createElement("a");
    link.className = "store-badge";
    link.id = "store-badge";
    link.href = url;
    var where = storeName === "Google Play" ? "on Google Play" : "on the App Store";
    link.setAttribute("aria-label", "Get Stride League " + where);
    var kickerLink = document.createElement("span");
    kickerLink.className = "store-badge-kicker";
    kickerLink.textContent = storeName === "Google Play" ? "Google Play" : "App Store";
    var nameLink = document.createElement("span");
    nameLink.className = "store-badge-name";
    nameLink.textContent = "Get Stride League";
    link.appendChild(kickerLink);
    link.appendChild(nameLink);
    return link;
  }

  function copyCode(code) {
    copyStatus.textContent = "";
    writeClipboard(code).then(function () {
      copyButton.textContent = "Copied";
      copyButton.classList.add("is-copied");
      window.setTimeout(function () {
        copyButton.textContent = "Copy invite code";
        copyButton.classList.remove("is-copied");
      }, 2000);
    }).catch(function () {
      copyButton.textContent = "Copy invite code";
      copyButton.classList.remove("is-copied");
      copyStatus.textContent = "Couldn’t copy automatically. Select the code and copy it.";
    });
  }

  function writeClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (err) {
        ok = false;
      }
      document.body.removeChild(field);
      if (ok) resolve();
      else reject(new Error("copy failed"));
    });
  }
})();
