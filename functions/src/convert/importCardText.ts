import fs from "fs";
import parse from "csv-parse";
import * as admin from "firebase-admin";
import { Card } from "../../../src/firestore/wiki/card";
import { firestore } from "firebase";
import deepEqual from "deep-equal";
import DocumentData = firebase.firestore.DocumentData;

const db = admin.firestore();
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
  "Potion of Lucubration": ["Potion of Lucubration", "Potion of Lubrication"],
  Labyrinth: ["Labyrynth", "Labyrinth"],
  Mercenary: ["Mercenary", "Mercenery"],
  Guide: ["Guide", "Guiade"],
  "Mob of Undead": ["Mob of Undead", "Mob of Undead "],
  "Heat Metal": ["Heat Metal", "Heat Metal "],
  "Invisible Wall": ["Invisible Wall", "Invisible Wall "],
  "The Wind and the Waves": ["The Wind and the Waves", "The Wind and Waves"],
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
  Pteranodon: [`Pteranodon`, `Ptranodon`],
  Kapre: [`Kapre`, `Karpe`],
  "Draugr Captain": [`Draugr Captain`, `Dragur  Captain`, "Dragur Captain"],
  Hyapatia: [`Hyapatia`, `Hypatia`],
  "Vengeful Storm": [`Vengeful Storm`, `Vengful Storm`],
  "Besmaran Priest": [`Besmaran Priest`, `Besmaran Preist`],
  Boatswain: [`Boatswain`, `Botswain`],
  "Chanty Singer": [`Chanty Singer`, `Chanity Singer`],
  "Main-Gauche": [`Main-Gauche`, `Main-Guache`],
  "Man Overboard": [`Man Overboard`, `Man Overboard!`],
  "Master-at-Arms": [`Master-at-Arms`, `Master at Arms`],
  "Old Salt's Bandana": [`Old Salt's Bandana`, `Old Salt_s Bandana`],
  Quarterstaff: [`Quarterstaff`, `Quaterstaff`],
  Spyglass: [`Spyglass`, `Spy  Glass`],
  "Token of Remembrance": [`Token of Remembrance`, `Token of Rememberance`],
  "Boarding Pike": [`Boarding Pike`, `Boarrding Pike`],
  Draugr: [`Draugr`, `Dragur`],
  'Joseph "Jack" Scrimshaw': [
    `Joseph "Jack" Scrimshaw`,
    `Josheph 'Jack' Scrimshaw`,
  ],
  "Magic Spyglass": [`Magic Spyglass`, `Magic spyglass`],
  "Net of Snaring": [`Net of Snaring`, `Net of snaring`],
  "Cat-o'-Nine-Tails": [`Cat-o'-Nine-Tails`, `Cat-O'-Nine-Tails`],
  "Emerald of Dexterity": ["Emerald of Dexterity", "Emerald of Dexeterity"],
  Quartermaster: ["Quartermaster", "Quatermaster"],
  "Nahyndrian Elixer": ["Nahyndrian Elixer", "Nahyndrian Elixir"],
  "Will-O'-Wisp": ["Will-O'-Wisp", "Will-O`-Wisp"],
  "Bastion of the Inheritor": [
    "Bastion of the Inheritor",
    "Bastion of the Inhertior",
  ],
  "Herald's Heart": ["Herald's Heart", "Heralds Heart"],
  Noriznigath: ["Noriznigath", "Nozriznigath"],
  "Staff of the Heirophant": [
    "Staff of the Heirophant",
    "Staff of the Hierophant",
  ],
  "Thorncrown of Iomedae": ["Thorncrown of Iomedae", "Thorncrown of Iomeadae"],
  "Arboreal Blight": ["Arboreal Blight", "Aboreal Blight"],
  "Acid-spraying Skull": ["Acid-spraying Skull", "Acid-Spraying Skull"],
  "Foes On All Sides": ["Foes On All Sides", "Foes on All Sides"],
  "Trifaccia's Mantle": ["Trifaccia's Mantle", "Triafaccia's Mantle"],
  "Shocking Sawtooth Saber": [
    "Shocking Sawtooth Saber",
    "Shocking Sawtooth Sabre",
  ],
  Serithtial: ["Serithtial", "Serithial"],
  "Stone-shard Breastplate": [
    "Stone-shard Breastplate",
    "Stone-Shard Breastplate",
  ],
  "Lyrune-quah Moon Maiden": [
    "Lyrune-quah Moon Maiden",
    "Lyrune-Quah Moon Maiden",
  ],
  "Skoan-quah Boneslayer": ["Skoan-quah Boneslayer", "Skoan-Quah Boneslayer"],
  "Sklar-quah Thundercaller": [
    "Sklar-quah Thundercaller",
    "Sklar-Quah Thundercaller",
  ],
  "Lyrune-quah Truthspeaker": [
    "Lyrune-quah Truthspeaker",
    "Lyrune-Quah Truthspeaker",
  ],
  "Krojun Eats-what-he-kills": [
    "Krojun Eats-what-he-kills",
    "Krojun Eats-What-He-Kills",
  ],
  "Wounding Spear-axe": ["Wounding Spear-axe", "Wounding Spear-Axe"],
  "Fate-reader Lenses": ["Fate-reader Lenses", "Fate-Reader Lenses"],
  "Fangs of Diomazul": ["Fangs of Diomazul", "Fange of Diomazul"],
  "Liquid Ice": ["Liquid Ice", "Liquid Flask"],
  "Safety Bubble": ["Safety Bubble", "Saftey Bubble"],
  "Chief Korgamorg": ["Chief Korgamorg", "Cheif Krogamorg"],
  "Fortune-teller": ["Fortune-teller", "Fortune-Teller"],
  "Keppira D'bear": ["Keppira D'bear", "Keppira D'Bear"],
  "Sergeant-at-arms": ["Sergeant-at-arms", "Sergeant-At-Arms"],
  "Cestus +1": ["Cestus +1", "Cetus +1"],
  Bloodscent: ["Bloodscent", "Blood"],
  "Animalbane Crossbow +2": ["Animal Crossbow +2", "Animalbane Crossbow +2"],
  "Ophidian Armor": ["Ophidian Armor", "Ophidan Armor"],
  "Life Leech": ["Life Leech", "Life Lech"],
  "Planar Crossbow +2": ["Planar Crossbow +2", "Planar Crossbow"],
};

const decks: { [key: string]: Promise<FirebaseFirestore.QuerySnapshot> } = {};

export function importCardText() {
  return new Promise<any>((resolve, reject) => {
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
          if (err) {
            reject(err);
            return;
          }
          firstRow = output.shift();

          console.log(output.length);
          output = output.map((v: string[]) => {
            if (v[1] === "Goblins Burn! Character Deck") {
              v[1] = "Goblins Burn! Class Deck";
            }
            if (v[1] === "Goblins Fight! Character Deck") {
              v[1] = "Goblins Fight! Class Deck";
            }
            if (v[1] === "Hell's Vengeance 2 Character Deck") {
              v[1] = "Hell's Vengeance Character Deck 2";
            }
            return v;
          });
          console.log(output.length);

          const rejects: string[][] = [];
          return processRow(output, rejects)
            .then(() => resolve([firstRow, rejects]))
            .catch(reject);
        }
      );
    });
  });

  function processRow(rows: string[][], rejects: string[][]): Promise<void> {
    const row = rows.shift()?.map(nullToEmpty);
    if (!row) {
      return Promise.resolve();
    }

    if (!decks[row[1]]) {
      decks[row[1]] = db
        .collection("wiki")
        .doc("Vm2bdLJuAnw8SRxYB0A5")
        .collection("deck")
        .where("name", "==", row[1])
        .get();
    }

    return Promise.all([
      decks[row[1]].then((deckSearch) => {
        if (deckSearch.docs.length !== 1) {
          rejects.push(row);
          return processRow(rows, rejects);
        } else {
          const searches = [
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
          ];
          if (row[2] === "C") {
            searches.push(
              deckSearch.docs[0].ref
                .collection("card")
                .where("name", "in", alternateNames[row[3]] || [row[3]])
                .where("subDeck", "==", `Character Addon Deck`)
                .get()
            );
          }
          if (
            row[2] === "Promos" ||
            [
              "The Real Rabbit Prince",
              "Embiggen",
              "Asyra",
              "The Tall Knife",
              "The Unveiling",
              "Corpse Plate",
            ].indexOf(row[3]) !== -1
          ) {
            searches.push(
              deckSearch.docs[0].ref
                .collection("card")
                .where("name", "in", alternateNames[row[3]] || [row[3]])
                .get()
            );
          }
          return Promise.all(searches).then((cardSearches) => {
            const cardDocs = cardSearches.reduce(
              // @ts-ignore
              (acc, v) => acc.concat(v.docs),
              [] as firestore.QueryDocumentSnapshot[]
            );
            console.log(rows.length, row[1], row[3]);
            if (!cardDocs.length) {
              rejects.push(row);
            } else {
              const cardDoc = cardDocs[0];
              const cardData: Card = cardDoc.data() as any;
              const oldData = { ...cardData };
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
              if (deepEqual(oldData, cardData)) {
                return Promise.resolve();
              }
              try {
                return cardDoc.ref.set(cardData).catch((e) => {
                  console.log(cardData);
                  return Promise.reject(e);
                });
              } catch (e) {
                console.log(cardData);
                return Promise.reject(e);
              }
            }
          });
        }
      }),
      processRow(rows, rejects),
    ]).then(() => {});
  }
}
