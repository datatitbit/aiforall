/* AIforAll script. Three small jobs: load tips, send forms, copy the prompt. */

// 1) Load "Latest tips" from content.json (n8n can edit that file to change the page).
fetch("content.json", { cache: "no-store" })
  .then(function (r) { return r.json(); })
  .then(function (data) {
    var box = document.getElementById("latest-tips");
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

// 2) Send a form as JSON to an n8n webhook (a webhook is a web address n8n listens on).
function wireForm(formId, msgId, urlKey, needs) {
  var form = document.getElementById(formId);
  var msg = document.getElementById(msgId);
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
wireForm("feedback-form", "feedback-msg", "feedbackWebhook", "message");

// 3) Copy the "Try this now" prompt.
document.getElementById("copy-btn").addEventListener("click", function () {
  var text = document.getElementById("try-prompt").textContent;
  var msg = document.getElementById("copy-msg");
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function () { msg.textContent = " Copied."; },
      function () { msg.textContent = " Please select and copy it by hand."; });
  } else { msg.textContent = " Please select and copy it by hand."; }
});
