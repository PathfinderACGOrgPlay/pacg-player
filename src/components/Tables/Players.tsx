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

  return (
    <div>
      {error ? <div>Error While Loading Table: {error.message}</div> : null}
      <AppBar position="static" color="default">
        <Tabs value={tableData?.characters?.indexOf(characterId)}>
          {tableData?.characters?.map((v) => (
            <CharacterTab
              key={v}
              tableId={id}
              subPath="players"
              characterId={v}
            />
          ))}
        </Tabs>
      </AppBar>
      {tableData?.characters?.[0] ? (
        <Route exact path={`/tables/${id}/players`}>
          <Redirect to={`/tables/${id}/players/${tableData?.characters[0]}`} />
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
