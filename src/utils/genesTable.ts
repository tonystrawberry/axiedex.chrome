/**
 * Utility methods for getting an Axie genes table
 * @author tonystrawberry
 */

import { cardInfos } from "@/initializers/cardInfos";

const COLOR_MAP: any = {
  plant: "rgb(108, 192, 0)",
  reptile: "rgb(200, 138, 224)",
  beast: "rgb(255, 184, 18)",
  aquatic: "rgb(0, 184, 206)",
  bird: "rgb(255, 139, 189)",
  bug: "rgb(255, 83, 65)",
  egg: "#8d65ff",
};

type Position = "d" | "r1" | "r2";

/**
 * Returns a DOM Element containing all the genes for an Axie
 * @param {Axie} axie - Axie information
 */
export const getGenesTable = function (axie: Axie) {
  const genesTable = $(`<div class="AxieDexAxieGenesTable mt-20 mb-20" style="width: 100%; max-width: 100%; position: relative"></div>`);

  appendTrait(
    genesTable,
    { d: { name: "D" }, r1: { name: "R1" }, r2: { name: "R2" } },
    true
  );

  appendTrait(genesTable, axie.traits.eyes, false);
  appendTrait(genesTable, axie.traits.ears, false);
  appendTrait(genesTable, axie.traits.mouth, false);
  appendTrait(genesTable, axie.traits.horn, false);
  appendTrait(genesTable, axie.traits.back, false);
  appendTrait(genesTable, axie.traits.tail, false);

  const genesTableContainer = $(`<div style="width: 100%; padding: 10px; font-size: 12px;"></div>`);
  genesTableContainer.append(genesTable);

  return genesTableContainer;
}

/**
 * Append the genes name to the container
 * @param {JQuery<HTMLElement>} table - Table containing all the genes data
 * @param {AxieTrait} trait - AxieTrait that contains all D, R1, R2 for a particular part
 * @param {boolean} isHeader - True if the current trait to display is for the header ('D', 'R1' and 'R2')
 */
function appendTrait(table: JQuery<HTMLElement>, trait: AxieTrait, isHeader = false) {
  const tr = $(`<div class="AxieDexAxieGenesRow flex" style="width:100%; max-width:100%;"></div>`);

  if (isHeader) { tr.addClass("font-bold text-gray-1"); }

  const mystic = trait["mystic"];
  for (let position in trait) {
    if (position == "mystic") continue;

    const geneContainer = $('<div class="AxieDexAxieGene" style="width:33.33%; max-width:33.33%; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;"></div>');
    const span = $("<span></span>");

    if (trait[position as Position].hasOwnProperty("class")) {
      const geneClass: string = trait[position as Position].class as string;
      span.css("color", COLOR_MAP[geneClass]);
    }
    span.text(trait[position as Position].name);

    /* if the trait is mystic, just show a * */
    if (position == "d" && mystic) {
      span.append("*");
    }

    geneContainer.append(span);

    appendCardData(geneContainer, span, trait[position as Position]);
    tr.append(geneContainer);
  }

  table.append(tr);
}

/**
 * Append the picture to the container gene element
 * @param {JQuery<HTMLElement>} geneContainer - Container element containing the name of the gene as well as the picture
  * @param {JQuery<HTMLElement>} textElement - Text element containing the name of the gene (card will be displayed when hovering over this text)
  * @param {AxieTraitDetails} traitDetails -
 */
function appendCardData(geneContainer: JQuery<HTMLElement>, textElement: JQuery<HTMLElement>, traitDetails: AxieTraitDetails) {
  const cardData = cardInfos.find((cardInfo) => cardInfo["partId"] == traitDetails["partId"]);

  if (cardData) {
    /* cards will be appended to .AxieDexAxieCardPicture */
    geneContainer.append('<div class="AxieDexAxieCardPicture"></div>');

    const pictureUrl = chrome.runtime.getURL(`images/originCards/${cardData["partId"]}.png`);

    const cardElement = $(`
      <div class="text-white" style="display: none; width: 200px; z-index: 99999999;">
        <img class="absolute w-full" style="z-index: 99999999;"src="${pictureUrl}" onerror="this.onerror=null; this.src=''">
      </div>
    `);

    geneContainer.find(".AxieDexAxieCardPicture").append(cardElement);

    $(textElement).on("mouseover", () => { cardElement.show(); });
    $(textElement).on("mouseout", () => { cardElement.hide(); });
  }
}
