import * as functions from "firebase-functions";
import {
  getDeckInfoObject,
  getDimensions,
  getPathParams,
  isNumeric,
} from "../util";
import sharp from "sharp";
import * as admin from "firebase-admin";
import * as express from "express";
import { https } from "firebase-functions";
import axios from "axios";
import crypto from "crypto";

const firestore = admin.firestore();

function advancePages(
  pages: number,
  ref: admin.firestore.Query,
  snap: Promise<admin.firestore.QuerySnapshot>
): Promise<admin.firestore.QuerySnapshot | null> {
  if (pages === 0) {
    return snap;
  }
  return snap.then((v) => {
    if (!v.docs.length) {
      return null;
    }
    return advancePages(
      pages - 1,
      ref,
      ref
        .startAfter(v.docs[v.docs.length - 1].id)
        .limit(70)
        .get()
    );
  });
}

function getSnapshot(
  request: https.Request,
  response: express.Response
): Promise<readonly [admin.firestore.QuerySnapshot | null, string]> {
  const [systemId, deckId, page, hash] = getPathParams(request.path);
  if (!systemId) {
    response.status(400).end("System Id is required");
    return Promise.resolve([null, hash]);
  }
  if (!deckId) {
    response.status(400).end("Deck Id is required");
    return Promise.resolve([null, hash]);
  }
  if (!page || !isNumeric(page)) {
    response.status(400).end("Role is required and must be a number");
    return Promise.resolve([null, hash]);
  }
  const pageNum = parseInt(page, 10);
  const collection = firestore
    .collection("wiki")
    .doc(systemId)
    .collection("deck")
    .doc(deckId)
    .collection("card")
    .orderBy(admin.firestore.FieldPath.documentId())
    .where("removed", "==", false);
  return advancePages(pageNum, collection, collection.limit(70).get()).then(
    (v) => {
      if (!v) {
        response.status(404).end();
        return [null, hash];
      }
      return [v, hash];
    }
  );
}

export const createDeckImage = functions
  .runWith({
    memory: "2GB",
  })
  .https.onRequest((request, response) => {
    getSnapshot(request, response).then(([snapshot, hash]) => {
      if (snapshot) {
        const dimensions = getDimensions(snapshot.docs.length);
        Promise.all(
          snapshot.docs.map((v) => {
            const image = v.data().image as string | string[];
            return Array.isArray(image) ? image[0] : image;
          })
        ).then((urls) => {
          const md5sum = crypto.createHash("md5");
          md5sum.update(JSON.stringify(urls));
          const dataHash = md5sum.digest("hex");
          if (dataHash !== hash) {
            if (hash) {
              response.redirect("../" + dataHash);
            } else {
              response.redirect(dataHash);
            }
            return Promise.resolve();
          } else {
            return Promise.all(
              urls.map((v) =>
                axios.get<ArrayBuffer>(Array.isArray(v) ? v[0] : v, {
                  responseType: "arraybuffer",
                })
              )
            )
              .then((images) => {
                const imageData = images.map((v) => sharp(Buffer.from(v.data)));
                return Promise.all(
                  imageData.map((v) =>
                    v.metadata().then((w) => [v, w] as const)
                  )
                );
              })
              .then((imageData) => {
                const maxWidth = Math.max.apply(
                  Math,
                  imageData.map((v) => v[1].width ?? 0)
                );
                const maxHeight = Math.max.apply(
                  Math,
                  imageData.map((v) => v[1].height ?? 0)
                );
                const images = imageData.slice(1).map((v, i) => {
                  const y = Math.floor((i + 1) / dimensions.width);
                  const x = (i + 1) % dimensions.width;
                  return v[0]
                    .resize({
                      width: maxWidth,
                      height: maxHeight,
                      fit: "contain",
                    })
                    .toBuffer()
                    .then(
                      (buf): sharp.OverlayOptions => ({
                        input: buf,
                        top: y * maxHeight,
                        left: x * maxWidth,
                      })
                    );
                });
                return Promise.all(images).then((opts) =>
                  imageData[0][0]
                    .resize({
                      width: maxWidth,
                      height: maxHeight,
                      fit: "contain",
                    })
                    .extend({
                      left: 0,
                      right: (dimensions.width - 1) * maxWidth,
                      top: 0,
                      bottom: (dimensions.height - 1) * maxHeight,
                      background: { r: 0, g: 0, b: 0, alpha: 0 },
                    })
                    .composite(opts)
                    .toBuffer()
                    .then((v) =>
                      sharp(v)
                        .resize({
                          width: Math.ceil(
                            Math.min(
                              dimensions.width * maxWidth,
                              dimensions.width * 409.6
                            )
                          ),
                        })
                        .jpeg()
                        .toBuffer()
                    )
                );
              })
              .then((buffer) => {
                response.writeHead(200, {
                  "Content-Type": "image/jpeg",
                  "Cache-Control":
                    "public, max-age=31536000, s-maxage=31536000",
                });
                response.end(buffer, "binary");
              })
              .catch((err) => {
                console.error(err);
                response.status(500);
              });
          }
        });
      }
    });
  });

export const getDeckInfo = functions.https.onRequest((request, response) => {
  getSnapshot(request, response).then(([snapshot, _]) => {
    if (snapshot) {
      response.status(200).end(JSON.stringify(getDeckInfoObject(snapshot)));
    }
  });
});
