import firebase from "firebase/app";
import "firebase/performance";
import "firebase/analytics";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { firestore } from "firebase/app";
import { useEffect } from "react";
import { useCollection } from "react-firebase-hooks/firestore";

export let db: firestore.Firestore;
export let storage: firebase.storage.Storage;

export const initFirebase = process.env.FIREBASE_FUNCTIONS
  ? Promise.resolve()
  : // @ts-ignore
    fetch("/__/firebase/init.json")
      // @ts-ignore
      .then((response) => response.json())
      // @ts-ignore
      .then((v) => {
        const app = firebase.initializeApp(v);

        if (v.measurementId) {
          firebase.analytics();
        }
        firebase.performance();
        db = firestore(app);
        if (process.env.NODE_ENV !== "production") {
          db.settings({
            host: "localhost:8080",
            ssl: false,
          });
        }

        if (process.env.NODE_ENV !== "development") {
          firebase.firestore().enablePersistence();
        }
        storage = firebase.storage();
      });

let updatingUser = false;

export function useUser() {
  const auth = useAuthState(firebase.auth())[0]!;

  useEffect(() => {
    if (auth && !updatingUser) {
      updatingUser = true;
      db.collection("accounts")
        .where("uid", "==", auth.uid)
        .get()
        .then((v) => {
          const updateData: DbUser = {
            uid: auth.uid,
            displayName: auth.displayName,
            photoURL: auth.photoURL,
            email: auth.email,
          };
          if (v.docs.length) {
            db.collection("accounts")
              .doc(v.docs[0].id)
              .set({ ...v.docs[0].data(), ...updateData });
          } else {
            db.collection("accounts").add(updateData);
          }
          updatingUser = false;
        });
    }
  }, [auth]);

  return auth;
}

export interface DbUser {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}

export function useUsers() {
  return useCollection(db.collection("accounts")) as [
    firestore.QuerySnapshot<DbUser> | undefined,
    boolean,
    Error | undefined
  ];
}
