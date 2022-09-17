/**
 * Initializer file for the AxieDex user preferences
 * @author tonystrawberry
 */

 import {
  PURITY_TABLE,
  EXTENSION_ENABLED,
  ONLY_POPUP,
  SEARCH_BOOKMARKS,
  AXIE_BOOKMARKS,
  HIDE_AXIES,
  SIMILAR_AXIES_ENABLED,
  SHOW_GENES_PURITY,
  EYES_EARS_GENES_PURITY_INCLUDED,
  EYES_EARS_GENES_SEARCH_INCLUDED,
  SHOW_AUCTIONS,
  SHOW_HATCH,
  SHOW_V3,
  USER_UID,
  USER
} from "@/utils/options"


export const OPTIONS: Options = {};

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
