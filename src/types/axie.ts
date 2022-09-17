type Axie = {
  id: number;
  stage: number | null;
  traits: AxieTraits;
  genes: string;
  class: string;
  quality: number;
  pureness: number;
};

type AxieTraits = {
  cls: string;
  region: string;
  pattern: AxiePattern;
  color: AxieColor;
  back: AxieTrait;
  mouth: AxieTrait;
  horn: AxieTrait;
  tail: AxieTrait;
  eyes: AxieTrait;
  ears: AxieTrait;
};

type AxieTrait = {
  class?: string,
  d: AxieTraitDetails;
  r1: AxieTraitDetails;
  r2: AxieTraitDetails;
  mystic?: boolean;
};

type AxieTraitDetails = {
  name: string;
  class?: string;
  partId?: string;
};

type AxieColor = {
  d: string;
  r1: string;
  r2: string;
};

type AxiePattern = {
  d: string;
  r1: string;
  r2: string;
};
