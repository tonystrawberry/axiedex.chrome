/**
 * Page script in charge of doing the necessary DOM changes for the Axie Sales List pages
 * https://app.axieinfinity.com/marketplace/axies
 * @author tonystrawberry
 */

import { getAxieInfo } from "@/api/axieTechnology";
import { buildSimilarAxieLink, getGenesQuality } from "@/utils/custom";
import { OPTIONS } from "@/initializers/options";
import { AXIE_BOOKMARKS, getOptions, SEARCH_BOOKMARKS, SIMILAR_AXIES_ENABLED } from "@/utils/options";

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
  $(axieElement).append(`<div class="AxieDexAxieCardFooter flex" style="gap: 8px;"></div>`);
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
};

/**
 * 🔖 Add bookmarks sidebar DOM element
 */
const addBookmarksSidebar = function () {
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

/**
 * Initialize the AxieDex search bookmark space in the sidebar
 * @param {JQuery<HTMLElement>} axieListingElement - Default Axie Listing Container element
 */
const initializeSearchBookmarkInSidebar = function (axieListingElement: JQuery<HTMLElement>) {
  const axiedexSearchBookmarksLinksContainer = $(axieListingElement).find(".AxieDexSearchBookmarksLinks")

  const bookmarks = OPTIONS[SEARCH_BOOKMARKS] || [];

  if (bookmarks && bookmarks.length > 0) {
    for (const bookmark of bookmarks) {
      const SEARCH_BOOKMARK_LINK_HTML = `
        <div class="AxieDexSearchBookmark mt-8 flex" data-name="${bookmark.name}" data-link="${bookmark.link}">
          <div class="w-4/5">
            <span class="mr-8">📖</span><a class="mr-8" style="font-size: 14px; font-weight: 400;" href="${bookmark.link}">${bookmark.name}</a>
          </div>
          <div class="w-1/5 text-right">
            <span class="AxieDexSearchDeleteBookmark" data-link="${bookmark.link}" style="cursor:pointer">❌</span>
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
  }

  /* For the save button 💾, attach a listener */
  $("#AxieDexSearchBookmarksSaveButton").on("click", function () {
    const input = $("#AxieDexSearchBookmarksSaveInput");
    if (!input.val() || input.val() === "") {
      alert("Please set a name for this bookmark 🙏");
      return;
    }

    const alreadyBookmark = bookmarks.find((b) => b.link == location.href);
    if (alreadyBookmark) {
      alert(
        `This page has already been bookmarked under the name '${alreadyBookmark.name}' 😅`
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

  /* Apply JQuery UI sortable to the search bookmarks container */
  $(function () {
    $(".AxieDexSearchBookmarksLinks").sortable({
      update: function () {
        handleSearchBookmarksSort();
      },
    });
  });
}

/**
 * Update the bookmarks 🔖 after sorting the elements
 */
async function handleSearchBookmarksSort() {
  const originalSearchBookmarks = OPTIONS[SEARCH_BOOKMARKS] || [];
  const searchBookmarks: SearchBookmarkOption[] = [];

  $(".AxieDexSearchBookmarksLinks > .AxieDexSearchBookmark").each(function () {
    searchBookmarks.push({
      name: $(this).data("name"),
      link: $(this).data("link")
    });
  });

  if (originalSearchBookmarks.length != searchBookmarks.length) {
    return;
  }

  chrome.runtime.sendMessage(
    {
      contentScriptQuery: "updateSearchBookmarks",
      bookmarks: searchBookmarks,
    },
    function () {
      setTimeout(() => {
        $(".AxieDexSidebar").remove();
        $('[class*="Axies_ListingWrapper"]').removeClass("AxieDexCustomized")

        addBookmarksSidebar();
      }, 100);
    }
  );
}

/**
 * Initialize the AxieDex search bookmark space in the sidebar
 * @param {JQuery<HTMLElement>} axieListingElement - Default Axie Listing Container element
 */
const initializeAxiesBookmarkInSidebar = function (axieListingElement: JQuery<HTMLElement>) {
  const axiedexAxieBookmarksLinksContainer = $(axieListingElement).find(".AxieDexAxieBookmarksLinks")

  const bookmarks = OPTIONS[AXIE_BOOKMARKS] || [];

  if (bookmarks && bookmarks.length > 0) {
    for (const bookmark of bookmarks) {
      const SEARCH_BOOKMARK_LINK_HTML = `
        <div class="AxieDexAxieBookmark mt-8 flex items-center relative" data-id="${bookmark.id}" data-class="${bookmark.class}">
        <div class="flex items-center w-4/5">
          <img width="15" src="https://cdn.axieinfinity.com/marketplace-website/asset-icon/class/${bookmark.class.toLowerCase()}.png" alt="">
          <a class="ml-8 mr-8" style="width:100%" href="https://app.axieinfinity.com/marketplace/axies/${bookmark.id}">#${bookmark.id}</a>
          <div class="price-infos-fixed" style="margin-left: auto; white-space: nowrap;">Ξ</div>
        </div>
        <div class="w-1/5 text-right">
          <span class="AxieDexAxieDeleteBookmark" data-id="${bookmark.id}" style="cursor:pointer">❌</span>
        </div>
      </div>
      `;

      axiedexAxieBookmarksLinksContainer.append(SEARCH_BOOKMARK_LINK_HTML)
    }

    /* For all delete bookmark buttons ❌, attach a listener */
    $(".AxieDexAxieDeleteBookmark").on("click", function () {
      const id = $(this).data("id");
      const filteredBookmarks = bookmarks.filter((b: AxieBookmarkOption) => b.id != id);

      chrome.runtime.sendMessage(
        {
          contentScriptQuery: "updateAxieBookmarks",
          bookmarks: filteredBookmarks,
        },
        function () {
          setTimeout(async () => {
            $(".AxieDexSidebar").remove();
            $('[class*="Axies_ListingWrapper"]').removeClass("AxieDexCustomized")

            addBookmarksSidebar();

            /* Change the status of the bookmark button for the Axie card if it is on the page */
            const a = $(`[href*='/axies/${id}']`)[0] as HTMLAnchorElement;

            console.log("a", a)

            if (!a) {
              return;
            }

            // 2021.10.14 - Axie URLs have all changed to having a slash at the end. Remove that slash
            if (a.href[a.href.length - 1] == "/") {
              a.href = a.href.substring(0, a.href.length - 1);
            }

            const axieBookmarkButton = $(a).find(".AxieDexBookmarkButton");

            axieBookmarkButton.text("🔖 Bookmark");
            axieBookmarkButton.removeClass("AxieDexBookmarkButtonBookmarked");
            axieBookmarkButton.addClass("AxieDexBookmarkButtonUnbookmarked");

            /* Add a click listener when clicking on the bookmark button */
            const axieId = parseInt(a.href.substring(a.href.lastIndexOf("/") + 1));
            const axies = await getAxieInfo([axieId]);

            if (axies.length == 0) {
              return;
            }

            axieBookmarkButton.off("click").on("click", function () {
              addAxieBookmark(this, axies[0]);
              return false;
            });
          }, 100);
        }
      );
    });
  }

  /* Apply JQuery UI sortable to the search bookmarks container */
  $(function () {
    $(".AxieDexAxieBookmarksLinks").sortable({
      update: function () {
        handleAxieBookmarksSort();
      },
    });
  });
}

/**
 * Update the Axie bookmarks after sorting them
 */
async function handleAxieBookmarksSort() {
  const originalAxieBookmarks = OPTIONS[AXIE_BOOKMARKS] || [];
  const axieBookmarks: AxieBookmarkOption[] = [] ;

  $(".AxieDexAxieBookmarksLinks > .AxieDexAxieBookmark").each(function () {
    axieBookmarks.push({
      id: $(this).data("id"),
      class: $(this).data("class"),
    });
  });

  if (originalAxieBookmarks.length != axieBookmarks.length) {
    return;
  }

  chrome.runtime.sendMessage(
    {
      contentScriptQuery: "updateAxieBookmarks",
      bookmarks: axieBookmarks,
    },
    function () {
      setTimeout(() => {
        $(".AxieDexSidebar").remove();
        $('[class*="Axies_ListingWrapper"]').removeClass("AxieDexCustomized")

        addBookmarksSidebar();
      }, 100);
    }
  );
}

/**
 * Handler when clicking on the bookmark button for adding a bookmark
 * @param {HTMLElement} e - Bookmark button
 * @param {Axie} axie - Axie object containing the Axie information
 */
async function addAxieBookmark(e: HTMLElement, axie: Axie) {
  getOptions((response: Options) => {
    const axieBookmarks = response[AXIE_BOOKMARKS] as AxieBookmarkOption[];
    const alreadyBookmark = axieBookmarks.find((b: AxieBookmarkOption) => b.id == axie.id);

    if (alreadyBookmark) {
      return false;
    }

    axieBookmarks.push({ id: axie.id, class: axie.class });

    chrome.runtime.sendMessage(
      {
        contentScriptQuery: "updateAxieBookmarks",
        bookmarks: axieBookmarks,
      },
      function () {
        setTimeout(() => {
          $(".AxieDexSidebar").remove();
          $('[class*="Axies_ListingWrapper"]').removeClass("AxieDexCustomized")

          addBookmarksSidebar();
        }, 100);

        $(e).text("🔖 Unbookmark");
        $(e).removeClass("AxieDexBookmarkButtonUnbookmarked");
        $(e).addClass("AxieDexBookmarkButtonBookmarked");

        $(e).off("click").on("click", function () {
          removeAxieBookmark(this, axie);
          return false;
        });
      }
    );
  });
}

/**
 * Handler when clicking on the bookmark button for removing a bookmark
 * @param {HTMLElement} e - Bookmark button
 * @param {Axie} axie - Axie object containing the Axie information
 */
async function removeAxieBookmark(e: HTMLElement, axie: Axie) {
  getOptions(async (response: Options) => {
    const axieBookmarks = response[AXIE_BOOKMARKS] as AxieBookmarkOption[];
    const filteredBookmarks = axieBookmarks.filter((b: AxieBookmarkOption) => b.id != axie.id);

    chrome.runtime.sendMessage(
      {
        contentScriptQuery: "updateAxieBookmarks",
        bookmarks: filteredBookmarks,
      },
      function () {
        setTimeout(() => {
          $(".AxieDexSidebar").remove();
          $('[class*="Axies_ListingWrapper"]').removeClass("AxieDexCustomized")

          addBookmarksSidebar();
        }, 100);

        $(e).text("🔖 Bookmark");
        $(e).removeClass("AxieDexBookmarkButtonBookmarked");
        $(e).addClass("AxieDexBookmarkButtonunBookmarked");

        $(e).off("click").on("click", function () {
          addAxieBookmark(this, axie);
          return false;
        });
      }
    );
  });
}
