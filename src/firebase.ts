import firebase from "firebase/app";
import "firebase/performance";
import "firebase/analytics";
import { useAuthState } from "react-firebase-hooks/auth";
import { firestore } from "firebase";

export let db: firestore.Firestore;

export const initFirebase = fetch("/__/firebase/init.json")
  .then((response) => response.json())
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
  });

export function useUser() {
  return useAuthState(firebase.auth())[0]!;
}
