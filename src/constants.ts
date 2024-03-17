export const CONTRACT_STATES = ['Suunnitellaan', 'Tehdään', 'Tehty', 'Valmis'];

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
