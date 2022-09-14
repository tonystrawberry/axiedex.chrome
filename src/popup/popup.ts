/**
 * Utility methods for handling the user preferences (options)
 * @author tonystrawberry
 */
import { putOption, getOptions, resetOptions} from "@/utils/options"

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

const optionsKeys = [
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
  USER,
];

/**
 * Script for the AxieDex extension popup
 * @author tonystrawberry
 */

/* State variables */
declare const firebase: any;
declare const firebaseui: any;

var currentUser: any = null;
var currentCustomer: any = null;
var ui: any = null;
var db: any = null;

/* HTML Elements to be injected */
const newPurityRow = `
<div class="row my-2 align-items-center rowPurity">
  <div class="col-3 px-2">
    <div class="input-group">
      <select class="typeSelect custom-select">
        <option disabled>Select</option>
        %TYPE_SELECT_OPTIONS%
      </select>
    </div>
  </div>
  <div class="col-3 px-2">
    <div class="input-group">
      <select class="puritySelect custom-select">
        <option disabled>Select</option>
        %PURITY_SELECT_OPTIONS%
      </select>
    </div>
  </div>
  <div class="col-4 px-2">
    <div class="input-group">
      <input type="text" class="form-control purityColor" placeholder="Color" aria-label="Color" value="%COLOR%">
    </div>
  </div>
  <div class="text-center col-2 px-2">
    <span class="oi oi-x" id="%DELETE_ID%"></span>
  </div>
</div>
`;

const purityNotPaid = `
  <div class="mt-2 mb-4" id="purityNotPaid">
    <div class="alert alert-info fade show" role="alert">
      Purity Highlight is a paid feature. Make a one-time payment and get access to Purity Highlight to get your perfect Axies!
    </div>
    <button type="button" class="w-100 btn btn-success openPayment">🎉 Upgrade now (25$)</button>
    <div class="alert alert-warning fade show mt-4" role="alert">
      If you wish to pay by WETH, SLP or AXS, please follow the instructions on the <a href="https://discord.com/channels/899560000765165569/901460618178072617/901462948457897984" target="_blank">AxieDex official Discord server</a> or <a href="https://tonystrawberry.github.io/axiedex#ronin-wallet-slp-axs-or-weth" target="_blank">AxieDex home page</a>.
    </div>
  </div>
`;

const planItem = `
<div id="%METADATA_CLASS%" class="axiedex-alerts-item alert %METADATA_CLASS% w-100" role="alert" click="">
  <div class="content d-flex align-items-center">
    <div style="display: flex;
                flex-direction: column;
                justify-content: center;">
      <span style="font-size: 30px;font-weight: bold;">%NAME%</span>
      <small>%DESCRIPTION%</small>
    </div>
    <div class="price ml-auto"
      style="display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;"
    ><span style="font-size: 30px;font-weight: bold;">$%PRICE%</span><small>per month</small></div>
  </div>
</div>
`;

let storedOpts: Options;

/**
 * Initialize method called when the popup opens
 */
function init() {
  getOptions((response: Options) => {
    storedOpts = response;

    if (storedOpts && storedOpts[PURITY_TABLE]) {
      for (const i in storedOpts[PURITY_TABLE]) {
        if (!storedOpts[PURITY_TABLE][i].type || storedOpts[PURITY_TABLE][i].type == "D") {
          storedOpts[PURITY_TABLE][i].type = "C";
        }
      }
      putOption(PURITY_TABLE, storedOpts[PURITY_TABLE]);
    }

    // Reset the options if the number of keys differs
    if (Object.keys(storedOpts).length != optionsKeys.length) {
      storedOpts = resetOptions(storedOpts);
    }

    /* Set the UI to the correct state */
    const extensionEnabled = storedOpts[EXTENSION_ENABLED];
    $("#extensionEnabled").prop("checked", extensionEnabled);

    const hideAxies = storedOpts[HIDE_AXIES];
    $("#hideAxies").prop("checked", hideAxies);

    const onlyPopup = storedOpts[ONLY_POPUP];
    $("#onlyPopup").prop("checked", onlyPopup);

    const similarAxiesEnabled = storedOpts[SIMILAR_AXIES_ENABLED];
    $("#similarAxiesEnabled").prop("checked", similarAxiesEnabled);

    const genesPurityEnabled = storedOpts[SHOW_GENES_PURITY];
    $("#genesPurityEnabled").prop("checked", genesPurityEnabled);

    const eyesEarsGenesPurityIncluded = storedOpts[EYES_EARS_GENES_PURITY_INCLUDED];
    $("#eyesEarsGenesPurityIncluded").prop("checked", eyesEarsGenesPurityIncluded);

    const eyesEarsGenesSearchIncluded = storedOpts[EYES_EARS_GENES_SEARCH_INCLUDED];
    $("#eyesEarsGenesSearchIncluded").prop("checked", eyesEarsGenesSearchIncluded);

    const showAuctions = storedOpts[SHOW_AUCTIONS];
    $("#showAuctions").prop("checked", showAuctions);

    const showHatch = storedOpts[SHOW_HATCH];
    $("#showHatch").prop("checked", showHatch);

    // Once the preferences are set, initialize Firebase
    firebase.auth().onAuthStateChanged(async (user: User) => {
      initFirebaseUser(user);
    });
  });

  /**
   * Set the listeners for elements (click) on the UI
   */
  $("#addPurity").on("click", () => {
    let lastType: string | undefined = $("#purityTable .rowPurity:last-child").find(".typeSelect :selected").val() as string | undefined;
    let lastPurity: number | undefined = $("#purityTable .rowPurity:last-child").find(".puritySelect :selected").val() as number | undefined;
    let lastColor: string | undefined = $("#purityTable .rowPurity:last-child").find(".purityColor").val() as string | undefined;
    let numRowPurity: number = $(".rowPurity").length;

    if (!lastType) {
      lastType = "C";
    }

    if (lastPurity && !isNaN(lastPurity)) {
      lastPurity = Math.max(lastPurity - 1, 0);
    } else {
      lastPurity = 100;
    }

    if (!lastColor || lastColor == "") {
      lastColor = "#000000";
    }

    const replacements: any = {
      "%PURITY_SELECT_OPTIONS%": buildPuritySelectOptions(lastPurity),
      "%TYPE_SELECT_OPTIONS%": buildTypeSelectOptions(lastType),
      "%TYPE_VALUE%": lastType,
      "%PURITY_VALUE%": lastPurity,
      "%COLOR%": lastColor,
      "%DELETE_ID%": `rowPurityDelete_${numRowPurity}`,
    };

    const newPurityRowReplaced = newPurityRow.replace(/%\w+%/g, function (all) {
      return replacements[all] || all;
    });

    $("#purityTable").append(newPurityRowReplaced);

    $(`#rowPurityDelete_${numRowPurity}`).click(function () {
      $(this).closest(".rowPurity").remove();
    });
  });

  $("#updatePurity").on("click", function () {
    const purities: PurityTableOption[] = [];

    $(".rowPurity").each(function () {
      const type: string = $(this).find(".typeSelect :selected").val() as string;
      const purity: number = $(this).find(".puritySelect :selected").val() as number;
      const color: string = $(this).find(".purityColor").val() as string;

      // If a purity already exists, do not add it again
      if (purities.find((addedPurity) => addedPurity.type == type && addedPurity.purity == purity)) {
        return;
      }

      if (!isHexColor(color) || !isValidPurity(purity)) {
        $(".alert").hide();
        return;
      }

      purities.push({ type: type, purity: purity, color: color });
    });

    putOption(PURITY_TABLE, purities);

    $(".alert").hide();
  });

  $("#extensionEnabled").on("click", function () {
    putOption(EXTENSION_ENABLED, $(this).is(":checked"));
  });

  $("#hideAxies").on("click", function () {
    putOption(HIDE_AXIES, $(this).is(":checked"));
  });

  $("#onlyPopup").on("click", function () {
    putOption(ONLY_POPUP, $(this).is(":checked"));
  });

  $("#similarAxiesEnabled").on("click", function () {
    putOption(SIMILAR_AXIES_ENABLED, $(this).is(":checked"));
  });

  $("#genesPurityEnabled").on("click", function () {
    putOption(SHOW_GENES_PURITY, $(this).is(":checked"));
  });

  $("#eyesEarsGenesPurityIncluded").on("click", function () {
    putOption(EYES_EARS_GENES_PURITY_INCLUDED, $(this).is(":checked"));
  });

  $("#eyesEarsGenesSearchIncluded").on("click", function () {
    putOption(EYES_EARS_GENES_SEARCH_INCLUDED, $(this).is(":checked"));
  });

  $("#showAuctions").on("click", function () {
    putOption(SHOW_AUCTIONS, $(this).is(":checked"));
  });

  $("#showHatch").on("click", function () {
    putOption(SHOW_HATCH, $(this).is(":checked"));
  });
}

/**
 * Initialize the user with the Firebase data and update UI accordingly
 * @param {User} user
 */
async function initFirebaseUser(user: User) {
  if (user) {
    /********************/
    /*** User connected */
    /********************/

    let customerDocument = await db.collection("customers").doc(user.uid).get();

    putOption(USER_UID, user.uid);
    currentCustomer = customerDocument.data();

    // In case the user does not exist, create it in the 'customers' table in Firebase
    if (!customerDocument.exists) {
      db.collection("customers").doc(user.uid).set({
        email: user.email,
        original_pro: false,
        registered: false,
      });

      let customerDocument = await db.collection("customers").doc(user.uid).get();
      currentCustomer = customerDocument.data();
    }

    currentUser = currentCustomer;
    currentUser.uid = user.uid;
    const customerSubscriptions = await getCustomerPaymentAndSubscriptions();

    currentUser.isPro = currentCustomer.original_pro || customerSubscriptions.isPro;

    putOption(USER, currentUser);

    if (currentUser.isPro) {
      const purityTable = storedOpts[PURITY_TABLE];

      if (!purityTable) {
        return;
      }

      for (let i = 0; i < purityTable.length; i++) {
        const type = purityTable[i].type;
        const purity = purityTable[i].purity;
        const color = purityTable[i].color;
        const replacements: any = {
          "%PURITY_SELECT_OPTIONS%": buildPuritySelectOptions(purity),
          "%TYPE_SELECT_OPTIONS%": buildTypeSelectOptions(type),
          "%TYPE_VALUE%": type,
          "%PURITY_VALUE%": purity,
          "%COLOR%": color,
          "%DELETE_ID%": `rowPurityDelete_${i}`,
        };

        const newPurityRowReplaced = newPurityRow.replace(/%\w+%/g, function (all) {
          return replacements[all] || all;
        });

        $("#purityTable").append(newPurityRowReplaced);

        $(`#rowPurityDelete_${i}`).click(function () {
          $(this).closest(".rowPurity").remove();
        });
      }
    } else {
      if ($("#purityNotPaid").length == 0) {
        $("#purityTable").append(purityNotPaid);
      }
      $("#hideAxiesFormCheck").hide();
      $("#purityActions").hide();
      $("#purityTableHeader").hide();
      $(`.openPayment`).click(function () {
        openStripeCheckout("price_1KG7beGQXlqiDDLJif5NSHkf", "payment");
      });
    }

    $("#members-portal").remove();
    $("#purity").show();
  } else {
    /************************/
    /*** User not connected */
    /************************/

    $("#members-portal").show();
    $("#purity").hide();
    $("#hideAxiesFormCheck").hide();
    $("#purityActions").hide();
    $("#purityTableHeader").hide();

    if ($("#purityNotPaid").length == 0) {
      $("#purityTable").append(purityNotPaid);
    }

    // Show the Firebase login element
    // for a non-logged in user
    ui.start("#firebaseui-auth-container", uiConfig);
  }
}

/**
 * Build the HTML string for the type (C, G) options of the purity settings
 * @param {string} type
 */
function buildTypeSelectOptions(type: string) {
  let optionHtml = "";
  const options = ["C", "G"];
  for (const option of options) {
    if (option == type) {
      optionHtml += `<option selected value="${type}">${type}</option>`;
    } else {
      optionHtml += `<option value="${option}">${option}</option>`;
    }
  }

  return optionHtml;
}

/**
 * Build the HTML string for the purity (from 0 to 100) options of the purity settings
 * @param {string} purity
 */
function buildPuritySelectOptions(purity: number) {
  let optionHtml = "";
  for (let i = 100; i >= 0; i--) {
    if (purity == i) {
      optionHtml += `<option selected value="${i}">${i}</option>`;
    } else {
      optionHtml += `<option value="${i}">${i}</option>`;
    }
  }

  return optionHtml;
}

/**
 * Utility method to check if the provided string a HEX color code
 * @param {string} purity
 */
function isHexColor(hex: string) {
  return /^#[0-9A-F]{6}$/i.test(hex);
}

/**
 * Utility method to check if the provided purity has a valid number value between 0 and 100
 * @param {string} purity
 */
function isValidPurity(purity: number) {
  return !isNaN(purity) && purity >= 0 && purity <= 100;
}

/**
 * Start of the script
 *  - Init everything (firebase, options, current user data)
 **/
jQuery(() => {
  init();
});

/**
 * Firebase configuration
 * @author tonystrawberry
 */

/* Firebase configuration */
const firebaseConfig = {
  apiKey: "AIzaSyB5nYhXUKZ0_7yMCZo_acL72Q0vES3Hu0c",
  authDomain: "chrome-extension://fpbklhnhkclhcjndkgppjfpdbojjnili",
  projectId: "axiedex-8d9fc",
  storageBucket: "axiedex-8d9fc.appspot.com",
  messagingSenderId: "806360415896",
  appId: "1:806360415896:web:60fb1926a8e994dca6daed",
  measurementId: "${config.measurementId}",
};

const uiConfig = {
  callbacks: {
    signInSuccess: function (user: any, _credential: any, _redirectUrl: any) {
      currentUser = user;
      return false;
    },
  },
  signInFlow: "popup", // Will use popup for IDP Providers sign-in flow instead of the default redirect
  signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
  tosUrl: "https://www.firebase.com/", // AxieDex Terms of service URL
  privacyPolicyUrl: "https://www.firebase.com/", // AxieDex Privacy policy URL
};

/********************************************************/
/*** Methods for interacting with Firebase and Stripe ***/
/********************************************************/

async function getCustomerPaymentAndSubscriptions() {
  const data: any = {
    isPro: null,
  };

  const paymentsSnapshot = await db.collection("customers").doc(currentUser.uid).collection("payments").where("status", "in", ["succeeded"]).get();

  const payments = paymentsSnapshot.docs;
  for (const i in payments) {
    const payment = payments[i];
    for (const j in payment.data().items) {
      const item = payment.data().items[j];
      if (item.price.id == "price_1KG7beGQXlqiDDLJif5NSHkf") {
        data.isPro = true;
        break;
      }

      if (data.isPro) break;
    }
  }

  return data;
}

async function redirectToCustomerPortal() {
  const functionRef = firebase.app().functions("us-central1").httpsCallable("ext-firestore-stripe-payments-createPortalLink");
  const { data } = await functionRef({ returnUrl: "https://axiedex.notion.site/See-you-soon-31efc244f7294199ad0a4b7345af41ae" });

  chrome.windows.create({ url: data.url, type: "popup" }, function (window: any) {
    if (window) {
      window.close();
    }
  });
}

async function openStripeCheckout(priceId: string, mode: string | null = null) {
  const stripeCheckoutSession: any = {
    price: priceId,
    success_url: "https://axiedex.notion.site/You-have-subscribed-to-AxieDex-Alerts-a61488209f8d4c15bf16443c1edd2c77/",
    cancel_url: "https://axiedex.notion.site/See-you-soon-31efc244f7294199ad0a4b7345af41ae",
    allow_promotion_codes: true,
    mode: null,
  };

  if (mode) {
    stripeCheckoutSession.mode = mode;
    if (mode == "payment") {
      stripeCheckoutSession.success_url = "https://axiedex.notion.site/You-got-your-PRO-Membership-87db543101fb4764877b347b7f5ee535";
    }
  }

  const docRef = await db.collection("customers").doc(currentUser.uid).collection("checkout_sessions").add(stripeCheckoutSession);

  // Wait for the CheckoutSession to get attached by the extension
  docRef.onSnapshot((snapshot: any) => {
    const { error, url } = snapshot.data();

    if (error) {
      // Show an error to your customer and
      // inspect your Cloud Function logs in the Firebase console.
      alert(`An error occured: ${error.message}`);
    }
    if (url) {
      // We have a Stripe Checkout URL, let's redirect
      chrome.windows.create({ url: url, type: "popup" }, function (_w) {
        window.close();
      });
    }
  });
}

/**
 * Start of the script
 *  - Initialize Firebase with the provided configuration
 *  - Initialize the Firebase UI (for showing the login module)
 *  - Initialize the Firestore DB (for connecting with the database and get user information)
 */

/* Initialize the FirebaseUI Widget using Firebase */
firebase.initializeApp(firebaseConfig);
ui = new firebaseui.auth.AuthUI(firebase.auth());
db = firebase.firestore();
