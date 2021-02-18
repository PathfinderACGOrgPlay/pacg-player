import * as functions from "firebase-functions";
// @ts-ignore
import nodeHtmlToImage from "node-html-to-image";
import { getMarkup, getMarkupData, ThenArg } from "./getMarkup";
import { getCheckboxesRoles, getPathParams, isNumeric } from "../util";
import crypto from "crypto";

function toJson([systemDoc, deckDoc, characterDoc, role, dark]: ThenArg<
  ReturnType<typeof getMarkupData>
>) {
  return JSON.stringify([
    systemDoc.data(),
    deckDoc.data(),
    characterDoc.data(),
    role,
    dark,
  ]);
}

export const createCharacterImage = functions
  .runWith({
    memory: "2GB",
  })
  .https.onRequest((request, response) => {
    const [systemId, deckId, characterId, role, hash] = getPathParams(
      request.path
    );
    if (!systemId) {
      response.status(400).end("System Id is required");
    }
    if (!deckId) {
      response.status(400).end("Deck Id is required");
    }
    if (!characterId) {
      response.status(400).end("Character Id is required");
    }
    if (!role || !isNumeric(role)) {
      response.status(400).end("Role is required and must be a number");
    }
    return getMarkupData(
      systemId,
      deckId,
      characterId,
      parseInt(role, 10),
      !!request.query.dark
    ).then((data) => {
      const md5sum = crypto.createHash("md5");
      md5sum.update(toJson(data));
      const dataHash = md5sum.digest("hex");
      if (dataHash !== hash) {
        if (hash) {
          response.redirect("../" + dataHash);
        } else {
          response.redirect(dataHash);
        }
        return Promise.resolve();
      } else {
        const html = getMarkup(data);
        return nodeHtmlToImage({
          html,
          transparent: false,
          puppeteerArgs: {
            defaultViewport: {
              width: 1280,
              height: 1280,
            },
          },
        }).then((image) => {
          response.writeHead(200, {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=31536000, s-maxage=31536000",
          });
          response.end(image, "binary");
        });
      }
    });
  });

export const createCharacterMarkup = functions.https.onRequest(
  (request, response) => {
    const [systemId, deckId, characterId, role] = getPathParams(request.path);
    if (!systemId) {
      response.status(400).end("System Id is required");
    }
    if (!deckId) {
      response.status(400).end("Deck Id is required");
    }
    if (!characterId) {
      response.status(400).end("Character Id is required");
    }
    if (!role || !isNumeric(role)) {
      response.status(400).end("Role is required and must be a number");
    }
    return getMarkupData(
      systemId,
      deckId,
      characterId,
      parseInt(role || "-1", 10),
      !!request.query.dark
    )
      .then(getMarkup)
      .then((html) => {
        response.end(html);
      });
  }
);

export const createCharacterData = functions.https.onRequest(
  (request, response) => {
    const [systemId, deckId, characterId, role] = getPathParams(request.path);
    if (!systemId) {
      response.status(400).end("System Id is required");
    }
    if (!deckId) {
      response.status(400).end("Deck Id is required");
    }
    if (!characterId) {
      response.status(400).end("Character Id is required");
    }
    if (!role || !isNumeric(role)) {
      response.status(400).end("Role is required and must be a number");
    }
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
