import * as functions from "firebase-functions";
// @ts-ignore
import nodeHtmlToImage from "node-html-to-image";
import { getMarkup } from "./getMarkup";
import { getCheckboxesRoles } from "../util";

export const createCharacterImage = functions
  .runWith({
    memory: "2GB",
  })
  .https.onRequest((request, response) => {
    const splitPath = request.path.split("/");
    const [systemId, deckId, characterId, role] =
      splitPath[1] === "f" ? splitPath.slice(3) : splitPath.slice(1);
    return getMarkup(
      systemId,
      deckId,
      characterId,
      parseInt(role || "-1", 10),
      !!request.query.dark
    )
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
        response.set("Cache-Control", "public, max-age=300, s-maxage=600");
        response.writeHead(200, { "Content-Type": "image/png" });
        response.end(image, "binary");
      });
  });

export const createCharacterMarkup = functions.https.onRequest(
  (request, response) => {
    const splitPath = request.path.split("/");
    const [systemId, deckId, characterId, role] =
      splitPath[1] === "f" ? splitPath.slice(3) : splitPath.slice(1);
    return getMarkup(
      systemId,
      deckId,
      characterId,
      parseInt(role || "-1", 10),
      !!request.query.dark
    ).then((html) => {
      response.end(html);
    });
  }
);

export const createCharacterData = functions.https.onRequest(
  (request, response) => {
    const splitPath = request.path.split("/");
    const [systemId, deckId, characterId, role] =
      splitPath[1] === "f" ? splitPath.slice(3) : splitPath.slice(1);
    return getCheckboxesRoles(
      systemId,
      deckId,
      characterId,
      parseInt(role || "-1", 10)
    ).then((data) => {
      response.end(JSON.stringify(data));
    });
  }
);
