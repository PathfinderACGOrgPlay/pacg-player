import * as functions from "firebase-functions";

export const createCharacterImage = functions.https.onRequest(
  (request, response) => {
    console.log(request.path);
    throw new Error();
  }
);
