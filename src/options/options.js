// Saves options to chrome.storage
function save_options() {
  var showBadge = document.getElementById('showBadge').checked;
  var noDebugger = document.getElementById('noDebugger').checked;
  chrome.storage.sync.set({
    showBadge: showBadge,
    noDebugger: noDebugger
  }, function() {
    // Call update procedures.
    chrome.runtime.sendMessage({ req: "badgeUpdate" });
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.innerHTML = "&check;";
    setTimeout(function() {
      status.textContent = '';
    }, 3000);
  });
}
  
// Restores select box and checkbox state using the preferences stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    showBadge: true,
    noDebugger: false
  }, function(options) {
    document.getElementById('showBadge').checked = options.showBadge;
    document.getElementById('noDebugger').checked = options.noDebugger;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);