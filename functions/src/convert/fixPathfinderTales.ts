import * as admin from "firebase-admin";
const db = admin.firestore();

export function fixPathfinderTales() {
  console.log("fixPathfinderTales");
  return db
    .collection("wiki")
    .doc("Vm2bdLJuAnw8SRxYB0A5")
    .collection("deck")
    .doc("SezOcJ0aUXaKsSPafirm")
    .collection("card")
    .listDocuments()
    .then((cards) =>
      cards.map((v) =>
        v.get().then((card): any => {
          const data: any = card.data();
          if (data.subDeck.indexOf(" Cards") !== -1) {
            return card.ref.set({
              ...card.data(),
              subDeck: `Adventure ${data.subDeck[0]}`,
            });
          }
        })
      )
    )
    .then(() => {
      console.log("fixPathfinderTales done");
    });
}
