chrome.tabs.onUpdated.addListener(function(tabId, changeInfo){
  const url = changeInfo.url;
  if (url) sendToContentScript(url);
});

chrome.history.onVisited.addListener(function(historyItem){
  sendToContentScript(historyItem.url);
});

function sendToContentScript(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
}