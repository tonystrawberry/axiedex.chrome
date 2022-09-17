/**
 * Utility methods for setting search bookmark buttons
 * @author tonystrawberry
 */

import { OPTIONS } from "@/initializers/options";
import { addBookmarksSidebar } from "@/pages/salesListPage";
import { SEARCH_BOOKMARKS } from "@/utils/options";

/**
 * Initialize the AxieDex search bookmark space in the sidebar
 * @param {JQuery<HTMLElement>} axieListingElement - Default Axie Listing Container element
 */
export const initializeSearchBookmarkInSidebar = function (axieListingElement: JQuery<HTMLElement>) {
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
