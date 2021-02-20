import puppeteer from "puppeteer";
import { getMarkup, getMarkupData } from "./character/getMarkup";
import * as admin from "firebase-admin";
import crypto from "crypto";

type CoordDictionaryItem = { x: number; y: number } | CoordDictionary;
type CoordDictionary = { [key: string]: CoordDictionaryItem };

export function getCheckboxesRoles(
  systemId: string,
  deckId: string,
  characterId: string,
  role: number
) {
  return Promise.all([
    puppeteer
      .launch({
        defaultViewport: {
          width: 1280,
          height: 1280,
        },
      })
      .then((browser) => browser.newPage().then((page) => ({ browser, page }))),
    getMarkupData(systemId, deckId, characterId, role, false).then(getMarkup),
  ])
    .then(([data, html]) => data.page.setContent(html).then(() => data))
    .then((data) =>
      data.page
        .$$eval("input[type=checkbox]", (eles) =>
          eles.map((v) => {
            const rect = v.getBoundingClientRect();
            return [
              (v as HTMLInputElement).name,
              rect.x,
              rect.y,
              rect.width,
              rect.height,
            ];
          })
        )
        .then((checkboxes) => ({ ...data, checkboxes }))
    )
    .then((data) =>
      data.page
        .$$eval("button.MuiTab-root", (eles) => {
          return eles.map((v) => {
            const rect = v.getBoundingClientRect();
            return [
              parseInt((v as HTMLButtonElement).dataset.value || "-1", 10),
              (v as HTMLButtonElement).innerText,
              rect.x,
              rect.y,
              rect.width,
              rect.height,
            ] as const;
          });
        })
        .then((roles) => ({ ...data, roles }))
    )
    .then((data) => {
      return data.browser.close().then(() => ({
        checkboxes: data.checkboxes.reduce((acc, v) => {
          const idx = (v[0] as string).split("-");
          const ele = idx.reduce((acc2: CoordDictionaryItem, w) => {
            if (!(acc2 as CoordDictionary)[w]) {
              (acc2 as CoordDictionary)[w] = {};
            }
            return (acc2 as CoordDictionary)[w];
          }, acc) as { x: number; y: number };
          ele.x = (v[1] as number) + (v[3] as number) / 2;
          ele.y = (v[2] as number) + (v[4] as number) / 2;
          return acc;
        }, {} as CoordDictionary),
        roles: data.roles.map((v) => {
          return {
            value: v[0],
            label: v[1],
            x: (v[2] as number) + (v[4] as number) / 2,
            y: (v[3] as number) + (v[5] as number) / 2,
          };
        }),
      }));
    });
}

export function getPathParams(path: string) {
  const splitPath = path.split("/");
  return splitPath[1] === "f" ? splitPath.slice(3) : splitPath.slice(1);
}

export function isNumeric(str: string) {
  return (
    !isNaN((str as unknown) as number) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

export function getDimensions(count: number) {
  const height = Math.min(7, Math.ceil(Math.sqrt(count)));
  const width = Math.min(10, Math.ceil(count / height));
  return { width, height };
}

export function getDeckInfoObject(snapshot: admin.firestore.QuerySnapshot) {
  const data = snapshot.docs.map((v) => v.data());
  const length = data.length;
  const dataHash = getHash(JSON.stringify(data.map((v) => v.url)));
  return {
    ...getDimensions(length),
    count: length,
    info: snapshot.docs.map((v) => {
      const { traits, count, type, subDeck, name } = v.data();
      return { id: v.id, traits, count, type, subDeck, name };
    }),
    hash: dataHash,
  };
}

export function getHash(data: string) {
  const md5sum = crypto.createHash("md5");
  md5sum.update(data);
  return md5sum.digest("hex");
}
