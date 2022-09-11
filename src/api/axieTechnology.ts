/**
 * API Client serving as an interface between the contentScript file
 * and the API api.axie.technology
 * @author tonystrawberry
 */

import { genesToBin, getQualityAndPureness, getTraits } from "@/utils/dataExtractor";

/**
 * Fetch data of Axies and format them
 * @param axieIds
 * @returns Promise<Axie[]>
 */
export const getAxieInfo = async function (axieIds: number[]): Promise<Axie[]> {
  return new Promise((resolve, _reject) => {
    chrome.runtime.sendMessage(
      {
        contentScriptQuery: "getAxieInfo",
        axieIds: axieIds,
      },
      function (result: Axie | Axie[]) {
        const axies = Array.isArray(result) ? result : [result];

        for (const axie of axies) {
          if (axie && axie.stage && axie.stage > 2) {
            axie.genes = genesToBin(BigInt(axie.genes));
            axie.traits = getTraits(axie.genes);

            const qualityAndPureness = getQualityAndPureness(axie.traits, axie.class.toLowerCase());

            axie.quality = qualityAndPureness.quality;
            axie.pureness = qualityAndPureness.pureness;
          }
        }

        resolve(axies);
      }
    );
  });
};
