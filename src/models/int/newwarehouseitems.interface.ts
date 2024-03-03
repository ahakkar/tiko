export interface NewWarehouseItems {
  tarvikkeet: {
    toimittaja: {
      toim_nimi: string;
      osoite: string;
    };
    tarvike: {
      ttiedot: {
        nimi: string;
        merkki: string;
        tyyppi: string;
        hinta: number;
        yksikko: string;
      };
    }[];
  };
}
