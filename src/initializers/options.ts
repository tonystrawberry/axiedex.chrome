/**
 * Initializer file for the AxieDex user preferences
 * @author tonystrawberry
 */

export const PURITY_TABLE = "PURITY_TABLE";
export const EXTENSION_ENABLED = "EXTENSION_ENABLED";
export const ONLY_POPUP = "ONLY_POPUP";
export const SEARCH_BOOKMARKS = "SEARCH_BOOKMARKS";
export const AXIE_BOOKMARKS = "AXIE_BOOKMARKS";
export const HIDE_AXIES = "HIDE_AXIES";
export const SIMILAR_AXIES_ENABLED = "SIMILAR_AXIES_ENABLED";
export const SHOW_GENES_PURITY = "SHOW_GENES_PURITY";
export const EYES_EARS_GENES_PURITY_INCLUDED = "EYES_EARS_GENES_PURITY_INCLUDED";
export const EYES_EARS_GENES_SEARCH_INCLUDED = "EYES_EARS_GENES_SEARCH_INCLUDED";
export const SHOW_AUCTIONS = "SHOW_AUCTIONS";
export const SHOW_HATCH = "SHOW_HATCH";
export const SHOW_V3 = "SHOW_V3";
export const USER_UID = "USER_UID";
export const USER = "USER";

export const OPTIONS: Options = {};

/**
 * Get all the preferences at once
 * @param {any} callback - Callback function that is called when chrome.storage.sync.get is done
 */
export const getOptions = function (callback: any) {
  chrome.storage.sync.get(
    [
      PURITY_TABLE,
      ONLY_POPUP,
      EXTENSION_ENABLED,
      HIDE_AXIES,
      SEARCH_BOOKMARKS,
      AXIE_BOOKMARKS,
      SIMILAR_AXIES_ENABLED,
      SHOW_GENES_PURITY,
      EYES_EARS_GENES_PURITY_INCLUDED,
      EYES_EARS_GENES_SEARCH_INCLUDED,
      SHOW_AUCTIONS,
      SHOW_HATCH,
      SHOW_V3,
      USER_UID,
      USER,
    ],
    callback
  );
};

/**
 * Initialize the BODY_PARTS_MAP by fetching data from data/bodyParts.json
 */
export const initializeOptions = function (response: Options): Options {
  OPTIONS[PURITY_TABLE] = response[PURITY_TABLE];
  OPTIONS[EXTENSION_ENABLED] = response[EXTENSION_ENABLED];
  OPTIONS[HIDE_AXIES] = response[HIDE_AXIES];
  OPTIONS[ONLY_POPUP] = response[ONLY_POPUP];
  OPTIONS[SEARCH_BOOKMARKS] = response[SEARCH_BOOKMARKS];
  OPTIONS[AXIE_BOOKMARKS] = response[AXIE_BOOKMARKS];
  OPTIONS[SIMILAR_AXIES_ENABLED] = response[SIMILAR_AXIES_ENABLED];
  OPTIONS[SHOW_GENES_PURITY] = response[SHOW_GENES_PURITY];
  OPTIONS[EYES_EARS_GENES_PURITY_INCLUDED] = response[EYES_EARS_GENES_PURITY_INCLUDED];
  OPTIONS[EYES_EARS_GENES_SEARCH_INCLUDED] = response[EYES_EARS_GENES_SEARCH_INCLUDED];
  OPTIONS[SHOW_AUCTIONS] = response[SHOW_AUCTIONS];
  OPTIONS[SHOW_HATCH] = response[SHOW_HATCH];
  OPTIONS[SHOW_V3] = response[SHOW_V3];
  OPTIONS[USER_UID] = response[USER_UID];
  OPTIONS[USER] = response[USER];

  return OPTIONS;
};
