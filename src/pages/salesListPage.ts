/**
 * Page script in charge of doing the necessary DOM changes for the Axie Sales List pages
 * https://app.axieinfinity.com/marketplace/axies
 * @author tonystrawberry
 */

import { getAxieInfo } from "@/api/axieTechnology";
import { buildSimilarAxieLink, getGenesQuality } from "@/utils/custom";
import { OPTIONS, SIMILAR_AXIES_ENABLED, SEARCH_BOOKMARKS, initializeOptions } from "@/initializers/options";

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

  /**********************************/
  /** 🔍 Find Similar Axies button **/
  /**********************************/

  if (OPTIONS[SIMILAR_AXIES_ENABLED]) {
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
};

/**
 * 🔖 Add bookmarks sidebar DOM element
 */
const addBookmarksSidebar = function() {
  const axieListingElement = $('[class*="Axies_ListingWrapper"]');

  if ($(axieListingElement).hasClass("AxieDexCustomized")){
    return;
  }

  /* General changes to the default */
  $(axieListingElement).addClass("AxieDexCustomized");

  const axiedexSidebar = `
    <div class="AxieDexSidebar" style="width: 200px; border-right: 1px solid #282c34; padding: 16px;">
      <div class="AxieDexSearchBookmarksContainer">
        <div style="font-size: 16px; font-weight: 600">Search bookmarks</div>
        <div class="AxieDexSearchBookmarksLinks mb-8"></div>
        <div class="input-group inline-block rounded relative w-full">
          <div class="absolute h-full px-12 flex items-center">🔖</div>
          <input id="AxieDexSearchBookmarksSaveInput" class="px-12 py-8 w-full border transition text-14 input-field border-gray-3 focus:border-primary-4 bg-gray-6 text-white placeholder-gray-2" placeholder="Bookmark name" type="text"/>
        </div>
        <div>
          <button id="AxieDexSearchBookmarksSaveButton" style="width: 100%" class="mt-8 px-20 py-8 relative rounded transition focus:outline-none border text-white border-gray-2 hover:border-gray-1 active:border-gray-3 bg-gray-5 hover:bg-gray-4 active:bg-gray-6">Save</button>
        </div>
      </div>
      <div class="AxieDexAxieBookmarksContainer mt-12">
        <div style="font-size: 16px; font-weight: 600">Axies bookmarks</div>

      </div>
    </div>
  `;

  axieListingElement.prepend(axiedexSidebar);

  const axiedexSearchBookmarksLinksContainer = $(axieListingElement).find(".AxieDexSearchBookmarksLinks")

  const bookmarks = OPTIONS[SEARCH_BOOKMARKS];

  if (bookmarks && bookmarks.length > 0) {
    for (let i = 0; i < bookmarks.length; i++) {
      const SEARCH_BOOKMARK_LINK_HTML = `
          <div class="AxieDexSearchBookmark mt-8 flex" data-name="%NAME%" data-link="${bookmarks[i].link}">
            <div class="w-4/5">
              <span class="mr-8">📖</span><a class="mr-8" href="${bookmarks[i].link}">${bookmarks[i].name}</a>
            </div>
            <div class="w-1/5 text-right">
              <span class="AxieDexSearchDeleteBookmark" data-link="${bookmarks[i].link}" style="cursor:pointer">❌</span>
            </div>
          </div>
      `;

      axiedexSearchBookmarksLinksContainer.append(SEARCH_BOOKMARK_LINK_HTML)
    }

    /* For all delete bookmark buttons ❌, attach a listener */
    $(".AxieDexSearchDeleteBookmark").on("click", function () {
      const link = $(this).data("link");
      const filteredBookmarks = bookmarks.filter((b) => b.link != link);

      chrome.runtime.sendMessage(
        {
          contentScriptQuery: "updateSearchBookmarks",
          bookmarks: filteredBookmarks,
        },
        function () {
          setTimeout(() => {
            $(".AxieDexSidebar").remove();
            $('[class*="Axies_ListingWrapper"]').removeClass("AxieDexCustomized")

            addBookmarksSidebar();
          }, 100);
        }
      );
    });

    $("#AxieDexSearchBookmarksSaveButton").on("click", function () {
      const input = $("#AxieDexSearchBookmarksSaveInput");
      if (!input.val() || input.val() === "") {
        alert("Please input a name for this bookmark.");
        return;
      }

      const alreadyBookmark = bookmarks.find((b) => b.link == location.href);
      if (alreadyBookmark) {
        alert(
          `This page has already been bookmarked under the name '${alreadyBookmark.name}'.`
        );
        return;
      }

      bookmarks.push({ name: input.val() as string, link: location.href });

      chrome.runtime.sendMessage(
        {
          contentScriptQuery: "updateSearchBookmarks",
          bookmarks: bookmarks,
        },
        function () {
          setTimeout(() => {
            $(".AxieDexSidebar").remove();
            $('[class*="Axies_ListingWrapper"]').removeClass("AxieDexCustomized")

            addBookmarksSidebar();
          }, 100);
        }
      );
    });
  }
}
