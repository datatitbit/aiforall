/*
  config.js: the ONE place to change settings.
  These are the n8n webhook addresses the forms send to (signup, comments, feedback).
  - Test address: works only while you click "Listen for test event" in n8n.
  - Production address: works after you switch the workflow to Active.
  IMPORTANT: "localhost" means "this computer". The forms reach n8n only when you open
  this page on the SAME computer that runs n8n. Other visitors cannot reach your localhost,
  unless you set up a tunnel (for example Cloudflare Tunnel).
  Change /webhook-test/ to /webhook/ when the workflow is Active.
*/
window.AIFORALL_CONFIG = {
  signupWebhook:   "http://localhost:5678/webhook-test/aiforall-signup",
  commentWebhook:  "http://localhost:5678/webhook-test/aiforall-comment",
  feedbackWebhook: "http://localhost:5678/webhook-test/aiforall-feedback"
};
