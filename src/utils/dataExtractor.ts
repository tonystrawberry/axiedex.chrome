/**
 * Utility methods for extracting useful data for raw data returned by the GraphQL API or api.axie.technology API
 * @author tonystrawberry
 */

import { BODY_PARTS_MAP } from "@/initializers/bodyParts";

/**
 * Constants used in the utility methods
 *   - REGION_GENE_MAP
 *   - CLASS_GENE_MAP
 *   - REGION_GENE_MAP
 *   - BINARY_TRAITS
 *   - PARTS
 *   - PROBABILITIES
 *   - MAX_QUALITY
 */

const REGION_GENE_MAP: { [key: string]: string } = {
  "00000": "global",
  "00001": "japan",
};

const CLASS_GENE_MAP: { [key: string]: string } = {
  "0000": "beast",
  "0001": "bug",
  "0010": "bird",
  "0011": "plant",
  "0100": "aquatic",
  "0101": "reptile",
  "1000": "???",
  "1001": "???",
  "1010": "???",
};

const GENE_COLOR_MAP: { [key: string]: { [key: string]: string } } = {
  "0000": {
    "0010": "ffec51",
    "0011": "ffa12a",
    "0100": "f0c66e",
    "0110": "60afce",
  },
  "0001": {
    "0010": "ff7183",
    "0011": "ff6d61",
    "0100": "f74e4e",
  },
  "0010": {
    "0010": "ff9ab8",
    "0011": "ffb4bb",
    "0100": "ff778e",
  },
  "0011": {
    "0010": "ccef5e",
    "0011": "efd636",
    "0100": "c5ffd9",
  },
  "0100": {
    "0010": "4cffdf",
    "0011": "2de8f2",
    "0100": "759edb",
    "0110": "ff5a71",
  },
  "0101": {
    "0010": "fdbcff",
    "0011": "ef93ff",
    "0100": "f5e1ff",
    "0110": "43e27d",
  },
  // nut hidden_1
  "1000": {
    "0010": "D9D9D9",
    "0011": "D9D9D9",
    "0100": "D9D9D9",
    "0110": "D9D9D9",
  },
  // star hidden_2
  "1001": {
    "0010": "D9D9D9",
    "0011": "D9D9D9",
    "0100": "D9D9D9",
    "0110": "D9D9D9",
  },
  // moon hidden_3
  "1010": {
    "0010": "D9D9D9",
    "0011": "D9D9D9",
    "0100": "D9D9D9",
    "0110": "D9D9D9",
  },
};

const BINARY_TRAITS: { [key: string]: { [key: string]: { [key: string]: { [key: string]: string } } } } = {
  beast: {
    eyes: {
      "001000": { global: "Puppy" },
      "000010": { global: "Zeal", mystic: "Calico Zeal" },
      "000100": { global: "Little Peas", xmas: "Snowflakes" },
      "001010": { global: "Chubby" },
    },
    ears: {
      "001010": { global: "Puppy" },
      "000100": { global: "Nut Cracker" },
      "000010": { global: "Nyan", mystic: "Pointy Nyan" },
      "000110": { global: "Innocent Lamb", xmas: "Merry Lamb" },
      "001000": { global: "Zen" },
      "001100": { global: "Belieber" },
    },
    back: {
      "001000": { japan: "Hamaya", global: "Risky Beast" },
      "000100": { global: "Hero" },
      "000110": { global: "Jaguar" },
      "000010": { mystic: "Hasagi", global: "Ronin" },
      "001010": { global: "Timber" },
      "001100": { global: "Furball" },
    },
    horn: {
      "001000": { japan: "Umaibo", global: "Pocky" },
      "000100": { global: "Imp", japan: "Kendama" },
      "000110": { global: "Merry" },
      "000010": { mystic: "Winter Branch", global: "Little Branch" },
      "001010": { global: "Dual Blade" },
      "001100": { global: "Arco" },
    },
    tail: {
      "000100": { global: "Rice" },
      "000010": { global: "Cottontail", mystic: "Sakura Cottontail" },
      "000110": { global: "Shiba" },
      "001000": { global: "Hare" },
      "001010": { global: "Nut Cracker" },
      "001100": { global: "Gerbil" },
    },
    mouth: {
      "000100": { global: "Goda" },
      "000010": { global: "Nut Cracker", mystic: "Skull Cracker" },
      "001000": { global: "Axie Kiss" },
      "001010": { global: "Confident" },
    },
  },
  bug: {
    mouth: {
      "001000": { japan: "Kawaii", global: "Cute Bunny" },
      "000010": { global: "Mosquito", mystic: "Feasting Mosquito" },
      "000100": { global: "Pincer" },
      "001010": { global: "Square Teeth" },
    },
    horn: {
      "001010": { global: "Parasite" },
      "000010": { global: "Lagging", mystic: "Laggingggggg" },
      "000110": { global: "Caterpillars" },
      "000100": { global: "Antenna" },
      "001000": { global: "Pliers" },
      "001100": { global: "Leaf Bug" },
    },
    tail: {
      "001000": { global: "Gravel Ant" },
      "000010": { mystic: "Fire Ant", global: "Ant" },
      "000100": { global: "Twin Tail" },
      "000110": { global: "Fish Snack", japan: "Maki" },
      "001010": { global: "Pupae" },
      "001100": { global: "Thorny Caterpillar" },
    },
    back: {
      "001000": { global: "Sandal" },
      "000010": { global: "Snail Shell", mystic: "Starry Shell" },
      "000100": { global: "Garish Worm", xmas: "Candy Canes" },
      "000110": { global: "Buzz Buzz" },
      "001010": { global: "Scarab" },
      "001100": { global: "Spiky Wing" },
    },
    ears: {
      "000010": { global: "Larva", mystic: "Vector" },
      "000110": { global: "Ear Breathing" },
      "000100": { global: "Beetle Spike" },
      "001000": { global: "Leaf Bug" },
      "001010": { global: "Tassels" },
      "001100": { japan: "Mon", global: "Earwing" },
    },
    eyes: {
      "000010": { global: "Bookworm", mystic: "Broken Bookworm" },
      "000100": { global: "Neo" },
      "001010": { global: "Kotaro?" },
      "001000": { global: "Nerdy" },
    },
  },
  aquatic: {
    eyes: {
      "001000": { global: "Gero" },
      "000010": { global: "Sleepless", mystic: "Insomnia", japan: "Yen" },
      "000100": { global: "Clear" },
      "001010": { global: "Telescope" },
    },
    mouth: {
      "001000": { global: "Risky Fish" },
      "000100": { global: "Catfish" },
      "000010": { global: "Lam", mystic: "Lam Handsome" },
      "001010": { global: "Piranha", japan: "Geisha" },
    },
    horn: {
      "001100": { global: "Shoal Star" },
      "000110": { global: "Clamshell" },
      "000010": { global: "Babylonia", mystic: "Candy Babylonia" },
      "000100": { global: "Teal Shell" },
      "001000": { global: "Anemone" },
      "001010": { global: "Oranda" },
    },
    ears: {
      "000010": { global: "Nimo", mystic: "Red Nimo" },
      "000110": { global: "Bubblemaker" },
      "000100": { global: "Tiny Fan" },
      "001000": { global: "Inkling" },
      "001010": { global: "Gill" },
      "001100": { global: "Seaslug" },
    },
    tail: {
      "000010": { global: "Koi", mystic: "Kuro Koi", japan: "Koinobori" },
      "000110": { global: "Tadpole" },
      "000100": { global: "Nimo" },
      "001010": { global: "Navaga" },
      "001000": { global: "Ranchu" },
      "001100": { global: "Shrimp" },
    },
    back: {
      "000010": { global: "Hermit", mystic: "Crystal Hermit" },
      "000100": { global: "Blue Moon" },
      "000110": { global: "Goldfish" },
      "001010": { global: "Anemone" },
      "001000": { global: "Sponge" },
      "001100": { global: "Perch" },
    },
  },
  bird: {
    ears: {
      "001100": { japan: "Karimata", global: "Risky Bird" },
      "000010": { global: "Pink Cheek", mystic: "Heart Cheek" },
      "000100": { global: "Early Bird" },
      "000110": { global: "Owl" },
      "001010": { global: "Curly" },
      "001000": { global: "Peace Maker" },
    },
    tail: {
      "001010": { japan: "Omatsuri", global: "Granma's Fan" },
      "000010": { global: "Swallow", mystic: "Snowy Swallow" },
      "000100": { global: "Feather Fan" },
      "000110": { global: "The Last One" },
      "001000": { global: "Cloud" },
      "001100": { global: "Post Fight" },
    },
    back: {
      "000010": { global: "Balloon", mystic: "Starry Balloon" },
      "000110": { global: "Raven" },
      "000100": { global: "Cupid", japan: "Origami" },
      "001000": { global: "Pigeon Post" },
      "001010": { global: "Kingfisher" },
      "001100": { global: "Tri Feather" },
    },
    horn: {
      "000110": { global: "Trump" },
      "000010": { global: "Eggshell", mystic: "Golden Shell" },
      "000100": { global: "Cuckoo" },
      "001000": { global: "Kestrel" },
      "001010": { global: "Wing Horn" },
      "001100": { global: "Feather Spear", xmas: "Spruce Spear" },
    },
    mouth: {
      "000010": { global: "Doubletalk", mystic: "Mr. Doubletalk" },
      "000100": { global: "Peace Maker" },
      "001000": { global: "Hungry Bird" },
      "001010": { global: "Little Owl" },
    },
    eyes: {
      "000010": { global: "Mavis", mystic: "Sky Mavis" },
      "000100": { global: "Lucas" },
      "001010": { global: "Robin" },
      "001000": { global: "Little Owl" },
    },
  },
  reptile: {
    eyes: {
      "001010": { japan: "Kabuki", global: "Topaz" },
      "000100": { global: "Tricky" },
      "000010": { global: "Gecko", mystic: "Crimson Gecko" },
      "001000": { global: "Scar", japan: "Dokuganryu" },
    },
    mouth: {
      "001000": { global: "Razor Bite" },
      "000100": { global: "Kotaro" },
      "000010": { global: "Toothless Bite", mystic: "Venom Bite" },
      "001010": { global: "Tiny Turtle", japan: "Dango" },
    },
    ears: {
      "001000": { global: "Small Frill" },
      "000110": { global: "Curved Spine" },
      "000100": { global: "Friezard" },
      "000010": { global: "Pogona", mystic: "Deadly Pogona" },
      "001010": { global: "Swirl" },
      "001100": { global: "Sidebarb" },
    },
    back: {
      "001000": { global: "Indian Star" },
      "000010": { global: "Bone Sail", mystic: "Rugged Sail" },
      "000100": { global: "Tri Spikes" },
      "000110": { global: "Green Thorns" },
      "001010": { global: "Red Ear" },
      "001100": { global: "Croc" },
    },
    tail: {
      "000100": { global: "Iguana" },
      "000010": { global: "Wall Gecko", mystic: "Escaped Gecko" },
      "000110": { global: "Tiny Dino" },
      "001000": { global: "Snake Jar", xmas: "December Surprise" },
      "001010": { global: "Gila" },
      "001100": { global: "Grass Snake" },
    },
    horn: {
      "000010": { global: "Unko", mystic: "Pinku Unko" },
      "000110": { global: "Cerastes" },
      "000100": { global: "Scaly Spear" },
      "001010": { global: "Incisor" },
      "001000": { global: "Scaly Spoon" },
      "001100": { global: "Bumpy" },
    },
  },
  plant: {
    tail: {
      "001000": { global: "Yam" },
      "000010": { global: "Carrot", mystic: "Namek Carrot" },
      "000100": { global: "Cattail" },
      "000110": { global: "Hatsune" },
      "001010": { global: "Potato Leaf" },
      "001100": { global: "Hot Butt" },
    },
    mouth: {
      "000100": { global: "Zigzag", xmas: "Rudolph" },
      "000010": { global: "Serious", mystic: "Humorless" },
      "001000": { global: "Herbivore" },
      "001010": { global: "Silence Whisper" },
    },
    eyes: {
      "000010": { global: "Papi", mystic: "Dreamy Papi" },
      "000100": { global: "Confused" },
      "001010": { global: "Blossom" },
      "001000": { global: "Cucumber Slice" },
    },
    ears: {
      "000010": { global: "Leafy", mystic: "The Last Leaf" },
      "000110": { global: "Rosa" },
      "000100": { global: "Clover" },
      "001000": { global: "Sakura", japan: "Maiko" },
      "001010": { global: "Hollow" },
      "001100": { global: "Lotus" },
    },
    back: {
      "000110": { global: "Bidens" },
      "000100": { global: "Shiitake", japan: "Yakitori" },
      "000010": { global: "Turnip", mystic: "Pink Turnip" },
      "001010": { global: "Mint" },
      "001000": { global: "Watering Can" },
      "001100": { global: "Pumpkin" },
    },
    horn: {
      "000100": { global: "Beech", japan: "Yorishiro" },
      "000110": { global: "Rose Bud" },
      "000010": { global: "Bamboo Shoot", mystic: "Golden Bamboo Shoot" },
      "001010": { global: "Cactus" },
      "001000": { global: "Strawberry Shortcake" },
      "001100": { global: "Watermelon" },
    },
  },
};

const PARTS: ("eyes" | "mouth" | "ears" | "horn" | "back" | "tail")[] = ["eyes", "mouth", "ears", "horn", "back", "tail"];

const PROBABILITIES: { [key: string]: number } = {
  d: 0.375,
  r1: 0.09375,
  r2: 0.03125,
};

const MAX_QUALITY: number = 6 * (PROBABILITIES.d + PROBABILITIES.r1 + PROBABILITIES.r2);

/**
 * Utility methods for extracting data (genes, color, patterns etc.) from raw data
 *   - genesToBin
 *   - strMul
 *   - getTraits
 *   - getRegionFromGroup
 *   - getClassFromGroup
 *   - getPatternsFromGroup
 *   - getColor
 *   - getColorsFromGroup
 *   - getPartsFromGroup
 *   - getPartName
 *   - getPartFromName
 *   - getQualityAndPureness
 */

export const genesToBin = function (genes: any) {
  let genesString = genes.toString(2);
  return strMul("0", 256 - genesString.length) + genesString;
};

export const strMul = function (str: string, num: number) {
  let s = "";
  for (let i = 0; i < num; i++) {
    s += str;
  }
  return s;
};

export const getTraits = function (genes: any): AxieTraits {
  const groups = [genes.slice(0, 32), genes.slice(32, 64), genes.slice(64, 96), genes.slice(96, 128), genes.slice(128, 160), genes.slice(160, 192), genes.slice(192, 224), genes.slice(224, 256)];

  let cls = getClassFromGroup(groups[0]);
  let region = getRegionFromGroup(groups[0]);
  let pattern = getPatternsFromGroup(groups[1]);
  let color = getColorsFromGroup(groups[1], groups[0].slice(0, 4));
  let eyes = getPartsFromGroup("eyes", groups[2], region);
  let mouth = getPartsFromGroup("mouth", groups[3], region);
  let ears = getPartsFromGroup("ears", groups[4], region);
  let horn = getPartsFromGroup("horn", groups[5], region);
  let back = getPartsFromGroup("back", groups[6], region);
  let tail = getPartsFromGroup("tail", groups[7], region);

  return {
    cls: cls,
    region: region,
    pattern: pattern,
    color: color,
    eyes: eyes,
    mouth: mouth,
    ears: ears,
    horn: horn,
    back: back,
    tail: tail,
  };
};

export const getRegionFromGroup = function (group: string) {
  const regionBin = group.slice(8, 13);
  if (regionBin in REGION_GENE_MAP) {
    return REGION_GENE_MAP[regionBin];
  }
  throw new Error(`getRegionFromGroup - Unknown Region: ${regionBin}`);
};

export const getClassFromGroup = function (group: string) {
  const classBin = group.slice(0, 4);
  if (classBin in CLASS_GENE_MAP) {
    return CLASS_GENE_MAP[classBin];
  }
  throw new Error(`getClassFromGroup - Unknown Class: ${classBin}`);
};

export const getPatternsFromGroup = function (group: string) {
  return {
    d: group.slice(2, 8),
    r1: group.slice(8, 14),
    r2: group.slice(14, 20),
  };
};

export const getColor = function (colorBin: string, cls: string) {
  let color: string;
  if (colorBin == "0000") {
    color = "ffffff";
  } else if (colorBin == "0001") {
    color = "7a6767";
  } else {
    color = GENE_COLOR_MAP[cls][colorBin];
  }
  return color;
};

export const getColorsFromGroup = function (group: string, cls: string) {
  return {
    d: getColor(group.slice(20, 24), cls),
    r1: getColor(group.slice(24, 28), cls),
    r2: getColor(group.slice(28, 32), cls),
  };
};

export const getPartsFromGroup = function (part: string, group: string, region: string): AxieTrait {
  let skinBinary = group.slice(0, 2);
  let mystic = skinBinary == "11";
  let dClass = CLASS_GENE_MAP[group.slice(2, 6)];
  let dBin = group.slice(6, 12);
  let dName = getPartName(dClass, part, region, dBin, skinBinary);

  let r1Class = CLASS_GENE_MAP[group.slice(12, 16)];
  let r1Bin = group.slice(16, 22);
  let r1Name = getPartName(r1Class, part, region, r1Bin);

  let r2Class = CLASS_GENE_MAP[group.slice(22, 26)];
  let r2Bin = group.slice(26, 32);
  let r2Name = getPartName(r2Class, part, region, r2Bin);

  return {
    d: getPartFromName(part, dName),
    r1: getPartFromName(part, r1Name),
    r2: getPartFromName(part, r2Name),
    mystic: mystic,
  };
};

export const getPartName = function (cls: string, part: string, region: string, binary: string, skinBinary: string = "00") {
  let trait;
  if (binary in BINARY_TRAITS[cls][part]) {
    if (skinBinary == "11") {
      trait = BINARY_TRAITS[cls][part][binary]["mystic"];
    } else if (skinBinary == "10") {
      trait = BINARY_TRAITS[cls][part][binary]["xmas"];
    } else if (region in BINARY_TRAITS[cls][part][binary]) {
      trait = BINARY_TRAITS[cls][part][binary][region];
    } else if ("global" in BINARY_TRAITS[cls][part][binary]) {
      trait = BINARY_TRAITS[cls][part][binary]["global"];
    } else {
      trait = "UNKNOWN Regional " + cls + " " + part;
    }
  } else {
    trait = "UNKNOWN " + cls + " " + part;
  }
  return trait;
};

export const getPartFromName = function (traitType: string, partName: string) {
  const traitId =
    traitType.toLowerCase() +
    "-" +
    partName
      .toLowerCase()
      .replace(/\s/g, "-")
      .replace(/[\?'\.]/g, "");
  return BODY_PARTS_MAP[traitId];
};

export const getQualityAndPureness = function (traits: AxieTraits, cls: string) {
  let quality = 0;
  let dPureness = 0;

  for (let i in PARTS) {
    if (traits[PARTS[i]].d.class == cls) {
      quality += PROBABILITIES.d;
      dPureness++;
    }
    if (traits[PARTS[i]].r1.class == cls) {
      quality += PROBABILITIES.r1;
    }
    if (traits[PARTS[i]].r2.class == cls) {
      quality += PROBABILITIES.r2;
    }
  }

  return {
    quality: quality / MAX_QUALITY,
    pureness: dPureness,
  };
};
