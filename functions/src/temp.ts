import * as functions from "firebase-functions";
import fs from "fs";
import parse from "csv-parse";
import * as admin from "firebase-admin";
import { Card } from "../../src/firestore/wiki/card";
import { firestore } from "firebase";

const firestore = admin.firestore();
let firstRow: string[] = [];

function uniq(ele: string, index: number, array: string[]) {
  return array.indexOf(ele) === index;
}

function nullToEmpty(value: string) {
  return value === "NULL" ? "" : value;
}

const alternateNames: { [label: string]: string[] } = {
  "Half-plate": ["Half-plate", "Half-Plate"],
  "Spiked Half-plate": ["Spiked Half-plate", "Spiked Half-Plate"],
  "Will-o'-wisp": ["Will-o'-wisp", "Will-O'-Wisp"],
  "Will-o'-Wisp": ["Will-o'-Wisp", "Will-O'-Wisp"],
  "Zon-kuthon's Pain": ["Zon-kuthon's Pain", "Zon-Kuthon's Pain"],
  "The All-seeing Eye": ["The All-seeing Eye", "The All-Seeing Eye"],
  "The Gold-fisted": ["The Gold-fisted", "The Gold-Fisted"],
  "Our Lord In Iron": ["Our Lord In Iron", "Our Lord in Iron"],
  // TODO: Fix these typos (Core)
  Labyrinth: ["Labyrynth", "Labyrinth"],
  Mercenary: ["Mercenary", "Mercenery"],
  Guide: ["Guide", "Guiade"],
  "Mob of Undead": ["Mob of Undead", "Mob of Undead "],
  "Heat Metal": ["Heat Metal", "Heat Metal "],
  "Invisible Wall": ["Invisible Wall", "Invisible Wall "],
  "The Wind and the Waves": ["The Wind and the Waves", "The Wind and Waves"],
  // TODO: Fix these typos (S&S)
  'Ambrose "Fishguts" Kroop': [
    'Ambrose "Fishguts" Kroop',
    "Ambrose 'Fishguts' Kroop",
  ],
  Geyser: ["Geyser", "Gyser"],
  'Isabella "Inkskin" Locke': [
    'Isabella "Inkskin" Locke',
    "Isabella Inkskin Locke",
  ],
  "Royster McCleagh": ["Royster McCleagh", "Royster Mccleagh"],
  "Stanching Buckler": ["Stanching Buckler", "Stanching Bucklet"],
  "Jalhazar's Curse": ["Jalhazar's Curse", "Jalhazars Curse"],
  "Brine Dragonhide Breastplate": [
    "Brine Dragonhide Breastplate",
    "Brine Deagonhide Breastplate",
  ],
  "Electricity Arc Trap": ["Electricity Arc Trap", "Elecrticity Arc Trap"],
};

export const temp = functions.https.onRequest((request, response) => {
  fs.readFile("./PACG.csv", (err, file) => {
    if (err) {
      throw err;
    }
    console.log("START");
    parse(
      file.toString().replace(/\\n/g, "\n"),
      {
        quote: "'",
        delimiter: ", ",
        escape: "\\",
        trim: true,
      },
      function (err, output) {
        firstRow = output.shift();

        // TEMP filter to speed up the process while testing
        output = output.filter(
          (v: string[]) =>
            [
              // TODO: Society Scenarios to be added
              "Assault on Absalom",
              "Cosmic Captive",
              "Hao Jin Cataclysm",
              "Season of Factions' Favor",
              "Season of Plundered Tombs",
              "Season of Tapestry's Tides",
              "Season of the Goblins",
              "Season of the Righteous",
              "Season of the Runelords",
              "Season of the Shackles",
              "The Fangwood Thieves",
              "Tyrant of the Harrow",
              "Year of Rotting Ruins",
              // TODO: Promo to be added
              "Iconic Heroes 2",
              // Fully handled
              "Core Set",
              // TODO: Apparently the cards are missing for these
              "Curse of the Crimson Throne",
              "Rise of the Runelords",
              "Occult Adventures Character Deck 2",
              "Summoner Class Deck",
              "Ultimate Wilderness Add-On Deck",
              // TODO: The adventure designations are broken for these
              "Pathfinder Tales Character Deck",
              // TODO: I have a fresh save to import these
              "Mummy's Mask",
              // TODO: The deck doesn't match on these
              "Goblins Burn! Character Deck",
              "Goblins Fight! Character Deck",
              "Hell's Vengeance 2 Character Deck",
            ].indexOf(v[1]) === -1
        );

        const rejects: string[][] = [];
        processRow(output, rejects)
          .then(() =>
            response
              .status(200)
              .contentType("application/json")
              .send(JSON.stringify([firstRow, ...rejects]))
              .end()
          )
          .catch(console.error);
      }
    );
  });

  function processRow(rows: string[][], rejects: string[][]): Promise<void> {
    const row = rows.shift()?.map(nullToEmpty);
    if (!row) {
      return Promise.resolve();
    }

    return firestore
      .collection("wiki")
      .doc("Vm2bdLJuAnw8SRxYB0A5")
      .collection("deck")
      .where("name", "==", row[1])
      .get()
      .then((deckSearch) => {
        if (deckSearch.docs.length !== 1) {
          rejects.push(row);
          return processRow(rows, rejects);
        } else {
          return Promise.all([
            deckSearch.docs[0].ref
              .collection("card")
              .where("name", "in", alternateNames[row[3]] || [row[3]])
              .where("subDeck", "==", `Level ${row[2]}`)
              .get(),
            deckSearch.docs[0].ref
              .collection("card")
              .where("name", "in", alternateNames[row[3]] || [row[3]])
              .where("subDeck", "==", `Adventure ${row[2]}`)
              .get(),
          ]).then((cardSearches) => {
            const cardDocs = cardSearches.reduce(
              (acc, v) => acc.concat(v.docs),
              [] as firestore.QueryDocumentSnapshot[]
            );
            if (!cardDocs.length) {
              rejects.push(row);
              return processRow(rows, rejects);
            } else {
              const cardDoc = cardDocs[0];
              const cardData: Card = cardDoc.data() as any;
              let subType = row[5];
              if (!subType || subType === cardData.type) {
                subType = row[4];
              }
              if (subType && subType !== cardData.type) {
                cardData.subType = subType;
              }
              if (row[6]) {
                cardData.owner = row[6];
              }
              cardData.traits = [
                ...(cardData.traits || []),
                ...row[7].split(",").filter((v) => v),
              ].filter(uniq);
              const checks = [
                ["", row[8], row[9]],
                [row[10], row[11], row[12]],
                [row[13], row[14], row[15]],
                [row[16], row[17], row[18]],
              ].filter((v) => v[1] || v[2]);
              cardData.checks = checks[0]
                ? ([
                    { skill: checks[0][1], check: checks[0][2] },
                    ...(checks[1]
                      ? [
                          checks[1][0].toUpperCase(),
                          { skill: checks[1][1], check: checks[1][2] },
                        ]
                      : []),
                    ...(checks[2]
                      ? [
                          checks[2][0].toUpperCase(),
                          { skill: checks[2][1], check: checks[2][2] },
                        ]
                      : []),
                    ...(checks[3]
                      ? [
                          checks[3][0].toUpperCase(),
                          { skill: checks[3][1], check: checks[3][2] },
                        ]
                      : []),
                  ] as any)
                : [];
              cardData.powers = row[19];
              cardData.flavor = row[20];
              try {
                return cardDoc.ref.set(cardData).then(
                  () => {
                    return processRow(rows, rejects);
                  },
                  (e) => {
                    console.log(cardData);
                    return Promise.reject(e);
                  }
                );
              } catch (e) {
                console.log(cardData);
                return Promise.reject(e);
              }
            }
          });
        }
      });
  }
});
