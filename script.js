/* AIforAll script. Small jobs: load tips, send forms, copy the prompt. */

// 1) Load "AI in brief" and "Latest tips" from content.json (n8n can edit that file to change the page).
fetch("content.json", { cache: "no-store" })
  .then(function (r) { return r.json(); })
  .then(function (data) {
    var box = document.getElementById("latest-tips");
    renderBrief(data.brief);
    box.innerHTML = "";
    data.tips.forEach(function (tip) {
      var d = document.createElement("article");
      d.className = "tip";
      d.id = "tip-" + tip.id;
      var h = document.createElement("h3"); h.textContent = tip.title;
      var p = document.createElement("p"); p.textContent = tip.text;
      var t = document.createElement("span"); t.className = "date"; t.textContent = tip.date;
      d.appendChild(h); d.appendChild(p); d.appendChild(t);
      box.appendChild(d);
    });
  })
  .catch(function () {
    document.getElementById("latest-tips").innerHTML = '<p class="note">Tips could not load right now. Please try again later.</p>';
  });

// 1b) Fill the "AI in brief" cards (quote, tip, everyday use case) from content.json -> "brief".
function setText(id, value) { var el = document.getElementById(id); if (el) { el.textContent = value || ""; } }
function renderBrief(t) {
  if (!t) { return; }
  setText("quote-text", t.quote && t.quote.text);
  setText("quote-who", t.quote && t.quote.author ? "By " + t.quote.author : "");
  setText("tip-title", t.tip && t.tip.title);
  setText("tip-text", t.tip && t.tip.text);
  setText("usecase-title", t.useCase && t.useCase.title);
  setText("usecase-text", t.useCase && t.useCase.text);
}

// 2) Send a form as JSON to an n8n webhook (a webhook is a web address n8n listens on).
function wireForm(formId, msgId, urlKey, needs) {
  var form = document.getElementById(formId);
  var msg = document.getElementById(msgId);
  if (!form || !msg) { return; } // if a form is not on the page, skip it quietly
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    msg.className = "note"; msg.textContent = "";
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
    if (data.website) { msg.textContent = "Thank you!"; form.reset(); return; } // honeypot: bot, ignore quietly
    if (!data[needs]) { msg.className = "err"; msg.textContent = "Please fill in the required box."; return; }
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) { msg.className = "err"; msg.textContent = "That email does not look right."; return; }
    delete data.website;
    data.sentAt = new Date().toISOString();
    data.source = formId;
    msg.textContent = "Sending...";
    fetch(window.AIFORALL_CONFIG[urlKey], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) {
      if (!r.ok) { throw new Error("bad status"); }
      msg.className = "ok"; msg.textContent = "Thank you! We got it."; form.reset();
    }).catch(function () {
      msg.className = "err";
      msg.textContent = "We could not send that right now. Please try again later.";
    });
  });
}
wireForm("signup-form", "signup-msg", "signupWebhook", "email");
wireForm("feedback-form", "feedback-msg", "feedbackWebhook", "feedback");

// 3) Copy the "Try this now" prompt.
document.getElementById("copy-btn").addEventListener("click", function () {
  var text = document.getElementById("try-prompt").textContent;
  var msg = document.getElementById("copy-msg");
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function () { msg.textContent = " Copied."; },
      function () { msg.textContent = " Please select and copy it by hand."; });
  } else { msg.textContent = " Please select and copy it by hand."; }
});
