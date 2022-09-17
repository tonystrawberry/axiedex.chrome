/**
 * Content script of the AxieDex extension
 * Script that will run in the context of web pages
 * By using the standard Document Object Model (DOM), they are able to read details of the web pages the browser visits, make changes to them, and pass information to their parent extension.
 * https://developer.chrome.com/docs/extensions/mv3/content_scripts/
 * @author tonystrawberry
 */

import { initializeSalesListPage } from "@/pages/salesListPage";
import { initializeProfileInventoryPage } from "@/pages/profileInventoryPage";
import { initializeAxieIndividualPage } from "@/pages/axieIndividualPage";
import { initializeBodyParts } from "@/initializers/bodyParts";
import { initializeOptions } from "@/initializers/options";
import { EXTENSION_ENABLED, getOptions } from "@/utils/options";

/**
 * Method that will call everytime the current page needs to be initialized
 * (when the page is open for the first time or when the page has updated)
 */
const initialize = async function (returnedOptions: Options) {
  const options: Options = initializeOptions(returnedOptions);

  if (!options[EXTENSION_ENABLED]) {
    return;
  }

  initializeBodyParts();

  const isSalesListPage = window.location.pathname == "/marketplace/axies/";

  const isProfileInventoryPage = window.location.pathname == "/profile/inventory/axies/";

  const axieIndividualPagePathRegex = /marketplace\/axies\/\d+/
  const isAxieIndividualPage = window.location.pathname.match(axieIndividualPagePathRegex);

  if (isSalesListPage) {
    initializeSalesListPage();
  } else if (isProfileInventoryPage) {
    initializeProfileInventoryPage();
  } else if (isAxieIndividualPage) {
    initializeAxieIndividualPage();
  }
};

/**
 * Observer configuration for being able to detect page and DOM changes
 * and check if the current page needs to be initialized again with AxieDex
 */

const OBSERVER_CONFIG = {
  attributes: false,
  childList: true,
  subtree: true,
};

/**
 * Method that will be called whenever the observer has detected some changes
 * @param {any} mutationsList - List of mutations that were found
 */
const observerCallback = function (mutationsList: any) {
  // Ignore on non-supported pages
  if (
    !window.location.href.startsWith("https://app.axieinfinity.com/marketplace/axies") &&
    !window.location.href.startsWith("https://app.axieinfinity.com/profile/inventory/axies")
    ) {
    return;
  }

  if (shouldInitialize(mutationsList)) {
    // Initialize the page with AxieDex again when changes in the DOM has been
    // detected (loader just disappeared or new AxieCard elements have been added)
    setTimeout(() => {
      getOptions(initialize);
    }, 500);
  }
};

/**
 * Method that will be called whenever the observer has detected some changes (loading ending or AxieCard appended to DOM)
 * @param {any} mutationsList - List of mutations that were found
 */
function shouldInitialize(mutationsList: any) {
  for (const element of mutationsList) {
    for (const removedNode of element.removedNodes) {
      if ("innerHTML" in removedNode && removedNode.innerHTML.includes("CardsLoader_CardsLoader")) {
        return true;
      }
    }

    for (const addedNode of element.addedNodes) {
      if ("innerHTML" in addedNode && addedNode.innerHTML.includes("AxieCard_AxieCard")) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Listener for when the options have been updated by the user
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.rerun) {
    getOptions(initialize);
  }
});

/**
 * Start of the script
 *  - Initialize the current page once
 *  - Setup observer
 */

// Currently, the extension will keep running if the page was previously loaded while enabled.
// Need to reload page to disable inflight extension.
getOptions(initialize);
new MutationObserver(observerCallback).observe(document.body, OBSERVER_CONFIG);
