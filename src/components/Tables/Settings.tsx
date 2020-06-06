import React, { ChangeEvent } from "react";
import {
  FormHelperText,
  Select,
  TextField,
  CircularProgress,
  MenuItem,
  Avatar,
  Link,
  InputLabel,
  FormControlLabel,
  FormControl,
} from "@material-ui/core";
import { RouteComponentProps } from "react-router";
import { useTable, useUpdateTable, Table } from "../../firestore/tables";
import { useUser, useUsers } from "../../firebase";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  fill: {
    width: "100%",
  },
}));

export function Settings({
  match: {
    params: { id },
  },
}: RouteComponentProps<{ id: string }>) {
  const [table, , error] = useTable(id);
  const [updateTable, updateError] = useUpdateTable(id);
  const user = useUser();
  const [users, usersLoading, usersError] = useUsers();
  const styles = useStyles();

  const data = table?.data();

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
    </div>
  );
}
