import * as functions from "firebase-functions";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import * as admin from "firebase-admin";
import type { Character } from "../../../src/firestore/wiki/character";
// @ts-ignore
import nodeHtmlToImage from "node-html-to-image";
import { ServerStyleSheets, ThemeProvider } from "@material-ui/core/styles";
import { createMuiTheme, CssBaseline } from "@material-ui/core";
import type { Deck } from "../../../src/firestore/wiki/deck";
import type { CardSystem } from "../../../src/firestore/wiki/card-systems";
import { CharacterSheetRenderer } from "../../../src/components/Common/CharacterSheet/SharedWithFunctions/CharacterSheetRenderer";
const firestore = admin.firestore();

export const createCharacterImage = functions.https.onRequest(
  (request, response) => {
    const [, systemId, deckId, characterId] = request.path.split("/");
    return Promise.all([
      firestore.collection("wiki").doc(systemId).get(),
      firestore
        .collection("wiki")
        .doc(systemId)
        .collection("deck")
        .doc(deckId)
        .get(),
      firestore
        .collection("wiki")
        .doc(systemId)
        .collection("deck")
        .doc(deckId)
        .collection("wiki_character")
        .doc(characterId)
        .get(),
    ])
      .then(([systemDoc, deckDoc, characterDoc]) => {
        const system = systemDoc.data() as CardSystem;
        const deck = deckDoc.data() as Deck;
        const character = characterDoc.data() as Character;
        console.log("Data Fetched");
        const sheets = new ServerStyleSheets();
        const markup = renderToStaticMarkup(
          sheets.collect(
            <ThemeProvider
              theme={createMuiTheme({
                palette: {
                  type: request.query.dark ? "dark" : "light",
                },
              })}
            >
              <CssBaseline />
              <div style={{ paddingLeft: "1em", paddingRight: "1em" }}>
                <CharacterSheetRenderer
                  wikiMode={false}
                  allowCharacterEdit={false}
                  characterRawData={character}
                  deckData={deck}
                  systemData={system}
                  loading={false}
                  error={undefined}
                  deckError={undefined}
                  systemError={undefined}
                  updateCharacter={() => {}}
                  updateError={undefined}
                />
              </div>
            </ThemeProvider>
          )
        );
        const css = sheets.toString();
        return nodeHtmlToImage({
          html: `<html>
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
                <style>${css}</style>
            </head>
            <body>${markup}</body>
          </html>`,
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
