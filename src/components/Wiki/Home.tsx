import React from "react";
import { Container, Typography } from "@material-ui/core";

export function Home() {
  return (
    <Container>
      <Typography>
        Welcome to the wiki, this is a bit more structured than your standard
        wiki like <a href="https://wikipedia.com">Wikipedia</a> but the concept
        remains the same.
      </Typography>
    </Container>
  );
}
