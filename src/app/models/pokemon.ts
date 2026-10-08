
export interface Pokemon {
  id: number;
  name: string;
  url?: string;

  height: number;
  weight: number;

  sprites: {
    front_default: string | null;
    back_default: string | null;

    other?: {
      'official-artwork'?: {
        front_default: string | null;
      };
    };
  };

  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];

  stats: {
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }[];
}


