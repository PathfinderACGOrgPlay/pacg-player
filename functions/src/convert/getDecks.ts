import path from "path";

const fs = require("fs");

interface CardState {
  CardID: number;
  Nickname: string;
  Description: string;
  CustomDeck: {
    [key: string]: {
      FaceURL: string;
      NumHeight: number;
      NumWidth: number;
    };
  };
}

interface ObjectState {
  Name: string;
  Nickname: string;
  ContainedObjects: CardState[];
}

interface File {
  SaveName: string;
  ObjectStates: ObjectState[];
}

interface CardOutput {
  Description: string;
  deck: string;
  x: number;
  y: number;
  count?: number;
}

interface DeckOutput {
  url: string;
  width: number;
  height: number;
}

interface DeckList {
  [key: string]: { id: number; width: number; height: number };
}

function resolve<T>(res: (value?: T) => void, rej: (err: Error) => void) {
  return function (err: Error | null, data?: T) {
    if (err) {
      rej(err);
    } else {
      res(data);
    }
  };
}

function processCard(v: CardState, decks: DeckList) {
  const deck = v.CustomDeck[Object.keys(v.CustomDeck)[0]];
  const id = v.CardID.toString();
  const index = parseInt(id.substring(id.length - 2));
  const x = Math.floor(index / deck.NumWidth);
  const y = index % deck.NumWidth;

  if (!decks[deck.FaceURL]) {
    decks[deck.FaceURL] = {
      id: Object.keys(decks).length,
      width: deck.NumWidth,
      height: deck.NumHeight,
    };
  }
  return {
    Description: v.Description,
    deck: decks[deck.FaceURL].id.toString(),
    x,
    y,
  };
}

interface DeckResult {
  [key: string]: CardOutput;
}
interface FileResult {
  [key: string]: DeckResult;
}

const singleCards: any = {
  "PACG Skull And Shackles, 6 Player": {
    Fleet: "Fleet",
    "Magpie Princess": "Promo Cards",
  },
  "Magus Class Deck": {
    "Magus Arcana": "Corhort",
  },
  "PACG ACS Nature Pack": {
    "Icy Prison": "Level 5",
  },
  "Pathfinder Adventure Card Game: Occult Adventures Character Deck 1": {
    Honaire: "Cohorts",
  },
  "Pathfinder Adventure Card Game: Magus Class Deck": {
    "Magus Arcana": "Cohorts",
  },
  "Hell's Vengeance Character Deck 1": {
    "Redemption List": "Redemption List",
  },
  "Hell's Vengeance Character Deck 2": {
    "Redemption List": "Redemption List",
  },
  "Occult Adventures Character Deck 2": {
    "Spirit Relatives": "Cohorts",
  },
  "PACG Ultimate Combat Add-On Deck": {
    Jinfu: "Cohorts",
  },
};

export function getDecks() {
  return new Promise<string[]>((res, rej) => {
    fs.readdir(path.join(process.cwd(), "loadMe"), resolve(res, rej));
  })
    .then((dir) => dir.map((v) => `${path.join(process.cwd(), "loadMe")}/${v}`))
    .then((files) => {
      return Promise.all(
        files.map((v) =>
          new Promise<Buffer>((res, rej) => {
            fs.readFile(v, resolve(res, rej));
          }).then((v) => JSON.parse(v.toString()))
        )
      );
    })
    .then((fileData) => {
      return fileData.reduce((acc, file: File) => {
        let fail = false;
        const decks: DeckList = {};
        const cards = file.ObjectStates.filter((v) => v.Name === "Deck").reduce(
          (acc: FileResult, deck): FileResult => {
            if (deck.Nickname === "") {
              console.error("Found blank deck in ", file.SaveName);
              return acc;
            }

            if (fail) {
              return acc;
            }
            if (acc[deck.Nickname]) {
              console.error(
                "Found duplicate deck ",
                deck.Nickname,
                " in ",
                file.SaveName
              );
              fail = true;
              return acc;
            }
            acc[deck.Nickname] = deck.ContainedObjects.reduce(
              (acc: DeckResult, v): DeckResult => {
                if (v.Nickname === "") {
                  console.error(
                    "Found blank card in ",
                    deck.Nickname,
                    " of ",
                    file.SaveName
                  );
                  return acc;
                }
                const result = processCard(v, decks);

                if (acc[v.Nickname]) {
                  const oldCard = acc[v.Nickname];

                  if (
                    result.deck !== oldCard.deck ||
                    result.x !== oldCard.x ||
                    result.y !== oldCard.y
                  ) {
                    console.error(
                      "Found duplicate card ",
                      v.Nickname,
                      " in ",
                      deck.Nickname,
                      " of ",
                      file.SaveName
                    );
                    fail = true;
                    return acc;
                  } else {
                    oldCard.count = oldCard.count || 1;
                    oldCard.count++;
                  }
                  return acc;
                }

                acc[v.Nickname] = result;
                return acc;
              },
              {} as DeckResult
            );
            if (!Object.keys(acc[deck.Nickname]).length) {
              delete acc[deck.Nickname];
            }
            return acc;
          },
          {} as FileResult
        );
        file.ObjectStates.filter(
          (v) => v.Name === "Card" || v.Name === "CardCustom"
        ).forEach((v) => {
          if (
            singleCards[file.SaveName] &&
            singleCards[file.SaveName][v.Nickname]
          ) {
            cards[singleCards[file.SaveName][v.Nickname]] = {
              [v.Nickname]: processCard((v as unknown) as CardState, decks),
            };
          } else {
            console.error(
              "Single card found but not mapped",
              file.SaveName,
              "/",
              v.Nickname
            );
          }
        });
        if (!fail && Object.keys(cards).length) {
          acc[
            file.SaveName.replace(/^PACG /, "")
              .replace(/, [0-9] Player$/, "")
              .replace(/^Pathfinder Adventure Card Game: /, "")
              .replace(/ ?\b2e\b ?/, "")
          ] = {
            Decks: Object.keys(cards)
              .sort((a, b) => {
                if (a === "Adventure B") {
                  return 1;
                }
                if (b === "Adventure B") {
                  return -1;
                }
                if (a === "Level 0") {
                  return -1;
                }
                if (b === "Level 0") {
                  return 1;
                }
                if (a.startsWith("Adventure")) {
                  a = a.replace("Adventure", "`````");
                }
                if (a.startsWith("Level")) {
                  a = a.replace("Level", "`````");
                }
                if (b.startsWith("Adventure")) {
                  b = b.replace("Adventure", "`````");
                }
                if (b.startsWith("Level")) {
                  b = b.replace("Level", "`````");
                }
                return a.localeCompare(b);
              })
              .reduce((acc: FileResult, v): FileResult => {
                acc[v] = Object.keys(cards[v])
                  .sort()
                  .reduce((acc2, w) => {
                    acc2[w] = cards[v][w];
                    return acc2;
                  }, {} as any);
                return acc;
              }, {} as FileResult),
            DeckImages: Object.keys(decks).reduce((acc, v) => {
              acc[decks[v].id] = {
                url: v,
                width: decks[v].width,
                height: decks[v].height,
              };
              return acc;
            }, {} as { [key: string]: DeckOutput }),
          };
        } else {
          console.error("Failed to export ", file.SaveName);
        }

        return acc;
      }, {});
    });
}
