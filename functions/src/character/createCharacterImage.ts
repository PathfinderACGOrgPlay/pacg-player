import * as functions from "firebase-functions";
// @ts-ignore
import nodeHtmlToImage from "node-html-to-image";
import { getMarkup } from "./getMarkup";

export const createCharacterImage = functions.https.onRequest(
  (request, response) => {
    const [, systemId, deckId, characterId] = request.path.split("/");
    return getMarkup(systemId, deckId, characterId, !!request.query.dark)
      .then((html) => {
        return nodeHtmlToImage({
          html,
          transparent: false,
          puppeteerArgs: {
            defaultViewport: {
              width: 1280,
              height: 1280,
            },
          },
        });
      })
      .then((image) => {
        response.writeHead(200, { "Content-Type": "image/png" });
        response.end(image, "binary");
      });
  }
);
