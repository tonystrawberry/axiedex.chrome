/**
 * Page script in charge of doing the necessary DOM changes for the Axie Sales List pages
 * https://app.axieinfinity.com/marketplace/axies
 * @author tonystrawberry
 */

import { getAxieInfo } from "@/api/axieTechnology";
import { buildSimilarAxieLink, getGenesQuality } from "@/utils/custom";
import { OPTIONS } from "@/initializers/options";
import { AXIE_BOOKMARKS, SIMILAR_AXIES_ENABLED } from "@/utils/options";
import { getGenesTable } from "@/utils/genesTable";
import { initializeSearchBookmarkInSidebar } from "@/utils/searchBookmarks";
import { addAxieBookmark, initializeAxiesBookmarkInSidebar, removeAxieBookmark } from "@/utils/axieBookmarks";

declare global {
  interface JQuery {
    sortable(options: any): void;
  }
}

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
  /* Add bookmarks display on the side */
  addBookmarksSidebar()

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
  $(axieElement).css("overflow", "unset"); // Remove the overflow of the card
  $(axieElement).css("transform", "unset"); // Remove the transform when hovering over the card because it caused the card to be hidden by other elements

  $(axieElement).append(`<div class="AxieDexAxieCardFooter flex" style="gap: 8px;"></div>`);

  $('[class*="AxieCard_Content"]').css("height", "unset"); // Remove the fixed height of the content of the card

  const axieCardFooter = $(axieElement).find(".AxieDexAxieCardFooter");

  /**********************************/
  /** 🔍 Find Similar Axies button **/
  /**********************************/

  if (OPTIONS[SIMILAR_AXIES_ENABLED]) {
    const similarAxieLink = buildSimilarAxieLink(axie);
    const findSimilarAxiesButton = `<div class="AxieDexFindSimilarButton AxieDexButton">🔍</div>`;

    axieCardFooter.append(findSimilarAxiesButton);
    $(axieCardFooter)
      .find(".AxieDexFindSimilarButton")
      .on("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        window.open(similarAxieLink, "_blank");
        return false;
      });
  }

  /************************/
  /** 🔖 Bookmark button **/
  /************************/

  const axieBookmarks = OPTIONS[AXIE_BOOKMARKS] || [];
  const alreadyBookmarked = axieBookmarks.find((b) => b.id == axie.id);

  /* Check whether the Axie is already bookmarked or not */
  /* If it is, we need to add a 'remove bookmark' button' */
  /* Otherwise, show a button for bookmarking this Axie */
  if (alreadyBookmarked) {
    const bookmarkButton = `<div class="AxieDexBookmarkButton AxieDexButton AxieDexBookmarkButtonBookmarked" style="flex-grow: 1;">🔖 Unbookmark</div>`;
    axieCardFooter.append(bookmarkButton);
    $(axieCardFooter)
      .find(".AxieDexBookmarkButton")
      .on("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        removeAxieBookmark(this, axie);
        return false;
      });

  } else {
    const bookmarkButton = `<div class="AxieDexBookmarkButton AxieDexButton AxieDexBookmarkButtonUnbookmarked" style="flex-grow: 1;">🔖 Bookmark</div>`;
    axieCardFooter.append(bookmarkButton);
    $(axieCardFooter)
      .find(".AxieDexBookmarkButton")
      .on("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        addAxieBookmark(this, axie);
        return false;
      });
  }

  /***********************/
  /** 🔍 Purity Display **/
  /***********************/
  const content = $(axieElement).find('[class*="AxieCard_Content"]');
  const purityElement = `<div style="display: flex; gap: 8px; position: absolute; right: 10px; top: 10px; font-size: 20px; font-weight: 700;">
                            <div>
                              <span style="font-size: 14px;margin-right: 4px;">G</span>${Math.round(getGenesQuality(axie) * 100)}<span style="font-size: 8px">%</span>
                            </div>
                            <div>
                              <span style="font-size: 14px;margin-right: 4px;">C</span>${Math.round(axie.quality * 100)}<span style="font-size: 8px">%</span>
                            </div>
                          </div>`;
  content.append(purityElement);

  /**********************/
  /** 🔍 Genes Display **/
  /**********************/
  content.append(getGenesTable(axie));
};

/**
 * 🔖 Add bookmarks sidebar DOM element
 */
export const addBookmarksSidebar = function () {
  const axieListingElement = $('[class*="Axies_ListingWrapper"]');

  if ($(axieListingElement).hasClass("AxieDexCustomized")) {
    return;
  }

  /* General changes to the default */
  $(axieListingElement).addClass("AxieDexCustomized");

  /* Initialize the AxieDex sidebar */
  const axiedexSidebar = `
    <div class="AxieDexSidebar" style="overflow: auto; width: 200px; border-right: 1px solid #282c34; padding: 16px;">
      <div class="AxieDexSearchBookmarksContainer">
        <div style="font-size: 16px; font-weight: 600">
          <div class="flex items-center cursor-pointer w-full">
            <img src="https://app.axieinfinity.com/static/image/love-potion.png" width="15" class="mr-4">Search bookmarks
          </div>
        </div>
        <div class="AxieDexSearchBookmarksLinks mb-8"></div>
        <div class="input-group inline-block rounded relative w-full">
          <div class="absolute h-full px-12 flex items-center">🔖</div>
          <input id="AxieDexSearchBookmarksSaveInput" class="px-12 py-8 w-full border transition text-14 input-field border-gray-3 focus:border-primary-4 bg-gray-6 text-white placeholder-gray-2" placeholder="Bookmark name" type="text"/>
        </div>
        <div>
          <button id="AxieDexSearchBookmarksSaveButton" style="width: 100%" class="mt-8 px-20 py-8 relative rounded transition focus:outline-none border text-white border-gray-2 hover:border-gray-1 active:border-gray-3 bg-gray-5 hover:bg-gray-4 active:bg-gray-6">Save</button>
        </div>
      </div>
      <div class="AxieDexAxieBookmarksContainer mt-28">
        <div style="font-size: 16px; font-weight: 600">
          <div class="flex items-center cursor-pointer w-full">
            <img src="https://app.axieinfinity.com/static/image/love-potion.png" width="15" class="mr-4">Axie bookmarks
          </div>
        </div>
        <div class="AxieDexAxieBookmarksLinks mb-8"></div>
      </div>
    </div>
  `;

  axieListingElement.prepend(axiedexSidebar);

  /* Initialize the AxieDex search bookmark 🔖 */
  initializeSearchBookmarkInSidebar(axieListingElement)

  /* Initialize the AxieDex Axie bookmark 🔖 */
  initializeAxiesBookmarkInSidebar(axieListingElement)
}
