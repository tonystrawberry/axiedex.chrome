type Options = {
  EXTENSION_ENABLED?: boolean;
  ONLY_POPUP?: boolean;
  HIDE_AXIES?: boolean;
  SIMILAR_AXIES_ENABLED?: boolean;
  EYES_EARS_GENES_PURITY_INCLUDED?: boolean;
  EYES_EARS_GENES_SEARCH_INCLUDED?: boolean;
  SHOW_AUCTIONS?: boolean;
  SHOW_HATCH?: boolean;
  SHOW_V3?: boolean;
  SHOW_GENES_PURITY?: boolean;

  PURITY_TABLE?: PurityTableOption[];
  SEARCH_BOOKMARKS?: SearchBookmarkOption[];
  AXIE_BOOKMARKS?: AxieBookmarkOption[];
  USER_UID?: string | null;
  USER?: string | null;
};

type OptionKey =
  | "PURITY_TABLE"
  | "EXTENSION_ENABLED"
  | "ONLY_POPUP"
  | "SEARCH_BOOKMARKS"
  | "AXIE_BOOKMARKS"
  | "HIDE_AXIES"
  | "SIMILAR_AXIES_ENABLED"
  | "SHOW_GENES_PURITY"
  | "EYES_EARS_GENES_PURITY_INCLUDED"
  | "EYES_EARS_GENES_SEARCH_INCLUDED"
  | "SHOW_AUCTIONS"
  | "SHOW_HATCH"
  | "SHOW_V3"
  | "USER_UID"
  | "USER";

type PurityTableOption = {
  type: string;
  purity: number;
  color: string;
};

type SearchBookmarkOption = {
  link: string;
  name: string;
};

type AxieBookmarkOption = {
  id: number;
  class: string;
};

type User = {
  uid: string;
  email: string;
};
