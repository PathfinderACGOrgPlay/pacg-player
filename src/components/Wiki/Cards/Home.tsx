import React, { useState } from "react";
import { Container, Grid, Link, CircularProgress } from "@material-ui/core";
import { SystemDropdown } from "../Common/SystemDropdown";
import { Link as RouterLink } from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import { ErrorDisplay } from "../../Common/ErrorDisplay";
import { useDecks } from "../../../firestore/wiki/deck";

export function Home() {
  const [systemId, setSystemId] = useState("");
  const [decks, loading, error] = useDecks(systemId);

  return (
    <Container>
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <SystemDropdown
            id="cards-system"
            fullWidth
            value={systemId}
            setValue={setSystemId}
          />
        </Grid>
        <Grid item xs={8} />
        <Grid item xs={1}>
          <Link component={RouterLink} to="/wiki/cards/edit">
            <EditIcon />
          </Link>
        </Grid>
      </Grid>
      <br />
      {loading ? <CircularProgress /> : null}
      <ErrorDisplay label="Failed to load decks" error={error} />
      <Grid container spacing={3}>
        {decks?.docs.map((v) => (
          <Grid item xs={6} lg={3}>
            <Link component={RouterLink} to={`/wiki/cards/${systemId}/${v.id}`}>
              {v.data().name}
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
