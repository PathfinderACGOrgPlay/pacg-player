import * as admin from "firebase-admin";
const db = admin.firestore();

export function setHasCards() {
  console.log("setHasCards");
  return db
    .collection("wiki")
    .doc("Vm2bdLJuAnw8SRxYB0A5")
    .collection("deck")
    .listDocuments()
    .then((decks) =>
      Promise.all(
        decks.map((v) =>
          Promise.all([v.get(), v.collection("card").limit(1).get()]).then(
            ([doc, cards]) =>
              v.set({
                ...doc.data(),
                hasCards: !!cards.docs.length,
              })
          )
        )
      )
    )
    .then(() => {
      console.log("setHasCards done");
    });
}
