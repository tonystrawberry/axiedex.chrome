/**
 * Page script in charge of doing the necessary DOM changes for the Axie Sales List pages
 * https://app.axieinfinity.com/marketplace/axies
 * @author tonystrawberry
 */

import { getAxieInfo } from "@/api/axieTechnology";
import { buildSimilarAxieLink } from "@/utils/custom";

const SINGLE_AXIE_A_HREF_REGEX_PATTERN = /marketplace\/axies\/\d+/;

/**
 * Public methods
 *  - initializeSalesListPage
 */

/**
 * Method that is called by the root script contentScript.ts if
 * the current page is the sales list page
 */
export const initializeSalesListPage = async function () {
  /* Get all Axies <a> elements */
  const axieElements: AxieElement[] = getAxieDOMElementsData();

  if (axieElements.length == 0) {
    return;
  }

  /* Get infos of all the Axies */
  const axies = await getAxieInfo(axieElements.map((axieElement) => axieElement.axieId));

  for (const i in axieElements) {
    const axieElement = axieElements[i];
    const axie = axies.find((axie) => axieElement.axieId == axie.id);
    if (axie) {
      customizeAxieSingleCard(axieElement.axieElement, axie);
    }
  }
};

/**
 * Private methods
 *  - getAxieDOMElementsData
 *  - customizeAxieSingleCard
 */

/**
 * Get the DOM element of all the Axies
 */
const getAxieDOMElementsData = function () {
  const axieElements: AxieElement[] = [];

  $("a").each((_i, a) => {
    let href = $(a).attr("href") || "";
    /* 2021.10.14 - Axie URLs have all changed to having a slash at the end -> remove that slash */
    if (href[href.length - 1] == "/") {
      href = href.substring(0, href.length - 1);
    }

    const axieId = href.substring(href.lastIndexOf("/") + 1);
    const axieElement = $(a).find('[class*="AxieCard_AxieCard"]');

    if (!axieId || $(axieElement).hasClass("AxieDexCustomized")) {
      return;
    }

    if (SINGLE_AXIE_A_HREF_REGEX_PATTERN.test(href)) {
      axieElements.push({
        href: href,
        axieId: parseInt(axieId),
        rootElement: a,
        axieElement: axieElement,
      });
    }
  });

  return axieElements;
};

/**
 * Add information to the Axie card DOM element by adding utility buttons
 * @param {AxieElement} axieElement - Axie identifiers
 * @param {Axie} axie - Axie
 */
const customizeAxieSingleCard = function (axieElement: JQuery<HTMLElement>, axie: Axie) {
  /* Skip this customization if the element has already been processed */
  if ($(axieElement).hasClass("AxieDexCustomized")) {
    return;
  }

  /* General changes to the default */
  $(axieElement).addClass("AxieDexCustomized");
  $(axieElement).css("height", "unset"); // Remove the fixed height of the card

  /**********************************/
  /** 🔍 Find Similar Axies button **/
  /**********************************/

  const similarAxieLink = buildSimilarAxieLink(axie);
  const findSimilarAxiesButton = `<div class="AxieDexFindSimilarButton AxieDexButton">🔍 Find similar Axies</div>`;

  axieElement.append(findSimilarAxiesButton);
  $(axieElement)
    .find(".AxieDexFindSimilarButton")
    .on("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      window.open(similarAxieLink, "_blank");
      return false;
    });
};
