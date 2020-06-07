import React, { useState } from "react";
import { Container, Grid, Link } from "@material-ui/core";
import { SystemDropdown } from "../Common/SystemDropdown";
import { Link as RouterLink } from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";

export function Home() {
  const [select, setSelect] = useState("");

  return (
    <Container>
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <SystemDropdown fullWidth value={select} setValue={setSelect} />
        </Grid>
        <Grid item xs={5} />
        <Grid item xs={1}>
          <Link component={RouterLink} to="/wiki/characters/edit">
            <EditIcon />
          </Link>
        </Grid>
      </Grid>
    </Container>
  );
}
