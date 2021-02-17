import React from "react";
import {
  useManagedTables,
  usePlayingTables,
  Table as TableType,
  useCreateTable,
} from "../../firestore/tables";
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import firebase from "firebase";
import { useHistory } from "react-router";

const useStyles = makeStyles((theme) => ({
  card: {
    cursor: "pointer",
  },
}));

function TableList({
  error,
  list,
}: {
  list: firebase.firestore.QuerySnapshot<TableType> | undefined;
  error: Error | undefined;
}) {
  const styles = useStyles();
  const history = useHistory();

  return (
    <Grid container spacing={3}>
      {error ? <div>Failed to load tables: {error.message} </div> : null}
      {list?.docs.map((v) => {
        const data = v.data();
        return (
          <Grid item lg={6} key={v.id}>
            <Card
              className={styles.card}
              onClick={() => history.push(`/tables/${v.id}`)}
            >
              <CardContent>
                <Typography variant="h5" component="h2">
                  {data.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}

export function Home() {
  const [
    managedTables,
    managedTablesLoading,
    managedTablesError,
  ] = useManagedTables();
  const [
    playingTables,
    playingTablesLoading,
    playingTablesError,
  ] = usePlayingTables();
  const createTable = useCreateTable();

  return (
    <Container>
      <Typography variant="h4" component="h2">
        Tables I'm Playing In
      </Typography>
      {playingTablesLoading ? (
        <CircularProgress />
      ) : (
        <TableList error={playingTablesError} list={playingTables} />
      )}
      <br />
      {managedTablesLoading && !playingTablesLoading ? (
        <CircularProgress />
      ) : managedTablesLoading || !managedTables?.docs.length ? null : (
        <>
          <br />
          <Typography variant="h4" component="h2">
            Tables Managed By Me
          </Typography>
          <TableList error={managedTablesError} list={managedTables} />
          <br />
        </>
      )}
      <Button disabled title="Not Implemented">
        Find Open Table (Soon&trade;)
      </Button>
      <Button onClick={createTable}>Create Table</Button>
    </Container>
  );
}
