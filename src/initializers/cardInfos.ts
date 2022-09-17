/**
 * Initializer file for the Axie cards information
 * @author tonystrawberry
 */

export let cardInfos: any[] = [];

export const initializeCardInfos = async function () {
  cardInfos = await fetch(chrome.runtime.getURL("data/cardInfos.json")).then((res) => res.json());
}
