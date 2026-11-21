/* AIforAll script. Small jobs: show an announcement, load tips, send forms, copy the prompt. */

var CFG = window.AIFORALL_CONFIG || {};

// 1) Optional announcement banner. Shown only when status.json has announcement.active = true.
//    Dismissing hides it for that visitor until the announcement "id" changes.
fetch(`./status.json?v=${Date.now()}`, { cache: "no-store" })
  .then(function (r) {
    if (!r.ok) { throw new Error("status.json " + r.status); }
    return r.json();
  })
  .then(function (data) {
    var a = data && (data.announcement || data);
    if (!a || a.active !== true || !a.message) { return; }

    var id = String(a.id || a.message);
    var dismissedId = "";
    try { dismissedId = localStorage.getItem("aiforall-dismissed-banner") || ""; } catch (e) { /* storage blocked: just show it */ }
    if (dismissedId === id) { return; }

    // The banner look lives in announcement.css, loaded only when a banner is shown.
    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "announcement.css";
    document.head.appendChild(css);

    var type = ["info", "warning", "success"].indexOf(a.type) > -1 ? a.type : "info";
    var bar = document.createElement("div");
    bar.className = "announce announce-" + type;
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Announcement");

    var text = document.createElement("p");
    text.className = "announce-text";
    text.textContent = a.message;
    // Optional link. Only normal web, mail or on-page links are allowed.
    if (a.link_text && a.link_url && /^(https?:\/\/|mailto:|\/|\.\/|#)/i.test(a.link_url)) {
      text.appendChild(document.createTextNode(" "));
      var link = document.createElement("a");
      link.href = a.link_url;
      link.textContent = a.link_text;
      text.appendChild(link);
    }

    var close = document.createElement("button");
    close.type = "button";
    close.className = "announce-close";
    close.setAttribute("aria-label", "Dismiss announcement");
    close.innerHTML = "&times;";
    close.addEventListener("click", function () {
      try { localStorage.setItem("aiforall-dismissed-banner", id); } catch (e) { /* ignore */ }
      bar.parentNode.removeChild(bar);
    });

    bar.appendChild(text);
    bar.appendChild(close);
    document.body.insertBefore(bar, document.querySelector(".topbar") || document.body.firstChild);
  })
  .catch(function () { /* no banner if status.json is missing or broken */ });

// 2) Load "Latest tips" from content.json (n8n can edit that file to change the page).
//    The ?v= number makes the browser fetch a fresh copy every time.
fetch(`./content.json?v=${Date.now()}`, { cache: "no-store" })
  .then(function (r) {
    if (!r.ok) { throw new Error("content.json " + r.status); }
    return r.json();
  })
  .then(function (data) {
    var box = document.getElementById("latest-tips");
    if (!box) { return; }
    var tips = Array.isArray(data && data.tips) ? data.tips.filter(function (t) { return t && t.title && t.text; }) : [];
    // Newest first, so tips that n8n adds at the end of the list still appear on top.
    tips.sort(function (a, b) {
      var byDate = String(b.date || "").localeCompare(String(a.date || ""));
      return byDate !== 0 ? byDate : (Number(b.id) || 0) - (Number(a.id) || 0);
    });
    box.innerHTML = "";
    if (!tips.length) {
      box.innerHTML = '<p class="note">No tips yet. Please check back soon.</p>';
      return;
    }
    tips.forEach(function (tip) {
      var d = document.createElement("article");
      d.className = "tip";
      if (tip.id !== undefined && tip.id !== null) { d.id = "tip-" + tip.id; }
      var h = document.createElement("h3"); h.textContent = tip.title;
      var p = document.createElement("p"); p.textContent = tip.text;
      d.appendChild(h); d.appendChild(p);
      if (tip.date) {
        var t = document.createElement("span"); t.className = "date"; t.textContent = tip.date;
        d.appendChild(t);
      }
      box.appendChild(d);
    });
  })
  .catch(function () {
    var box = document.getElementById("latest-tips");
    if (box) { box.innerHTML = '<p class="note">Tips could not load right now. Please try again later.</p>'; }
  });

// 3) Send a form as clean JSON to an n8n webhook (a webhook is a web address n8n listens on).
//    Every send has the same five fields: name, email, suggestion, source, submitted_at.
function wireForm(opts) {
  var form = document.getElementById(opts.formId);
  var msg = document.getElementById(opts.msgId);
  if (!form || !msg) { return; } // if a form is not on the page, skip it quietly
  var button = form.querySelector("button[type=submit]");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    msg.className = "note"; msg.textContent = "";
    var f = {};
    new FormData(form).forEach(function (v, k) { f[k] = String(v).trim(); });

    if (f.website) { msg.textContent = "Thank you!"; form.reset(); return; } // honeypot: bot, ignore quietly
    if (!f[opts.needs]) { msg.className = "err"; msg.textContent = "Please fill in the required box."; return; }
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) { msg.className = "err"; msg.textContent = "That email does not look right."; return; }

    var url = CFG[opts.urlKey];
    if (!url || /YOUR-N8N-DOMAIN/.test(url)) {
      if (window.console) { console.warn("AIforAll: set " + opts.urlKey + " in config.js"); }
      msg.className = "err"; msg.textContent = "This form is not connected yet. Please try again later.";
      return;
    }

    var payload = {
      name: f.name || "",
      email: f.email || "",
      suggestion: f.suggestion || f.feedback || "",
      source: opts.source,
      submitted_at: new Date().toISOString()
    };

    msg.textContent = "Sending...";
    if (button) { button.disabled = true; }
    var controller = window.AbortController ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 15000) : null;

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined
    }).then(function (r) {
      if (!r.ok) { throw new Error("bad status"); }
      msg.className = "ok"; msg.textContent = opts.okText; form.reset();
    }).catch(function () {
      msg.className = "err";
      msg.textContent = "We could not send that right now. Please try again later.";
    }).then(function () {
      if (timer) { clearTimeout(timer); }
      if (button) { button.disabled = false; }
    });
  });
}
wireForm({
  formId: "signup-form", msgId: "signup-msg", urlKey: "NEWSLETTER_WEBHOOK_URL",
  needs: "email", source: "newsletter", okText: "Thank you! You are on the list."
});
wireForm({
  formId: "feedback-form", msgId: "feedback-msg", urlKey: "SUGGESTION_WEBHOOK_URL",
  needs: "feedback", source: "suggestion", okText: "Thank you! We got your suggestion."
});

// 4) Copy the strong example prompt.
var copyBtn = document.getElementById("copy-btn");
if (copyBtn) {
  copyBtn.addEventListener("click", function () {
    var text = document.getElementById("try-prompt").textContent;
    var msg = document.getElementById("copy-msg");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () { msg.textContent = " Copied."; },
        function () { msg.textContent = " Please select and copy it by hand."; });
    } else { msg.textContent = " Please select and copy it by hand."; }
  });
}
