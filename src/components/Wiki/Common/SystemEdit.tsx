import {
  Button,
  Grid,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Switch,
} from "@material-ui/core";
import {
  CardSystem,
  useCardSystems,
  useCreateCardSystem,
  useUpdateCardSystem,
} from "../../../firestore/wiki/card-systems";
import React, { ChangeEvent, useState } from "react";
import { ErrorDisplay } from "../../Common/ErrorDisplay";
import { useDebounceUpdate } from "../../Common/useDebounceUpdate";
import DeleteIcon from "@material-ui/icons/Delete";
import RestorePageIcon from "@material-ui/icons/RestorePage";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  removedSwitch: {
    float: "right",
  },
}));

function System({ system, id }: { system: CardSystem; id: string }) {
  const [update, updateError] = useUpdateCardSystem(id);

  return (
    <div>
      <ErrorDisplay error={updateError} label="Failed to update system" />
      <TextField
        fullWidth
        id={`name-${id}`}
        label="System Name"
        {...useDebounceUpdate(
          system.name,
          (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
          (name) => update({ ...system, name })
        )}
        InputProps={{
          endAdornment: system.removed ? (
            <InputAdornment position="end">
              <IconButton
                onClick={() => update({ ...system, removed: false })}
                title="Recover"
              >
                <RestorePageIcon />
              </IconButton>
            </InputAdornment>
          ) : (
            <InputAdornment position="end">
              <IconButton
                onClick={() => update({ ...system, removed: true })}
                title="Remove"
              >
                <DeleteIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
}

export function SystemEdit() {
  const createCardSystem = useCreateCardSystem();
  const [showRemoved, setShowRemoved] = useState(false);
  const [systems, loading, error] = useCardSystems(showRemoved);
  const styles = useStyles();

  return (
    <>
      {loading ? <CircularProgress /> : null}
      <ErrorDisplay error={error} label="Failed to load systems" />
      <Grid container>
        <Grid item xs={4}>
          <Typography variant="h5">
            Systems
            <FormControlLabel
              className={styles.removedSwitch}
              control={
                <Switch
                  checked={showRemoved}
                  onChange={(e) => setShowRemoved(e.currentTarget.checked)}
                />
              }
              label="Show Removed"
            />
          </Typography>
          {systems?.docs.map((v) => (
            <System key={v.id} id={v.id} system={v.data()} />
          ))}
        </Grid>
      </Grid>
      <Button onClick={() => createCardSystem()}>Create</Button>
    </>
  );
}
