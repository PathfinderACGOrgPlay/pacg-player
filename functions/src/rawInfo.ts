import * as functions from "firebase-functions";
import * as classDecks from "../../src/oldData/classDecks.json";
import * as adventures from "../../src/oldData/adventures.json";

export const classDeckList = functions.https.onRequest((request, response) => {
  return response
    .status(200)
    .send(Object.keys(classDecks).filter((v) => v !== "default"))
    .end();
});

export const adventuresList = functions.https.onRequest((request, response) => {
  return response
    .status(200)
    .send(Object.keys(adventures).filter((v) => v !== "default"))
    .end();
});

function getDeck(
  request: functions.https.Request,
  response: functions.Response,
  deck: any
) {
  const reqDeck = decodeURI(request.path.substr(1));
  if (Object.keys(deck).indexOf(reqDeck) !== -1) {
    return response.status(200).send(deck[reqDeck]).end();
  } else {
    return response
      .status(404)
      .send({ error: "Unable to retrieve the deck" })
      .end();
  }
}

export const classDeck = functions.https.onRequest((request, response) => {
  return getDeck(request, response, classDecks);
});

export const adventure = functions.https.onRequest((request, response) => {
  return getDeck(request, response, adventures);
});
