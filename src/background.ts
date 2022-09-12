/**
 * Background script of the AxieDex extension
 * https://developer.chrome.com/docs/extensions/mv3/getstarted/#background-script
 * @author tonystrawberry
 */

/**
 * Chrome runtime listeners (onMessage, onInstalled)
 * All listenable events can be found here: https://developer.chrome.com/docs/extensions/reference/runtime/#event
 */

/* Set a listener for the onMessage events that are called by contentScript.js */
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.contentScriptQuery == "getAxieInfo") {
    getAxieInfo(request.axieIds, sendResponse);
  }

  return true;
});

/**
 * Methods called when chrome.runtime.onMessage receives a message from contentScript.js
 */

/**
 * Get Axie
 * @param {number} axieIds - Axie identifiers
 * @param {Function} sendResponse- Function that will return the result
 * @param {number} tryCount - Number of tries (after 3 retries, stop retrying on fail)
 */
function getAxieInfo(axieIds: number[], sendResponse: Function, tryCount: number = 1) {
  fetch(`https://api.axie.technology/getaxies/${axieIds.join(",")}`)
    .then((response) => {
      response.json().then((result) => {
        if (!result) {
          setTimeout(() => {
            getAxieInfo(axieIds, sendResponse, tryCount + 1);
          }, 1300);
        } else {
          sendResponse(result);
        }
      });
    })
    .catch((error) => {
      if (tryCount <= 3) {
        setTimeout(() => {
          getAxieInfo(axieIds, sendResponse, tryCount + 1);
        }, 1300);
      }
    });
}
