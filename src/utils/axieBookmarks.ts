/**
 * Utility methods for setting individual Axie bookmark buttons
 * @author tonystrawberry
 */

import { getAxieInfo } from "@/api/roninRest";
import { OPTIONS } from "@/initializers/options";
import { addBookmarksSidebar } from "@/pages/salesListPage";
import { AXIE_BOOKMARKS, getOptions } from "./options";

/**
 * Initialize the AxieDex search bookmark space in the sidebar
 * @param {JQuery<HTMLElement>} axieListingElement - Default Axie Listing Container element
 */
export const initializeAxiesBookmarkInSidebar = function (axieListingElement: JQuery<HTMLElement>) {
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
  const axieBookmarks: AxieBookmarkOption[] = [];

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
export const addAxieBookmark = async function (e: HTMLElement, axie: Axie) {
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
export const removeAxieBookmark = async function (e: HTMLElement, axie: Axie) {
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
