/**
 * Custom utility methods specific to AxieDex features
 * @author tonystrawberry
 */

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

  return `https://app.axieinfinity.com/marketplace/axies/?part=${backPartId}&part=${mouthPartId}&part=${hornPartId}&part=${tailPartId}&part=${eyesPartId}&part=${earsPartId}`;
};
