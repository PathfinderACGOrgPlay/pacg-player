import React, { ChangeEvent, useMemo, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Card, useCard, useUpdateCard } from "../../../firestore/wiki/card";
import {
  CircularProgress,
  Container,
  TextField,
  Button,
  Tab,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Input,
  InputAdornment,
  IconButton,
  FormHelperText,
  CardContent,
} from "@material-ui/core";
import { ErrorDisplay } from "../../Common/ErrorDisplay";
import { useDebounceUpdate } from "../../Common/useDebounceUpdate";
import { Link as RouterLink } from "react-router-dom";
import { selectLoadingComponent } from "../../Common/selectLoadingComponent";
import { makeStyles } from "@material-ui/core/styles";
import PublishIcon from "@material-ui/icons/Publish";

const useStyles = makeStyles((theme) => ({
  cardImage: {
    maxWidth: 600,
    marginRight: theme.spacing(3),
  },
  body: {
    flex: "1 0 auto",
  },
  container: {
    display: "flex",
  },
}));

export function CardEdit({
  match: {
    params: { systemId, deckId, cardId },
  },
}: RouteComponentProps<{ systemId: string; deckId: string; cardId: string }>) {
  const styles = useStyles();
  const [card, loading, error] = useCard(systemId, deckId, cardId);
  const [updateCard, updateError] = useUpdateCard(systemId, deckId, cardId);
  const [uploadError, setUploadError] = useState<Error | null>(null);
  const typesLoading = true;
  const adventuresLoading = true;
  const traitsLoading = true;

  function update(values: Partial<Card>) {
    if (data) {
      updateCard({
        ...data,
        ...values,
      });
    }
  }

  const data = card?.data();

  return (
    <Container>
      <br />
      <ErrorDisplay label="Failed to load card" error={error} />
      <ErrorDisplay label="Failed to update card" error={updateError} />
      <ErrorDisplay label="Failed to upload image" error={uploadError} />
      {loading ? <CircularProgress /> : null}
      <div className={styles.container}>
        {data?.image ? (
          <img src={data?.image} className={styles.cardImage} />
        ) : null}
        <div className={styles.body}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                id="name"
                fullWidth
                label="Name"
                {...useDebounceUpdate(
                  data?.name || "",
                  (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
                  (name) => update({ name })
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="adventure-label">Adventure / Level</InputLabel>
                <Select
                  labelId="adventure-label"
                  id="adventure-select"
                  {...useDebounceUpdate(
                    data?.adventure || "",
                    (e: ChangeEvent<{ name?: string; value: unknown }>) =>
                      e.target.value as string,
                    (adventure) => update({ adventure })
                  )}
                  IconComponent={selectLoadingComponent(adventuresLoading)}
                >
                  {/*systems?.docs.map((v) => (
                <MenuItem value={v.id} key={v.id}>
                  {v.data().name}
                </MenuItem>
              ))*/}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="type-label">Card Type</InputLabel>
                <Select
                  labelId="type-label"
                  id="type-select"
                  {...useDebounceUpdate(
                    data?.type || "",
                    (e: ChangeEvent<{ name?: string; value: unknown }>) =>
                      e.target.value as string,
                    (type) => update({ type })
                  )}
                  IconComponent={selectLoadingComponent(typesLoading)}
                >
                  {/*systems?.docs.map((v) => (
                <MenuItem value={v.id} key={v.id}>
                  {v.data().name}
                </MenuItem>
              ))*/}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="count"
                fullWidth
                type="number"
                label="Count"
                {...useDebounceUpdate(
                  data?.count?.toString() || "",
                  (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
                  (count) => update({ count: parseInt(count, 10) })
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="traits-label">Traits</InputLabel>
                <Select
                  labelId="traits-label"
                  id="traits-select"
                  multiple
                  {...useDebounceUpdate(
                    data?.traits || [],
                    (e: ChangeEvent<{ name?: string; value: unknown }>) =>
                      e.target.value as string[],
                    (traits) => update({ traits }),
                    undefined,
                    undefined,
                    data?.traits
                  )}
                  IconComponent={selectLoadingComponent(traitsLoading)}
                >
                  {/*systems?.docs.map((v) => (
                <MenuItem value={v.id} key={v.id}>
                  {v.data().name}
                </MenuItem>
              ))*/}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="image"
                fullWidth
                label="Image"
                {...useDebounceUpdate(
                  data?.image || "",
                  (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
                  (image) => update({ image })
                )}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        title="Upload"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";

                          input.onchange = (e) => {
                            // @ts-ignore
                            const file = e.target.files[0];
                            if (!file) {
                              setUploadError(new Error("Unknown"));
                              return;
                            } else if (file.size > 1000000) {
                              setUploadError(
                                new Error(
                                  "Please make sure your image is less than 1MB in size"
                                )
                              );
                              return;
                            }
                            setUploadError(null);
                            const reader = new FileReader();
                            reader.addEventListener(
                              "load",
                              function () {
                                update({
                                  image: this.result?.toString() || "",
                                });
                              },
                              false
                            );

                            reader.readAsDataURL(file);
                          };

                          input.click();
                        }}
                      >
                        <PublishIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </div>
      </div>
      <br />
      <br />
      <Button component={RouterLink} to={`/wiki/cards/${systemId}/${deckId}`}>
        Back
      </Button>
    </Container>
  );
}
