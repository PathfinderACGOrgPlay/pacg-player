import React, { ChangeEvent, useState } from "react";
import {
  FormHelperText,
  Select,
  TextField,
  CircularProgress,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Input,
  CardHeader,
} from "@material-ui/core";
import { RouteComponentProps } from "react-router";
import {
  useTable,
  useUpdateTable,
  Table,
  useAddTableCharacterByOrgPlayId,
  useAddTableCharacterByDeckId,
  useRemoveTableCharacterByDeckId,
} from "../../firestore/tables";
import { useUser, useUsers } from "../../firebase";
import { makeStyles } from "@material-ui/core/styles";
import { useAccountCharacterList } from "../../firestore/characters";
import { useEqualsMemo } from "../../useEqualsMemo";

const useStyles = makeStyles((theme) => ({
  fill: {
    width: "100%",
  },
  or: {
    display: "inline-block",
    marginTop: theme.spacing(2.5),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  orButton: {
    display: "inline-block",
    marginLeft: theme.spacing(1),
  },
  orField: {
    display: "inline-block",
  },
  remove: {
    position: "absolute",
    right: theme.spacing(1),
    bottom: theme.spacing(1),
  },
  characterCard: {
    position: "relative",
  },
}));

export function Settings({
  match: {
    params: { id },
  },
}: RouteComponentProps<{ id: string }>) {
  const [table, , error] = useTable(id);
  const [updateTable, updateError] = useUpdateTable(id);
  const [
    addTableCharacterByOrgPlayId,
    addTableCharacterByOrgPlayIdError,
  ] = useAddTableCharacterByOrgPlayId(id);
  const [
    addTableCharacterByDeckId,
    addTableCharacterByDeckIdError,
  ] = useAddTableCharacterByDeckId(id);
  const [
    removeTableCharacterByDeckId,
    removeTableCharacterByDeckIdError,
  ] = useRemoveTableCharacterByDeckId(id);
  const user = useUser();
  const [users, usersLoading, usersError] = useUsers();
  const styles = useStyles();
  const [orgPlayId, setOrgPlayId] = useState("");
  const [deckId, setDeckId] = useState("");
  const [addScenario, setAddScenario] = useState("");

  const data = table?.data();
  const [
    characters,
    charactersLoading,
    charactersError,
  ] = useAccountCharacterList(
    useEqualsMemo(() => data?.characters || [], [data])
  );

  if (data?.managers.indexOf(user.uid) === -1) {
    return null;
  }

  function commonProps(key: keyof Table) {
    return {
      value: data?.[key] || "",
      onChange: (e: ChangeEvent<HTMLInputElement>) =>
        updateTable({ ...data!, [key]: e.currentTarget.value }),
      className: styles.fill,
    };
  }

  return (
    <div>
      {error ? <div>Error While Loading Table: {error.message}</div> : null}
      {error ? <div>Error While Updating Table: {updateError}</div> : null}
      {addTableCharacterByOrgPlayIdError ? (
        <div>
          Error While Adding Player: {addTableCharacterByOrgPlayIdError.message}
        </div>
      ) : null}
      {addTableCharacterByDeckIdError ? (
        <div>
          Error While Adding Player: {addTableCharacterByDeckIdError.message}
        </div>
      ) : null}
      {removeTableCharacterByDeckIdError ? (
        <div>
          Error While Removing Player:{" "}
          {removeTableCharacterByDeckIdError.message}
        </div>
      ) : null}
      <br />
      <TextField
        id="name"
        label="Name"
        helperText="This is a description for you and your players to find this table by, typically you will want to include your event or location name and date"
        {...commonProps("name")}
      />
      {usersError ? (
        <div>Error While Loading Users: {usersError.message}</div>
      ) : (
        <FormControl className={styles.fill}>
          <InputLabel>Table Managers</InputLabel>
          <Select
            id="managers"
            value={data?.managers || []}
            multiple
            onChange={(e) =>
              updateTable({ ...data!, managers: e.target.value as string[] })
            }
            IconComponent={
              usersLoading
                ? (props) => <CircularProgress {...props} size="1.25em" />
                : undefined
            }
          >
            {users?.docs.map((v) => {
              const data = v.data();
              return (
                <MenuItem value={data.uid} key={data.uid}>
                  {data.displayName || data.email}
                </MenuItem>
              );
            })}
          </Select>
          <FormHelperText>
            The list of people who can manage this table, typically it will only
            be yourself but you may want to add any event organizers
          </FormHelperText>
        </FormControl>
      )}
      <br />
      <br />
      <Card>
        <CardHeader title="Characters" />
        <CardContent>
          {charactersError ? (
            <div>Error While Loading Characters: {charactersError}</div>
          ) : null}
          {charactersLoading ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={3}>
              {characters?.map((v) => {
                const data = v.data();
                if (!data) {
                  return null;
                }
                const userData = users?.docs
                  .find((v) => v.data().uid === data.uid)
                  ?.data();
                return (
                  <Grid item lg={6} key={v.id}>
                    <Card variant="outlined">
                      <CardContent className={styles.characterCard}>
                        <Typography variant="h4" component="h2">
                          {data.character}
                        </Typography>
                        <Typography>{data.characterDeck}</Typography>
                        <Typography>{data.orgPlayId || id}</Typography>
                        <Typography>
                          {userData?.displayName || userData?.email}
                        </Typography>
                        <Button
                          className={styles.remove}
                          onClick={() => removeTableCharacterByDeckId(v.id)}
                        >
                          Remove
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
          <div>
            <TextField
              className={styles.orField}
              id="orgPlayId"
              label="Organized Play Id"
              value={orgPlayId}
              onChange={(e) => setOrgPlayId(e.currentTarget.value)}
              disabled={!!deckId}
            />
            <Typography className={styles.or}>Or</Typography>
            <TextField
              className={styles.orField}
              id="deckId"
              label="Deck Id"
              value={deckId}
              onChange={(e) => setDeckId(e.currentTarget.value)}
              disabled={!!orgPlayId}
            />
            <IconButton
              className={styles.orButton}
              onClick={() => {
                if (orgPlayId) {
                  addTableCharacterByOrgPlayId(orgPlayId);
                  setOrgPlayId("");
                } else if (deckId) {
                  addTableCharacterByDeckId(deckId);
                  setDeckId("");
                }
              }}
            >
              +
            </IconButton>
          </div>
        </CardContent>
      </Card>
      <br />
      <Card>
        <CardHeader title="Scenarios" />
        <CardContent>
          {data?.scenarios.map((v, i) => (
            <Typography key={i}>
              {v.id}
              <IconButton
                onClick={() => {
                  updateTable({
                    ...data!,
                    scenarios: data!.scenarios.filter((v, j) => j !== i),
                  });
                  setAddScenario("");
                }}
              >
                -
              </IconButton>
            </Typography>
          ))}
          <FormControl>
            <Input
              id="add-scenario"
              value={addScenario}
              onChange={(e) => setAddScenario(e.currentTarget.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      updateTable({
                        ...data!,
                        scenarios: [
                          ...data!.scenarios,
                          { id: addScenario, custom: true },
                        ],
                      });
                      setAddScenario("");
                    }}
                  >
                    +
                  </IconButton>
                </InputAdornment>
              }
            />
            <FormHelperText>
              Feel free to enter whatever text you want here, this will be
              autofilled into the chronicle sheets in the scenario field for
              each player
            </FormHelperText>
          </FormControl>
        </CardContent>
      </Card>
    </div>
  );
}
