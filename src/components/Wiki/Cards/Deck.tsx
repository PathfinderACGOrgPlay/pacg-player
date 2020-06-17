import React, { useState } from "react";
import { RouteComponentProps } from "react-router";
import {
  Button,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogContent,
} from "@material-ui/core";
import {
  Card as CardType,
  useCards,
  useCreateCard,
} from "../../../firestore/wiki/card";
import { makeStyles } from "@material-ui/core/styles";
import { ErrorDisplay } from "../../Common/ErrorDisplay";
import EditIcon from "@material-ui/icons/Edit";
import { Link as RouterLink } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  removedSwitch: {
    float: "right",
  },
  clear: {
    clear: "both",
  },
  editIcon: {
    float: "right",
  },
  cardImage: {
    width: 114,
    minWidth: 114,
    backgroundSize: "contain",
  },
  cardRoot: {
    display: "flex",
    cursor: "hand",
  },
  cardBody: {
    flex: "1 0 auto",
    minHeight: 160,
  },
  dialogImage: {
    width: 400,
    minWidth: 400,
  },
  dialogContent: {
    display: "flex",
    flexDirection: "row",
  },
  dialogBody: {
    marginLeft: theme.spacing(3),
  },
}));

function CardDisplay({
  card,
  systemId,
  deckId,
  id,
}: {
  card: CardType;
  systemId: string;
  deckId: string;
  id: string;
}) {
  const [open, setOpen] = useState(false);
  const styles = useStyles();

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setOpen(false)}
        open={open}
      >
        <DialogContent className={styles.dialogContent}>
          <img className={styles.dialogImage} src={card.image} alt="" />
          <div className={styles.dialogBody}>
            <Typography gutterBottom variant="h5">
              {card.name}
            </Typography>
            <Typography>{card.subDeck}</Typography>
            <Typography gutterBottom>{card.type}</Typography>
            <Typography>Count: {card.count}</Typography>
            <Typography gutterBottom>
              Traits: {card.traits?.join(", ")}
            </Typography>
            {card.powers ? (
              <>
                <Typography gutterBottom variant="h6">
                  Powers
                </Typography>
                {card.powers.split("\n").map((v, i) => (
                  <Typography key={i}>{v}&nbsp;</Typography>
                ))}
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
      <Card className={styles.cardRoot} onClick={() => setOpen(true)}>
        <CardMedia className={styles.cardImage} image={card.image} title="" />
        <CardContent className={styles.cardBody}>
          <IconButton
            component={RouterLink}
            to={`/wiki/cards/${systemId}/${deckId}/${id}/edit`}
            size="small"
            className={styles.editIcon}
          >
            <EditIcon />
          </IconButton>
          <Typography gutterBottom variant="h5">
            {card.count && card.count !== 1 ? `(${card.count}) ` : null}
            {card.name}
          </Typography>
          <Typography>{card.subDeck}</Typography>
          <Typography>{card.type}</Typography>
        </CardContent>
      </Card>
    </>
  );
}

export function Deck({
  match: {
    params: { systemId, deckId },
  },
}: RouteComponentProps<{ systemId: string; deckId: string }>) {
  const [showRemoved, setShowRemoved] = useState(false);
  const [cards, loading, cardsError] = useCards(systemId, deckId);
  const create = useCreateCard(systemId, deckId);
  const styles = useStyles();

  return (
    <Container>
      <br />
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
      <div className={styles.clear} />
      {loading ? <CircularProgress /> : null}
      <ErrorDisplay label="Failed to load cards" error={cardsError} />
      <Grid container spacing={3}>
        {cards?.docs.map((v) => (
          <Grid item xs={4}>
            <CardDisplay
              id={v.id}
              card={v.data()}
              systemId={systemId}
              deckId={deckId}
            />
          </Grid>
        ))}
      </Grid>
      <Button onClick={create}>Add Card</Button>
    </Container>
  );
}
