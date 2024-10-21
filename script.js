document.addEventListener('DOMContentLoaded', function() {
  const sendUrlButton = document.getElementById('sendUrl');
  const copyUrlButton = document.getElementById('copyUrl');
  const toggleSettingsButton = document.getElementById('toggleSettings');
  const donateButton = document.getElementById('donate');
  const statusElement = document.getElementById('status');
  const urlPreviewElement = document.getElementById('urlPreview');
  const settingsDiv = document.getElementById('settings');
  const webhookUrlInput = document.getElementById('webhookUrl');
  const messageTemplateInput = document.getElementById('messageTemplate');
  const shortenUrlToggle = document.getElementById('shortenUrl');
  const showNotificationsToggle = document.getElementById('showNotifications');
  const saveSettingsButton = document.getElementById('saveSettings');
  const mainContent = document.getElementById('mainContent');
  const settingsContent = document.getElementById('settingsContent');
  const backToMainButton = document.getElementById('backToMain');

  let currentUrl = '';

  function showStatus(message, isError = false) {
    statusElement.textContent = message;
    statusElement.style.opacity = '1';
    statusElement.style.color = isError ? '#e78284' : '#a6d189'; // Catppuccin Frappé red and green
    setTimeout(() => {
      statusElement.style.opacity = '0';
    }, 2000);
  }

  function shakeButton(button) {
    button.style.animation = 'shake 0.5s';
    setTimeout(() => {
      button.style.animation = '';
    }, 500);
  }

  function toggleSettings() {
    mainContent.classList.toggle('hidden');
    settingsContent.classList.toggle('visible');
  }

  toggleSettingsButton.addEventListener('click', toggleSettings);
  backToMainButton.addEventListener('click', toggleSettings);

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
  saveSettingsButton.addEventListener('click', function() {
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
      toggleSettings(); // Return to main content after saving
    });
  });

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    currentUrl = tabs[0].url;
    urlPreviewElement.textContent = currentUrl;
  });

  sendUrlButton.addEventListener('click', function() {
    showStatus('Sending...');

    chrome.storage.sync.get(['webhookUrl', 'messageTemplate', 'shortenUrl'], function(data) {
      const webhookUrl = data.webhookUrl;
      const messageTemplate = data.messageTemplate || 'Check out this link: {url}';
      const shortenUrl = data.shortenUrl || false;
      
      if (!webhookUrl) {
        showStatus('Webhook URL not set. Please check settings.', true);
        shakeButton(sendUrlButton);
        return;
      }

      let finalUrl = currentUrl;
      if (shortenUrl) {
        // Implement URL shortening logic here
        console.log('URL shortening is not implemented yet');
      }

      const message = messageTemplate.replace('{url}', finalUrl);
      
      fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message
        }),
      })
      .then(response => {
        if (response.ok) {
          showStatus('Sent!');
        } else {
          showStatus('Failed to send.', true);
          shakeButton(sendUrlButton);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showStatus('Error occurred.', true);
        shakeButton(sendUrlButton);
      });
    });
  });

  copyUrlButton.addEventListener('click', function() {
    navigator.clipboard.writeText(currentUrl).then(function() {
      showStatus('URL copied!');
    }, function(err) {
      showStatus('Failed to copy URL', true);
      shakeButton(copyUrlButton);
    });
  });

  donateButton.addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://www.paypal.com/donate/?hosted_button_id=HAJXZES7F58G8' });
  });

  function applyDarkMode(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
  }

  function checkSystemDarkMode() {
    chrome.storage.sync.get('darkMode', function(items) {
      const systemDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = items.darkMode !== undefined ? items.darkMode : systemDarkMode;
      applyDarkMode(isDark);
    });
  }

  checkSystemDarkMode();
  window.matchMedia('(prefers-color-scheme: dark)').addListener(checkSystemDarkMode);
});
