import * as admin from "firebase-admin";
const db = admin.firestore();

export function trimCardNames() {
  console.log("trimCardNames");
  return db
    .collection("wiki")
    .doc("Vm2bdLJuAnw8SRxYB0A5")
    .collection("deck")
    .listDocuments()
    .then((decks) =>
      Promise.all(
        decks.map((v) =>
          v
            .collection("card")
            .get()
            .then((cards) =>
              Promise.all(
                cards.docs.map((v): any => {
                  const data = v.data();
                  const trimmed = data.name.trim();
                  if (data.name !== trimmed) {
                    return v.ref.set({
                      ...data,
                      name: trimmed,
                    });
                  }
                })
              )
            )
        )
      )
    )
    .then(() => {
      console.log("trimCardNames done");
    });
}
