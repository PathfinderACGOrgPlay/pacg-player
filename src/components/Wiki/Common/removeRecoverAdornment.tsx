import { IconButton, InputAdornment } from "@material-ui/core";
import RestorePageIcon from "@material-ui/icons/RestorePage";
import DeleteIcon from "@material-ui/icons/Delete";
import React from "react";

export function removeRecoverAdornment<T>(
  removed: boolean,
  toggleRemove: () => void
) {
  return removed ? (
    <InputAdornment position="end">
      <IconButton onClick={toggleRemove} title="Recover">
        <RestorePageIcon />
      </IconButton>
    </InputAdornment>
  ) : (
    <InputAdornment position="end">
      <IconButton onClick={toggleRemove} title="Remove">
        <DeleteIcon />
      </IconButton>
    </InputAdornment>
  );
}
