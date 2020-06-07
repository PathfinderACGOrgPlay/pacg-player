import charactersJson from "./characters.json";
import {
  useCardSystems,
  useCreateCardSystem,
  useUpdateCardSystem,
} from "../firestore/wiki/card-systems";
import React, { useEffect, useMemo } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../firebase";
import {
  Deck,
  useCreateDeck,
  useDecks,
  useUpdateDeck,
} from "../firestore/wiki/deck";
import { CircularProgress } from "@material-ui/core";
import {
  useCharacters,
  Character,
  useCreateCharacter,
  useUpdateCharacter,
} from "../firestore/wiki/character";

// Once the import looks good and have made it to prod remove this with characters.json
export function ImportCharacters() {
  const [systems, loading] = useCardSystems();

  const system = systems?.docs
    .map((v) => ({ id: v.id, data: v.data() }))
    .find(
      (v) =>
        v.data.name === "Pathfinder Adventure Card Game" ||
        v.data.name === "New Card System"
    );

  const createSystem = useCreateCardSystem();
  const [update] = useUpdateCardSystem(system?.id || "");

  useEffect(() => {
    if (!loading && !system) {
      createSystem();
    } else if (!loading && system?.data.name === "New Card System") {
      update({ ...system.data, name: "Pathfinder Adventure Card Game" });
    }
  }, [createSystem, loading, system, update]);

  return system?.id && system.data.name === "Pathfinder Adventure Card Game" ? (
    <ImportDecks systemId={system.id} />
  ) : (
    <CircularProgress />
  );
}

function ImportDecks({ systemId }: { systemId: string }) {
  const decks = Object.values(charactersJson).reduce((acc, v) => {
    Object.keys(v).forEach((w) => acc.add(w));
    return acc;
  }, new Set<string>());

  const [deckObjs, loading] = useCollection(
    db?.collection("wiki").doc(systemId).collection("deck")
  );
  const missing = useMemo(() => {
    let result: string | null = null;
    if (deckObjs) {
      const deckArr = [...decks];
      const deckObjData = deckObjs.docs.map((v) => v.data() as Deck);
      for (let i = 0; i < deckArr.length && !result; i++) {
        if (!deckObjData.find((v) => v.name === deckArr[i])) {
          result = deckArr[i];
        }
      }
      return result;
    }
  }, [deckObjs, decks]);

  return loading ? (
    <CircularProgress />
  ) : missing ? (
    <CreateDeck systemId={systemId} name={missing} />
  ) : (
    <CreateCharacters systemId={systemId} />
  );
}

function CreateDeck({ systemId, name }: { systemId: string; name: string }) {
  const [decks, loading] = useDecks(systemId);
  const deck = decks?.docs
    .map((v) => ({ id: v.id, data: v.data() }))
    .find((v) => v.data.name === name || v.data.name === "New Deck");
  const create = useCreateDeck(systemId);
  const [update] = useUpdateDeck(systemId, deck?.id || "");

  useEffect(() => {
    if (!loading && !deck) {
      create();
    } else if (!loading && deck?.data.name === "New Deck") {
      update({ ...deck.data, name: name });
    }
  }, [create, deck, loading, name, update]);

  return <CircularProgress />;
}

function CreateCharacters({ systemId }: { systemId: string }) {
  const [characters, charactersLoading] = useCharacters(systemId);
  const [decks, decksLoading] = useDecks(systemId);
  const loading = charactersLoading || decksLoading;

  const decksData = decks?.docs.map((v) => ({ id: v.id, data: v.data() }));
  const charactersData = characters?.docs.map((v) => ({
    id: v.id,
    deck: decksData?.find((w) => w.id === v.ref.path.split("/")[3])?.data.name,
    data: v.data() as Character,
  }));

  const missingCharacter = useMemo(() => {
    if (charactersData) {
      return Object.keys(charactersJson)
        .map((name) => ({
          name,
          // @ts-ignore
          data: charactersJson[name],
        }))
        .map((v) => {
          const matchingCharacters = charactersData.filter(
            (w) => w.data.name === v.name
          );
          return Object.keys(v.data)
            .map((name) => ({
              character: v.name,
              deck: name,
              data: v.data[name],
            }))
            .find((v) => !matchingCharacters.find((w) => w.deck === v.deck));
        })
        .find((v) => v);
    }
    return undefined;
  }, [charactersData]);

  return loading ? (
    <CircularProgress />
  ) : missingCharacter ? (
    <CreateCharacter
      deckId={
        decksData?.find((v) => v.data.name === missingCharacter?.deck)?.id
      }
      systemId={systemId}
      missingCharacter={missingCharacter}
    />
  ) : (
    <div />
  );
}

const order: any = {
  Strength: 0,
  Dexterity: 1,
  Constitution: 2,
  Intelligence: 3,
  Wisdom: 4,
  Charisma: 5,
};

function CreateCharacter({
  deckId,
  systemId,
  missingCharacter,
}: {
  deckId: string | undefined;
  systemId: string | undefined;
  missingCharacter: { character: string; data: any };
}) {
  const [decks, loading] = useCharacters(systemId || "", deckId || "");
  const char = decks?.docs
    .map((v) => ({ id: v.id, data: v.data() }))
    .find(
      (v) =>
        v.data.name === missingCharacter.character ||
        v.data.name === "New Character"
    );
  const create = useCreateCharacter(systemId || "", deckId || "");
  const [update] = useUpdateCharacter(
    systemId || "",
    deckId || "",
    char?.id || ""
  );

  function convertPowers(v: any) {
    if (v[0] === "") {
      return {
        optional: true,
        texts: v.slice(1),
      };
    } else {
      return {
        optional: false,
        texts: v,
      };
    }
  }

  useEffect(() => {
    if (!loading && !char) {
      create();
    } else if (!loading && char?.data.name === "New Character") {
      const updateResult = {
        ...char.data,
        name: missingCharacter.character,
        image: missingCharacter.data.image || "",
        traits: missingCharacter.data.traits,
        skills: Object.keys(missingCharacter.data.skills).reduce((acc, v) => {
          acc[v] = {
            ...missingCharacter.data.skills[v],
            order: order[v],
          };
          return acc;
        }, {} as any),
        base: {
          ...missingCharacter.data.powers,
          powers: missingCharacter.data.powers.powers.map(convertPowers),
        },
        roles: missingCharacter.data.roles.map((v: any) => ({
          name: v.name,
          ...v.powers,
          powers: v.powers.powers.map(convertPowers),
        })),
        cardsList: Object.keys(missingCharacter.data.cardsList).reduce(
          (acc, v) => {
            if (typeof missingCharacter.data.cardsList[v] !== "string") {
              acc[v] = missingCharacter.data.cardsList[v];
            }
            return acc;
          },
          {} as any
        ),
        extraCardsText: Object.keys(missingCharacter.data.cardsList).reduce(
          (acc, v) => {
            if (
              typeof missingCharacter.data.cardsList[v] === "string" &&
              missingCharacter.data.cardsList[v]
            ) {
              acc[v[0].toUpperCase() + v.substring(1)] =
                missingCharacter.data.cardsList[v];
            }
            return acc;
          },
          {} as any
        ),
      };
      try {
        update(updateResult);
      } catch (e) {
        console.log(updateResult);
        throw e;
      }
    }
  }, [
    create,
    char,
    loading,
    update,
    missingCharacter.character,
    missingCharacter.data,
  ]);

  return <CircularProgress />;
}
