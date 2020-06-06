import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  TextField,
} from "@material-ui/core";
import { useDeleteAccountCharacter } from "../../firestore/characters";
import { RouteComponentProps, useHistory } from "react-router";

const useStyles = makeStyles((theme) => ({
  fill: {
    width: "100%",
  },
  right: {
    float: "right",
  },
}));

export function Settings({
  match: {
    params: { id },
  },
}: RouteComponentProps<{ id: string }>) {
  const [deleteAccountCharacter, deleteError] = useDeleteAccountCharacter(id);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const styles = useStyles();
  const history = useHistory();

  return (
    <div>
      <br />
      {deleteError ? <div>{deleteError}</div> : null}
      <TextField
        id="deck-id"
        label="Deck Id"
        helperText="This is the id of your character, you may need it for troubleshooting"
        defaultValue={id}
        className={styles.fill}
        InputProps={{
          readOnly: true,
        }}
      />
      <Button
        variant="contained"
        color="primary"
        className={styles.right}
        onClick={() => setDeleteOpen(true)}
      >
        Delete
      </Button>
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Character</DialogTitle>
        <DialogContent id="delete-dialog-description">
          Are you sure you want to delete this character? This cannot be undone
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              deleteAccountCharacter();
              setDeleteOpen(false);
              history.push("/characters");
            }}
          >
            OK
          </Button>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
