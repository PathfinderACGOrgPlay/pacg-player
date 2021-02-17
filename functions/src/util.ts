import puppeteer from "puppeteer";
import { getMarkup, getMarkupData } from "./character/getMarkup";

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
            ];
          });
        })
        .then((roles) => ({ ...data, roles }))
    )
    .then((data) => {
      return data.browser.close().then(() => ({
        checkboxes: data.checkboxes.reduce((acc, v) => {
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
        roles: data.roles.map((v) => {
          return {
            value: v[0],
            label: v[1],
            x: (v[2] as number) + (v[4] as number) / 2,
            y: (v[3] as number) + (v[5] as number) / 2,
          };
        }, {} as any),
      }));
    });
}
