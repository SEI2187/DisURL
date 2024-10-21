document.addEventListener('DOMContentLoaded', function() {
  const webhookUrlInput = document.getElementById('webhookUrl');
  const messageTemplateInput = document.getElementById('messageTemplate');
  const shortenUrlToggle = document.getElementById('shortenUrl');
  const showNotificationsToggle = document.getElementById('showNotifications');
  const saveButton = document.getElementById('saveSettings');
  const statusElement = document.getElementById('status');
  const donateButton = document.getElementById('donate');

  // Load saved settings
  chrome.storage.sync.get([
    'webhookUrl',
    'messageTemplate',
    'shortenUrl',
    'showNotifications'
  ], function(items) {
    webhookUrlInput.value = items.webhookUrl || '';
    messageTemplateInput.value = items.messageTemplate || 'Check out this link: {url}';
    shortenUrlToggle.checked = items.shortenUrl || false;
    showNotificationsToggle.checked = items.showNotifications !== undefined ? items.showNotifications : true;
  });

  // Save settings
  saveButton.addEventListener('click', function() {
    const webhookUrl = webhookUrlInput.value.trim();
    const messageTemplate = messageTemplateInput.value.trim();
    const shortenUrl = shortenUrlToggle.checked;
    const showNotifications = showNotificationsToggle.checked;

    if (!webhookUrl) {
      showStatus('Please enter a webhook URL.', true);
      return;
    }

    chrome.storage.sync.set({
      webhookUrl,
      messageTemplate,
      shortenUrl,
      showNotifications
    }, function() {
      showStatus('Settings saved successfully!');
    });
  });

  // Donate button
  donateButton.addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://www.paypal.com/donate/?hosted_button_id=HAJXZES7F58G8' });
  });

  function showStatus(message, isError = false) {
    statusElement.textContent = message;
    statusElement.style.color = isError ? '#e78284' : '#a6d189';
    statusElement.style.opacity = '1';
    setTimeout(() => {
      statusElement.style.opacity = '0';
    }, 3000);
  }
});
