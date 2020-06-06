import React from "react";
import { Button, CircularProgress } from "@material-ui/core";
import { RouteComponentProps } from "react-router";
import { useAccountCharacter } from "../../firestore/characters";
import {
  useChronicleSheetsForCharacter,
  useCreateChronicleSheet,
} from "../../firestore/chronicles";
import { Chronicle } from "../Common/Chronicle";

export function Chronicles({
  match: {
    params: { id },
  },
}: RouteComponentProps<{ id: string }>) {
  const [character, , error] = useAccountCharacter(id);
  const [chronicles, loading, chroniclesError] = useChronicleSheetsForCharacter(
    id
  );
  const createSheet = useCreateChronicleSheet(id);

  const data = character?.data();
  const sortedChronicles = chronicles?.docs
    .map((v) => ({ id: v.id, ...v.data() }))
    .sort((a, b) => {
      const aIdx = data?.chronicleOrder?.indexOf(a.id);
      const bIdx = data?.chronicleOrder?.indexOf(a.id);

      if (aIdx !== undefined && bIdx !== undefined) {
        if (aIdx === -1 && bIdx !== -1) {
          return -1;
        }
        if (aIdx !== -1 && bIdx === -1) {
          return 1;
        }
        if (aIdx > bIdx) {
          return 1;
        }
        if (aIdx < bIdx) {
          return -1;
        }
      }

      return (a.date?.toMillis() || 0) - (b.date?.toMillis() || 0);
    });
  return (
    <div>
      {error ? <div>Failed to read character: {error.message}</div> : null}
      {chroniclesError ? (
        <div>Failed to read chronicles: {chroniclesError.message}</div>
      ) : null}
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {sortedChronicles?.map((v) => (
            <Chronicle sheet={v} id={v.id} key={v.id} />
          ))}
        </>
      )}
      <br />
      <Button onClick={() => createSheet()} className="chroniclePrintHide">
        Add Chronicle Sheet
      </Button>
    </div>
  );
}
