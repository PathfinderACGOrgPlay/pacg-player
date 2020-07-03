import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { db } from "../../firebase";
import { firestore } from "firebase/app";
import { useCallback, useState } from "react";
import deepEqual from "deep-equal";

const collectionGroup = (systemId: string) =>
  db?.collectionGroup("wiki_character").where("systemId", "==", systemId);
const collection = (systemId: string, deckId: string) =>
  systemId && deckId
    ? db
        ?.collection("wiki")
        .doc(systemId)
        .collection("deck")
        .doc(deckId)
        .collection("wiki_character")
    : undefined;

export interface Skill {
  die: string;
  order?: number;
  feats: number;
  skills: { [key: string]: number };
}

export interface OldPower {
  optional: boolean;
  texts: string[];
}

export interface PowerText {
  optional: boolean;
  text: string;
  id: string;
  fromBase: boolean;
}

export interface Power {
  texts: PowerText[];
  id: string;
  fromBase: boolean;
}

export interface Powers<TPower = OldPower[] | Power[]> {
  powers: TPower;
  handSize: {
    base: number;
    add: number;
  };
  proficiencies:
    | {
        name: string;
        optional: boolean;
      }[]
    | undefined;
}

export interface CardListRow {
  base: number;
  add: number;
  order?: number;
}

export interface Character<TPower = OldPower[] | Power[]> {
  name: string;
  description?: string;
  removed: boolean;
  image: string;
  traits: string[];
  skills: { [key: string]: Skill };
  base: Powers<TPower>;
  roles: (Powers<TPower> & { name: string })[];
  cardsList: {
    [key: string]: CardListRow;
  };
  favoredCardType?: string;
  extraCardsText: { [key: string]: string };
}

function randomString(length: number, chars: string) {
  var result = "";
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

export function makeId() {
  return randomString(
    5,
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  );
}

function isPowerCharacer(char: Character): char is Character<Power[]> {
  return !char.base.powers.length || !!(char.base.powers[0] as Power).id;
}

function toRaw(powers: PowerText[]): string {
  return powers.reduce(
    (acc, v) => (acc + (v.optional ? `(${v.text})` : v.text)).trim(),
    ""
  );
}

export function upConvertPowersList(powers: OldPower[]): Power[] {
  return powers.map((v) => ({
    id: makeId(),
    texts: v.texts.reduce((acc, w, i) => {
      w = w.replace(/[|]/g, "");
      if (i === 0) {
        acc.push({
          text: w.replace(/\(?$/, "").trim(),
          optional: v.optional,
          id: makeId(),
          fromBase: false,
        });
      } else {
        const [left, right] = w.split(")");
        acc.push({ text: left, optional: true, id: makeId(), fromBase: false });
        if (right) {
          acc.push({
            text: right.replace(/\($/, "").trim(),
            optional: false,
            id: makeId(),
            fromBase: false,
          });
        }
      }
      return acc;
    }, [] as PowerText[]),
    fromBase: false,
  }));
}

export function upConvertPowers(
  char: Character,
  edit?: boolean
): Character<Power[]> & { upconvert: boolean } {
  if (isPowerCharacer(char)) {
    return { ...char, upconvert: false };
  } else {
    const { base, roles, ...rest } = char;

    const basePowers = upConvertPowersList(base.powers as OldPower[]);
    const rolePowers = roles.map((v) =>
      upConvertPowersList(v.powers as OldPower[])
    );

    const rawBasePowers = basePowers.map((v) => toRaw(v.texts));
    const roleBasePowers = rawBasePowers.map((base) =>
      rolePowers.map((role) =>
        role.find((x) => {
          const matchingText: PowerText[] = [];
          x.texts.forEach((txt) => {
            const newRaw = toRaw([...matchingText, txt]);
            if (newRaw.length <= base.length && base.startsWith(newRaw)) {
              matchingText.push(txt);
            }
          });
          return base === toRaw(matchingText);
        })
      )
    );
    basePowers.forEach((base, i) => {
      const role = roleBasePowers[i].map((v, j) => {
        if (!v) {
          if (edit) {
            rolePowers[j].push({
              id: base.id,
              fromBase: true,
              texts: base.texts.map(
                (v): PowerText => ({
                  id: v.id,
                  text: v.text,
                  optional: v.optional,
                  fromBase: true,
                })
              ),
            });
            return rolePowers[j][rolePowers[j].length - 1];
          }
          return base;
        } else {
          v.id = base.id;
          v.fromBase = true;
          return v;
        }
      });
      base.texts.forEach((baseText, i) => {
        const baseRaw = toRaw([baseText]);
        const roleTexts = role.map((v) => {
          const matchingText: PowerText[] = [];
          v.texts.forEach((txt) => {
            const newRaw = toRaw([...matchingText, txt]);
            if (newRaw.length <= baseRaw.length && baseRaw.startsWith(newRaw)) {
              matchingText.push(txt);
            }
          });
          return matchingText;
        });
        if (roleTexts.find((v) => v.length !== 1)) {
          const options = [
            [baseText.text],
            ...roleTexts.map((v) => v.map((w) => w.text)),
          ].filter((v, i, arr) => arr.findIndex((w) => deepEqual(w, v)) === i);
          if (
            options.length > 1 &&
            (baseText.optional ||
              roleTexts.find((v) => v.find((w) => w.optional)))
          ) {
            console.log(baseText, options);
            throw new Error("TODO: Optional Split Found");
          }
          if (options.length > 2) {
            console.log(options);
            throw new Error("TODO: Multi Option Converge Found");
          }
          const resultOpts = (options[0].length > (options[1]?.length || 0)
            ? options[0]
            : options[1]
          ).map(
            (v): PowerText => ({
              text: v,
              optional: baseText.optional,
              id: makeId(),
              fromBase: true,
            })
          );
          base.texts.splice(
            i,
            1,
            ...resultOpts.map((x) => ({ ...x, fromBase: false }))
          );
          role.forEach((v, j) => {
            v.texts.splice(
              v.texts.indexOf(roleTexts[j][0]),
              roleTexts[j].length + 1,
              ...resultOpts
            );
          });
        } else {
          roleTexts.forEach((v) => {
            v[0].id = baseText.id;
            v[0].fromBase = true;
          });
        }
      });
    });

    return {
      ...rest,
      base: {
        ...base,
        powers: basePowers,
      },
      roles: roles.map((v, i) => ({ ...v, powers: rolePowers[i] })),
      upconvert: true,
    };
  }
}

export function useCharacters(
  systemId: string,
  deckId?: string,
  deleted?: boolean
) {
  const start = deckId
    ? collection(systemId, deckId)
    : collectionGroup(systemId);

  return useCollection(
    (deleted ? start : start?.where("removed", "==", false))?.orderBy("name")
  ) as [
    firestore.QuerySnapshot<Character> | undefined,
    boolean,
    Error | undefined
  ];
}

export function useCreateCharacter(systemId: string, deckId: string) {
  return useCallback(
    () =>
      collection(systemId, deckId)?.add({
        name: "New Character",
        removed: false,
        systemId,
        image: "",
        traits: [],
        skills: {},
        base: {
          powers: [],
          handSize: {
            base: 0,
            add: 0,
          },
          proficiencies: [],
        },
        roles: [],
        cardsList: {},
        extraCardsText: {},
      }),
    [deckId, systemId]
  );
}

export function useUpdateCharacter(
  systemId: string,
  deckId: string,
  id: string
): [(sys: Character) => Promise<void> | undefined, Error | undefined] {
  const [updateError, setUpdateError] = useState<Error | undefined>();

  return [
    useCallback(
      (sys: Character) =>
        collection(systemId, deckId)?.doc(id).set(sys).catch(setUpdateError),
      [deckId, id, systemId]
    ),
    updateError,
  ];
}

export function useCharacter(systemId: string, deckId: string, id: string) {
  return useDocument(id ? collection(systemId, deckId)?.doc(id) : null) as [
    firestore.DocumentSnapshot<Character> | undefined,
    boolean,
    Error | undefined
  ];
}
