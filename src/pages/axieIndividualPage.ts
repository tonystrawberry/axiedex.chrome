/**
 * Page script in charge of doing the necessary DOM changes for the Axie Individual page
 * https://app.axieinfinity.com/marketplace/axies/11334428/
 * @author tonystrawberry
 */

import { getAxieInfo } from "@/api/axieTechnology";
import { buildSimilarAxieLink, getGenesQuality } from "@/utils/custom";
import { OPTIONS } from "@/initializers/options";
import { SIMILAR_AXIES_ENABLED } from "@/utils/options";

declare global {
  interface JQuery {
    sortable(options: any): void;
  }
}

const SINGLE_AXIE_A_HREF_REGEX_PATTERN = /marketplace\/axies\/\d+/;

/**
 * Public methods
 *  - initializeAxieIndividualPage
 */

/**
 * Method that is called by the root script contentScript.ts if
 * the current page is the sales list page
 */
export const initializeAxieIndividualPage = async function () {
  /* Get the current Axie ID */
  let currentURL = window.location.href;
  currentURL = currentURL.split("?")[0]; // make it work for URL like https://app.axieinfinity.com/marketplace/axies/11334428/?a

  // 2021.10.14 - Axie URLs have all changed to having a slash at the end. Remove that slash.
  if (currentURL[currentURL.length - 1] == "/") {
    currentURL = currentURL.substring(0, currentURL.length - 1);
  }

  const axieId: number = parseInt(currentURL.substring(currentURL.lastIndexOf("/") + 1));

  /* Get infos of the current Axie */
  const axies = await getAxieInfo([axieId]);

  if (axies.length == 0) {
    return;
  }

  const axie = axies[0];

  /**********************************/
  /** 🔍 Find Similar Axies button **/
  /**********************************/

  /* Add a Find Similar Axie in the 'dango-tabs' element (where Origin and Classic buttons are set) */
  addSimilarAxiesButton(axie);


  /***********************/
  /** 🔍 Purity Display **/
  /***********************/
  addPurityInformation(axie);

  $("body").addClass("AxieDexCustomized")
};

/**
 * Private methods
 *  - addSimilarAxiesButton
 *  - addPurityInformation
 */

/**
 * Add 🔍 Find Similar Axies button
 * @param {Axie} axie - Axie
 */
const addSimilarAxiesButton = function (axie: Axie) {
  if ($("body").hasClass("AxieDexCustomized")) {
    return;
  }

  if (OPTIONS[SIMILAR_AXIES_ENABLED]) {
    const similarAxieLink = buildSimilarAxieLink(axie);
    const findSimilarAxiesButton = `
      <div class="dango-tabs-tab">
        <div class="dango-tabs-tab-btn">
          <a href="${similarAxieLink}" target="_blank">🔍 Find similar Axies</span>
        </div>
      </div>`;

    $(".dango-tabs-nav-list").append(findSimilarAxiesButton)
  }
};


/**
 * Add purity information of current Axie
 * @param {Axie} axie - Axie
 */
const addPurityInformation = function (axie: Axie) {
  /* Skip this customization if the page has already been processed */
  if ($("body").hasClass("AxieDexCustomized")) {
    return;
  }

  /***********************/
  /** 🔍 Purity Display **/
  /***********************/
  const axieAboutContainer = $('[class*="AxieAbout_AxieAbout"]').children(":first-child");

  /* Add mr-28 to all elements (only the last element seems to be lacking it but just in case add to all) */
  $(axieAboutContainer).children().each(function () {
    $(this).addClass("mr-28");
  })

  axieAboutContainer.append(`
    <div class="mr-28">
      <div style="color: #737d8f; text-transform: uppercase; letter-spacing: .075em; font-size: 10px; font-weight: 700; line-height: 16px;">
        CLASS PURITY
      </div>
      <div class="flex items-center mt-4">
        <div class="ml-4 text-16">${Math.round(axie.quality * 100)}<span style="font-size: 8px">%</span></div>
      </div>
    </div>
    <div class="mr-28">
      <div style="color: #737d8f; text-transform: uppercase; letter-spacing: .075em; font-size: 10px; font-weight: 700; line-height: 16px;">
        GENETIC PURITY
      </div>
      <div class="flex items-center mt-4">
        <div class="ml-4 text-16">${Math.round(getGenesQuality(axie) * 100)}<span style="font-size: 8px">%</span></div>
      </div>
    </div>
  `)
};
