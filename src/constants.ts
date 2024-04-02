export enum ContractState {
  InDesign = 'Suunnitellaan',
  InProgress = 'Tehdään',
  Completed = 'Tehty',
  Done = 'Valmis',
}

// Define HTTP status codes in a human readable format
// More codes over at https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
export enum StatusCode {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  InternalServerError = 500,
}

export const WORKSITES = [
  'Kerrostalo',
  'Rivitalo',
  'Omakotitalo',
  'Paritalo',
  'Erillistalo',
];
