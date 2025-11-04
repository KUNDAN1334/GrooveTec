// Save settings
document.getElementById('saveBtn').addEventListener('click', () => {
    const groqApiKey = document.getElementById('groqApiKey').value;
    const grooveApiKey = document.getElementById('grooveApiKey').value;
    
    if (!groqApiKey || !grooveApiKey) {
      showStatus('Please fill in all fields', 'error');
      return;
    }
    
    // Save to Chrome storage
    chrome.storage.local.set({
      groqApiKey,
      grooveApiKey
    }, () => {
      showStatus('✅ Settings saved successfully!', 'success');
    });
  });
  
  // Load saved settings
  chrome.storage.local.get(['groqApiKey', 'grooveApiKey'], (result) => {
    if (result.groqApiKey) {
      document.getElementById('groqApiKey').value = result.groqApiKey;
    }
    if (result.grooveApiKey) {
      document.getElementById('grooveApiKey').value = result.grooveApiKey;
    }
  });
  
  // Show status message
  function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    
    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.className = '';
    }, 3000);
  }
  