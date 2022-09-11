/**
 * Initializer file for the Axie possible body parts
 * Fetch from data/bodyParts.json
 * @author tonystrawberry
 */

export let BODY_PARTS_MAP: { [key: string]: AxieTraitDetails } = {};

/**
 * Initialize the BODY_PARTS_MAP by fetching data from data/bodyParts.json
 */
export const initializeBodyParts = async function () {
  const bodyParts = await fetch(chrome.runtime.getURL("data/bodyParts.json")).then((res) => res.json());

  for (let i in bodyParts) {
    BODY_PARTS_MAP[bodyParts[i].partId] = bodyParts[i];
  }
};
