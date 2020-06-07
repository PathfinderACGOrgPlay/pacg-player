import React from "react";
import { AppBar, CircularProgress, Tabs } from "@material-ui/core";
import { Redirect, Route, RouteComponentProps } from "react-router";
import { useTable } from "../../firestore/tables";
import { useAccountCharacterList } from "../../firestore/characters";
import { useEqualsMemo } from "../../useEqualsMemo";
import { CharacterDisplay } from "../Characters/Character";
import { CharacterTab } from "./CharacterTab";

export function Players({
  match: {
    params: { id, characterId },
  },
}: RouteComponentProps<{ id: string; characterId: string }>) {
  const [table, , error] = useTable(id);

  const tableData = table?.data();
  const [
    characters,
    charactersLoading,
    charactersError,
  ] = useAccountCharacterList(
    useEqualsMemo(() => tableData?.characters || [], [tableData])
  );
  return (
    <div>
      {error ? <div>Error While Loading Table: {error.message}</div> : null}
      {charactersError ? (
        <div>Error While Loading Characters: {charactersError.message}</div>
      ) : null}
      {charactersLoading ? <CircularProgress /> : null}
      <AppBar position="static" color="default">
        <Tabs value={characterId}>
          {characters?.map((v) => (
            <CharacterTab key={v.id} id={v.id} data={v.data()} />
          ))}
        </Tabs>
      </AppBar>
      {characters?.[0] ? (
        <Route exact path={`/tables/${id}/players`}>
          <Redirect to={`/tables/${id}/players/${characters[0].id}`} />
        </Route>
      ) : null}
      {characterId ? (
        <CharacterDisplay
          id={characterId}
          baseRoute={`/tables/${id}/players`}
        />
      ) : null}
    </div>
  );
}
