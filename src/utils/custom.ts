/**
 * Custom utility methods specific to AxieDex features
 * @author tonystrawberry
 */

import { EYES_EARS_GENES_SEARCH_INCLUDED, EYES_EARS_GENES_PURITY_INCLUDED } from "@/utils/options";
import { OPTIONS } from "@/initializers/options";

/**
 * Build a link searching for similar Axies from an Axie object
 * @param {Axie} axie - An Axie Object
 */
export const buildSimilarAxieLink = function (axie: Axie) {
  if (axie.stage == 1) {
    return "";
  }
  const backPartId = axie.traits.back.d.partId;
  const mouthPartId = axie.traits.mouth.d.partId;
  const hornPartId = axie.traits.horn.d.partId;
  const tailPartId = axie.traits.tail.d.partId;
  const eyesPartId = axie.traits.eyes.d.partId;
  const earsPartId = axie.traits.ears.d.partId;

  if (OPTIONS[EYES_EARS_GENES_SEARCH_INCLUDED]) {
    return `https://app.axieinfinity.com/marketplace/axies/?part=${backPartId}&part=${mouthPartId}&part=${hornPartId}&part=${tailPartId}&part=${eyesPartId}&part=${earsPartId}`;
  } else {
    return `https://app.axieinfinity.com/marketplace/axies/?part=${backPartId}&part=${mouthPartId}&part=${hornPartId}&part=${tailPartId}`;
  }
};

const GENES_PROBABILITIES_WITHOUT_EARS_EYES = {
  r1: 0.1875,
  r2: 0.0625,
};

const GENES_PROBABILITIES_WITH_EARS_EYES = {
  r1: 0.125,
  r2: 0.041666,
};

const PARTS: ("eyes" | "mouth" | "ears" | "horn" | "back" | "tail")[] = ["eyes", "mouth", "ears", "horn", "back", "tail"];

/**
 * Compute an Axie genes quality in percentage
 * @param {Axie} axie - An Axie Object
 */
export const getGenesQuality = function (axie: Axie) {
  let quality = 0;
  /* For [horn, mouth, back, tail] check if genes is same as dominant genes */
  const traits = axie.traits;

  for (let i in PARTS) {
    const GENES = OPTIONS[EYES_EARS_GENES_PURITY_INCLUDED] ? GENES_PROBABILITIES_WITH_EARS_EYES : GENES_PROBABILITIES_WITHOUT_EARS_EYES;
    if (PARTS[i] === "eyes" || PARTS[i] === "ears") {
      if (OPTIONS[EYES_EARS_GENES_PURITY_INCLUDED]) {
        const dominantPartClass = traits[PARTS[i]].d.class;
        if (traits[PARTS[i]].r1.class === dominantPartClass) {
          quality += GENES.r1;
        }
        if (traits[PARTS[i]].r2.class === dominantPartClass) {
          quality += GENES.r2;
        }
      }
      continue;
    }

    const dominantPartId = traits[PARTS[i]].d.partId;
    if (traits[PARTS[i]].r1.partId === dominantPartId) {
      quality += GENES.r1;
    }
    if (traits[PARTS[i]].r2.partId === dominantPartId) {
      quality += GENES.r2;
    }
  }

  return quality;
};
