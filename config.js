/*
  config.js: the ONE place to change settings.
  These are the n8n webhook addresses the two forms send to:
  - NEWSLETTER_WEBHOOK_URL: the "Join free" signup form.
  - SUGGESTION_WEBHOOK_URL: the "What should we explain next?" box.
  Replace YOUR-N8N-DOMAIN with the public address of your n8n (for example n8n.example.com).
  - Test address: /webhook-test/... works only while you click "Listen for test event" in n8n.
  - Production address: /webhook/... works after you switch the workflow to Active.
  In the n8n Webhook node, open Options > Allowed Origins (CORS) and add this site's address,
  otherwise the browser blocks the send.
  Each send is JSON: { name, email, suggestion, source, submitted_at }.
  Until you replace the placeholders, the forms show a polite "not connected yet" message.
*/
window.AIFORALL_CONFIG = {
  NEWSLETTER_WEBHOOK_URL: "https://YOUR-N8N-DOMAIN/webhook/aiforall-newsletter",
  SUGGESTION_WEBHOOK_URL: "https://YOUR-N8N-DOMAIN/webhook/aiforall-suggestion",
  // Free gift shown right after a successful signup. The file must be inside the downloads folder.
  WELCOME_GIFT: { title: "Starter Guide", file: "downloads/aiforall-starter-guide.pdf" }
};
