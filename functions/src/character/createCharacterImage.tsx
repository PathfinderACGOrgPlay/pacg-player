import * as functions from "firebase-functions";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { CharacterSheetRenderer } from "../../../src/components/Characters/Sheet/CharacterSheet";
import * as admin from "firebase-admin";
import { Character } from "../../../src/firestore/wiki/character";
// @ts-ignore
import nodeHtmlToImage from "node-html-to-image";
import { ServerStyleSheets, ThemeProvider } from "@material-ui/core/styles";
import { createMuiTheme, CssBaseline } from "@material-ui/core";
const firestore = admin.firestore();

export const createCharacterImage = functions.https.onRequest(
  (request, response) => {
    const [, systemId, deckId, characterId] = request.path.split("/");
    console.log(request.query);
    return firestore
      .collection("wiki")
      .doc(systemId)
      .collection("deck")
      .doc(deckId)
      .collection("wiki_character")
      .doc(characterId)
      .get()
      .then((doc) => {
        const character = doc.data() as Character;
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
              <CharacterSheetRenderer
                data={{
                  uid: "",
                  name: "",
                  systemId,
                  deckId,
                  characterId,
                }}
                character={character}
                disabled
                noDisableRoles
                update={() => {
                  // NOOP
                }}
              />
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
              width: 1920,
              height: 1080,
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
