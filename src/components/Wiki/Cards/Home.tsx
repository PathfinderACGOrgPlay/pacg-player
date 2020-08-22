import React, { useState } from "react";
import {
  Container,
  Grid,
  Link,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@material-ui/core";
import { SystemDropdown } from "../Common/SystemDropdown";
import { Link as RouterLink } from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import { ErrorDisplay } from "../../Common/ErrorDisplay";
import { useDecks } from "../../../firestore/wiki/deck";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  switches: {
    float: "right",
  },
}));

export function Home() {
  const styles = useStyles();
  const [systemId, setSystemId] = useState("");
  const [showRemoved, setShowRemoved] = useState(false);
  const [showNoCards, setShowNoCards] = useState(false);
  const [decks, loading, error] = useDecks(systemId, {
    withCards: !showNoCards,
    deleted: showRemoved,
  });

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
        <Grid item xs={9}>
          <Link
            className={styles.switches}
            component={RouterLink}
            to="/wiki/cards/edit"
          >
            <EditIcon />
          </Link>
          <FormControlLabel
            className={styles.switches}
            control={
              <Switch
                checked={showRemoved}
                onChange={(e) => setShowRemoved(e.currentTarget.checked)}
              />
            }
            label="Show Removed"
          />
          <FormControlLabel
            className={styles.switches}
            control={
              <Switch
                checked={showNoCards}
                onChange={(e) => setShowNoCards(e.currentTarget.checked)}
              />
            }
            label="Show Decks Without Cards"
          />
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
