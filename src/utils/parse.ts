export interface FlatObject {
  [key: string]: unknown;
}

export interface NestedObject {
  [key: string]: {
    [innerKey: string]: unknown;
  };
}

/**
 * Muuntaa litteän objektin sisäkkäiseksi objektiksi.
 *
 * Jokainen avain jaetaan alaviivan kohdalta kahteen osaan, joista ensimmäinen
 * osa on ulkoinen avain ja toinen osa sisäkkäinen avain.
 *
 * Esimerkiksi:
 * flatToNestedObject({lapsi_koira_nimi: 'Rufus'})
 * => {lapsi: {koira_nimi: 'Rufus'}}
 *
 * @param flatObject Litteä objekti, joka muunnetaan sisäkkäiseksi objektiksi.
 * @return Sisäkkäinen objekti.
 * @throws Error Jos tasaisen objektin sarakkeen nimi ei sisällä alaviivaa.
 */
export const flatToNestedObject = (flatObject: FlatObject): NestedObject => {
  const nestedObject: NestedObject = {};
  for (const col in flatObject) {
    if (!Object.prototype.hasOwnProperty.call(flatObject, col)) {
      continue;
    }
    const underscoreIndex = col.indexOf('_');
    if (underscoreIndex === -1) {
      throw new Error(
        `Invalid column name ${col} doesn't contain an underscore.`
      );
    }
    const key = col.slice(0, underscoreIndex);
    const nestedKey = col.slice(underscoreIndex + 1);
    nestedObject[key] = nestedObject[key] ?? {};
    nestedObject[key]![nestedKey] = flatObject[col];
  }
  return nestedObject;
};
