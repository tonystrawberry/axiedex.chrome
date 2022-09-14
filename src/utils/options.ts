const PURITY_TABLE = "PURITY_TABLE";
const EXTENSION_ENABLED = "EXTENSION_ENABLED";
const ONLY_POPUP = "ONLY_POPUP";
const SEARCH_BOOKMARKS = "SEARCH_BOOKMARKS";
const AXIE_BOOKMARKS = "AXIE_BOOKMARKS";
const HIDE_AXIES = "HIDE_AXIES";
const SIMILAR_AXIES_ENABLED = "SIMILAR_AXIES_ENABLED";
const SHOW_GENES_PURITY = "SHOW_GENES_PURITY";
const EYES_EARS_GENES_PURITY_INCLUDED = "EYES_EARS_GENES_PURITY_INCLUDED";
const EYES_EARS_GENES_SEARCH_INCLUDED = "EYES_EARS_GENES_SEARCH_INCLUDED";
const SHOW_AUCTIONS = "SHOW_AUCTIONS";
const SHOW_HATCH = "SHOW_HATCH";
const SHOW_V3 = "SHOW_V3";
const USER_UID = "USER_UID";
const USER = "USER";

/**
 * Set a single user preference
 * @param {OptionKey} key - Preference key
 * @param {any} value - Function that will return the result
 */
export const putOption = function(key: OptionKey, value: any) {
  const options: Options = {};
  options[key] = value;
  putOptions(options);
}

/**
 * Set all the preferences at once
 * @param {Options} options - Preferences
 */
 export const putOptions = function(options: Options) {
  chrome.storage.sync.set(options, function () {});
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0] && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { rerun: true });
    }
  });
}

/**
 * Get a single user preference
 * @param {OptionKey} key - Preference key
 * @param {any} callback - Callback function that is called when chrome.storage.sync.get is done
 */
 export const getOption = function(key: OptionKey, callback: any) {
  chrome.storage.sync.get([key], callback);
}

/**
 * Get all the preferences at once
 * @param {any} callback - Callback function that is called when chrome.storage.sync.get is done
 */
 export const getOptions = function(callback: any) {
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
}

/**
 * Reset all the preferences at once
 * @param {Options} options - Existing preferences that will overwrite the default preferences for the present keys
 */
 export const resetOptions = function(options: Options) {
  const defaultOptions: Options = {};

  defaultOptions[EXTENSION_ENABLED] = options[EXTENSION_ENABLED] != null ? options[EXTENSION_ENABLED] : true;
  defaultOptions[HIDE_AXIES] = options[HIDE_AXIES] != null ? options[HIDE_AXIES] : false;
  defaultOptions[ONLY_POPUP] = options[ONLY_POPUP] != null ? options[ONLY_POPUP] : false;
  defaultOptions[PURITY_TABLE] =
    options[PURITY_TABLE] != null
      ? options[PURITY_TABLE]
      : [
          {
            type: "C",
            purity: 100,
            color: "#4c0f0f",
          },
        ];
  defaultOptions[SEARCH_BOOKMARKS] =
    options[SEARCH_BOOKMARKS] != null
      ? options[SEARCH_BOOKMARKS]
      : [
          {
            link: "https://marketplace.axieinfinity.com/axie",
            name: "HOME PAGE",
          },
        ];

  defaultOptions[AXIE_BOOKMARKS] =
    options[AXIE_BOOKMARKS] != null
      ? options[AXIE_BOOKMARKS]
      : [
          {
            id: 100,
            class: "Beast",
          },
        ];
  defaultOptions[SIMILAR_AXIES_ENABLED] = options[SIMILAR_AXIES_ENABLED] != null ? options[SIMILAR_AXIES_ENABLED] : true;
  defaultOptions[SHOW_GENES_PURITY] = options[SHOW_GENES_PURITY] != null ? options[SHOW_GENES_PURITY] : true;
  defaultOptions[EYES_EARS_GENES_PURITY_INCLUDED] = options[EYES_EARS_GENES_PURITY_INCLUDED] != null ? options[EYES_EARS_GENES_PURITY_INCLUDED] : false;
  defaultOptions[EYES_EARS_GENES_SEARCH_INCLUDED] = options[EYES_EARS_GENES_SEARCH_INCLUDED] != null ? options[EYES_EARS_GENES_SEARCH_INCLUDED] : false;
  defaultOptions[SHOW_AUCTIONS] = options[SHOW_AUCTIONS] != null ? options[SHOW_AUCTIONS] : true;
  defaultOptions[SHOW_HATCH] = options[SHOW_HATCH] != null ? options[SHOW_HATCH] : true;
  defaultOptions[SHOW_V3] = options[SHOW_V3] != null ? options[SHOW_V3] : true;
  defaultOptions[USER_UID] = options[USER_UID] != null ? options[USER_UID] : null;
  defaultOptions[USER] = options[USER] != null ? options[USER] : null;

  putOptions(defaultOptions);

  return defaultOptions;
}
