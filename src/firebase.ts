import firebase from "firebase/app";
import "firebase/performance";
import "firebase/analytics";
import { useAuthState } from "react-firebase-hooks/auth";

export const initFirebase = fetch("/__/firebase/init.json")
  .then((response) => response.json())
  .then((v) => {
    firebase.initializeApp(v);
    firebase.analytics();
    firebase.performance();
  });

export function useUser() {
  return useAuthState(firebase.auth())[0]!;
}
