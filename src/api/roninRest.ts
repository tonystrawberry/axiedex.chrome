/**
 * API Client serving as an interface between the contentScript file
 * and the API ronin.rest
 * @author tonystrawberry
 */

import { getQualityAndPureness } from "@/utils/dataExtractor";

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
      function (axies: any) {
        const formattedAxies: Axie[] = []

        // For a single axie
        let responseAxies: any = {};

        if (axies.axie){
          responseAxies[axies.axie] = {
            _genes: axies.genes
          };
        } else {
          responseAxies = axies;
        }

        for (const axieId in responseAxies) {
          const axie = responseAxies[axieId];

          if (axie) {
            const parts = ["back", "tail", "mouth", "horn", "ears", "eyes"]
            for (const part of parts) {
              axie._genes[part].d.class = axie._genes[part].d.cls;
              axie._genes[part].r1.class = axie._genes[part].r1.cls;
              axie._genes[part].r2.class = axie._genes[part].r2.cls;
            }

            const axieTraits: AxieTraits = {
              cls: axie._genes.cls,
              region: axie._genes.region,
              pattern: axie._genes.pattern,
              color: axie._genes.color,
              back: axie._genes.back,
              tail: axie._genes.tail,
              mouth: axie._genes.mouth,
              horn: axie._genes.horn,
              ears: axie._genes.ears,
              eyes: axie._genes.eyes,
            }

            const qualityAndPureness = getQualityAndPureness(axieTraits, axie._genes.cls.toLowerCase());

            axie.quality = qualityAndPureness.quality;
            axie.pureness = qualityAndPureness.pureness;

            const formattedAxie: Axie = {
              id: parseInt(axieId),
              stage: 2,
              traits: axieTraits,
              genes: "",
              class: axie._genes.cls,
              quality: qualityAndPureness.quality,
              pureness: qualityAndPureness.pureness
            }

            formattedAxies.push(formattedAxie)
          }
        }

        resolve(formattedAxies);
      }
    );
  });
};
