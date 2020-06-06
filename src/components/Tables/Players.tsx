import React, { useState } from "react";
import {
  AppBar,
  CircularProgress,
  Container,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
import { Redirect, Route, RouteComponentProps } from "react-router";
import { useTable } from "../../firestore/tables";
import { useCreateChronicleSheet } from "../../firestore/chronicles";
import { useAccountCharacterList } from "../../firestore/characters";
import { useEqualsMemo } from "../../useEqualsMemo";
import { makeStyles } from "@material-ui/core/styles";
import { Link as RouterLink } from "react-router-dom";
import { CharacterDisplay } from "../Characters/Character";

const useStyles = makeStyles((theme) => ({
  addChronicle: {
    minWidth: "30em",
  },
}));

export function Players({
  match: {
    params: { id, characterId },
  },
}: RouteComponentProps<{ id: string; characterId: string }>) {
  const [table, , error] = useTable(id);
  const styles = useStyles();

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
          {characters?.map((v) => {
            const data = v.data();
            return (
              <Tab
                key={v.id}
                component={RouterLink}
                to={`/tables/${id}/players/${v.id}`}
                value={v.id}
                label={data?.character}
              />
            );
          })}
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
