import { CardSystem } from "../../../src/firestore/wiki/card-systems";
import { Deck } from "../../../src/firestore/wiki/deck";
import { Character } from "../../../src/firestore/wiki/character";
import { ServerStyleSheets, ThemeProvider } from "@material-ui/core/styles";
import { renderToStaticMarkup } from "react-dom/server";
import { createMuiTheme, CssBaseline } from "@material-ui/core";
import { CharacterSheetRenderer } from "../../../src/components/Common/CharacterSheet/SharedWithFunctions/CharacterSheetRenderer";
import React from "react";
import * as admin from "firebase-admin";

const firestore = admin.firestore();

export function getMarkup(
  systemId: string,
  deckId: string,
  characterId: string,
  dark: boolean
) {
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
  ]).then(([systemDoc, deckDoc, characterDoc]) => {
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
              type: dark ? "dark" : "light",
            },
          })}
        >
          <CssBaseline />
          <div style={{ paddingLeft: "1em", paddingRight: "1em" }}>
            <CharacterSheetRenderer
              wikiMode={false}
              allowCharacterEdit={true}
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
    return `<html>
        <head>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
            <style>${css}</style>
        </head>
        <body>${markup}</body>
      </html>`;
  });
}
