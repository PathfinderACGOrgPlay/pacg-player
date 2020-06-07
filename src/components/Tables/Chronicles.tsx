import React, { useState } from "react";
import {
  AppBar,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tabs,
  Typography,
} from "@material-ui/core";
import { Redirect, Route, RouteComponentProps } from "react-router";
import {
  ChronicleSheet,
  useChronicleSheetsForTable,
  useCreateChronicleSheet,
} from "../../firestore/chronicles";
import { useTable } from "../../firestore/tables";
import { useAccountCharacterList } from "../../firestore/characters";
import { useEqualsMemo } from "../../useEqualsMemo";
import { Chronicle } from "../Common/Chronicle";
import { makeStyles } from "@material-ui/core/styles";
import { CharacterTab } from "./CharacterTab";

const useStyles = makeStyles((theme) => ({
  addChronicle: {
    minWidth: "30em",
  },
}));

export function Chronicles({
  match: {
    params: { id, characterId },
  },
}: RouteComponentProps<{ id: string; characterId: string }>) {
  const [
    tableChronicles,
    loadTableChronicles,
    tableChroniclesError,
  ] = useChronicleSheetsForTable(id);
  const [table, , error] = useTable(id);
  const [selectedAdd, setSelectedAdd] = useState("");
  const styles = useStyles();
  const createSheet = useCreateChronicleSheet(characterId, id);

  const tableData = table?.data();
  const [
    characters,
    charactersLoading,
    charactersError,
  ] = useAccountCharacterList(
    useEqualsMemo(() => tableData?.characters || [], [tableData])
  );

  const availableChronicles = tableData?.characters.reduce((acc, v) => {
    acc[v] = [
      ...tableData?.scenarios
        .map((v) => v.id)
        .filter(
          (w) =>
            !tableChronicles?.docs.find((x) => {
              const cData = x.data();
              return cData.characterId === v && cData.scenario === w;
            })
        ),
    ];
    return acc;
  }, {} as { [playerId: string]: string[] });

  return (
    <Typography>
      {error ? <div>Error While Loading Table: {error.message}</div> : null}
      {tableChroniclesError ? (
        <div>
          Error While Loading Chronicles: {tableChroniclesError.message}
        </div>
      ) : null}
      {charactersError ? (
        <div>Error While Loading Characters: {charactersError.message}</div>
      ) : null}
      {loadTableChronicles || charactersLoading ? <CircularProgress /> : null}
      <AppBar position="static" color="default">
        <Tabs value={characterId}>
          {characters?.map((v) => (
            <CharacterTab key={v.id} id={v.id} data={v.data()} />
          ))}
        </Tabs>
      </AppBar>
      {characters?.[0] ? (
        <Route exact path={`/tables/${id}/chronicles`}>
          <Redirect to={`/tables/${id}/chronicles/${characters[0].id}`} />
        </Route>
      ) : null}
      {tableChronicles?.docs
        .map((v): ChronicleSheet & { id: string } => ({
          id: v.id,
          ...v.data(),
        }))
        .filter((v) => v.characterId === characterId)
        .map((v) => (
          <Chronicle id={v.id} sheet={v} key={v.id} />
        ))}
      {availableChronicles?.[characterId]?.length ? (
        <>
          <FormControl>
            <InputLabel id="add-chronicle-label">Add Chronicle</InputLabel>
            <Select
              labelId="add-chronicle-label"
              id="add-chronicle"
              value={selectedAdd}
              className={styles.addChronicle}
              onChange={(e) => setSelectedAdd(e.target.value as string)}
            >
              <MenuItem value="">&nbsp;</MenuItem>
              {availableChronicles?.[characterId].map((v) => (
                <MenuItem value={v} key={v}>
                  {v}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton
            disabled={!selectedAdd}
            onClick={() => {
              setSelectedAdd("");
              createSheet(selectedAdd);
            }}
          >
            +
          </IconButton>
        </>
      ) : null}
    </Typography>
  );
}
