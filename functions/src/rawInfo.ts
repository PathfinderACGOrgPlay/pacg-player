import * as functions from "firebase-functions";
import * as characters from "../../src/oldData/characters.json";
import * as classDecks from "../../src/oldData/classDecks.json";
import * as adventures from "../../src/oldData/adventures.json";

export const characterList = functions.https.onRequest((request, response) => {
  const reqDeck = decodeURI(request.path.substr(1));
  return response.status(200).send(
    Object.keys(characters).reduce((acc, v) => {
      if ((characters as any)[v][reqDeck]) {
        acc[v] = (characters as any)[v][reqDeck];
      }
      return acc;
    }, {} as any)
  );
});

export const classDeckList = functions.https.onRequest((request, response) => {
  return response
    .status(200)
    .send(Object.keys(classDecks).filter((v) => v !== "default"));
});

export const adventuresList = functions.https.onRequest((request, response) => {
  return response
    .status(200)
    .send(Object.keys(adventures).filter((v) => v !== "default"));
});

function getDeck(
  request: functions.https.Request,
  response: functions.Response,
  deck: any
) {
  const reqDeck = decodeURI(request.path.substr(1));
  if (Object.keys(deck).indexOf(reqDeck) !== -1) {
    return response.status(200).send(deck[reqDeck]);
  } else {
    return response.status(404).send({ error: "Unable to retrieve the deck" });
  }
}

export const classDeck = functions.https.onRequest((request, response) => {
  return getDeck(request, response, classDecks);
});

export const adventure = functions.https.onRequest((request, response) => {
  return getDeck(request, response, adventures);
});
