import * as functions from "firebase-functions";
// @ts-ignore
import puppeteer from "puppeteer";
import { getMarkup } from "./getMarkup";

export const createCharacterTTSData = functions.https.onRequest(
  (request, response) => {
    const [, systemId, deckId, characterId] = request.path.split("/");
    return Promise.all([
      puppeteer
        .launch({
          defaultViewport: {
            width: 1280,
            height: 1280,
          },
        })
        .then((browser) =>
          browser.newPage().then((page) => ({ browser, page }))
        ),
      getMarkup(systemId, deckId, characterId, !!request.query.dark),
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
          .then((result) => ({ ...data, result }))
      )
      .then((data) => {
        return data.browser.close().then(() =>
          response.end(
            JSON.stringify({
              checkboxes: data.result.reduce((acc, v) => {
                const idx = (v[0] as string).split("-");
                const ele = idx.reduce((acc2, w) => {
                  if (!acc2[w]) {
                    acc2[w] = {};
                  }
                  return acc2[w];
                }, acc);
                ele.x = (v[1] as number) + (v[3] as number) / 2;
                ele.y = (v[2] as number) + (v[4] as number) / 2;
                return acc;
              }, {} as any),
            })
          )
        );
      });
  }
);
