chrome.commands.onCommand.addListener((command) => {
  if (command === "send_url") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentUrl = tabs[0].url;
      sendUrlToDiscord(currentUrl);
    });
  }
});

function sendUrlToDiscord(url) {
  chrome.storage.sync.get(['webhookUrl', 'messageTemplate', 'shortenUrl', 'showNotifications'], function(data) {
    const webhookUrl = data.webhookUrl;
    const messageTemplate = data.messageTemplate || 'Check out this link: {url}';
    const shortenUrl = data.shortenUrl || false;
    const showNotifications = data.showNotifications !== undefined ? data.showNotifications : true;
    
    if (!webhookUrl) {
      if (showNotifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'assets/disurlicon.png',
          title: 'Error',
          message: 'Webhook URL not set. Please check settings.'
        });
      }
      return;
    }

    let finalUrl = url;
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
      if (response.ok && showNotifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'assets/disurlicon.png',
          title: 'URL Sent',
          message: 'The URL has been sent to Discord successfully.'
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      if (showNotifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'assets/disurlicon.png',
          title: 'Error',
          message: 'Failed to send URL to Discord.'
        });
      }
    });
  });
}
