import deepEqual from "deep-equal";
import type {
  Character,
  OldPower,
  Power,
  PowerText,
} from "../../../../firestore/wiki/character";
import { makeId } from "../../../../makeId";
import crypto from "crypto";

function getHashId(value: string) {
  return crypto.createHash("sha1").update(value).digest("hex").substr(0, 5);
}

function upConvertPowersList(powers: OldPower[]): Power[] {
  return powers.map((v) => ({
    id: makeId(),
    texts: v.texts.reduce((acc, w, i) => {
      w = w.replace(/[|]/g, "");
      if (i === 0) {
        const text = w.replace(/\(?$/, "").trim();
        acc.push({
          text,
          optional: v.optional,
          id: getHashId(text),
          fromBase: false,
        });
      } else {
        const [left, right] = w.split(")");
        acc.push({
          text: left,
          optional: true,
          id: getHashId(left),
          fromBase: false,
        });
        if (right) {
          const text = right.replace(/\($/, "").trim();
          acc.push({
            text,
            optional: false,
            id: getHashId(text),
            fromBase: false,
          });
        }
      }
      return acc;
    }, [] as PowerText[]),
    fromBase: false,
  }));
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
            if (txt.text) {
              const newRaw = toRaw([...matchingText, txt]);
              if (
                newRaw.length <= baseRaw.length &&
                baseRaw.startsWith(newRaw)
              ) {
                matchingText.push(txt);
              }
            }
          });
          return matchingText;
        });
        if (roleTexts.find((v) => v.length !== 1)) {
          let options = [
            [baseText.text],
            ...roleTexts.map((v) => v.map((w) => w.text)),
          ]
            .map((v) => v.filter((w) => w))
            .filter((v, i, arr) => arr.findIndex((w) => deepEqual(w, v)) === i);
          if (
            options.length > 1 &&
            (baseText.optional ||
              roleTexts.find((v) => v.find((w) => w.optional)))
          ) {
            console.log(baseText, roleTexts, options);
            throw new Error("TODO: Optional Split Found");
          }
          if (options.length > 2) {
            console.log(options);
            throw new Error("TODO: Multi Option Converge Found");
          }
          const resultOpts = (options[0].length > (options[1]?.length || -1)
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
