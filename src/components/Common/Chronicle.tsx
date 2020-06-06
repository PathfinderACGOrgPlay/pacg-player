import {
  ChronicleSheet,
  useUpdateChronicleSheet,
} from "../../firestore/chronicles";
import React, { ChangeEvent } from "react";
import Grid from "@material-ui/core/Grid";
import {
  makeStyles,
  TextField,
  Card,
  CardContent,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@material-ui/core";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { DateTime } from "luxon";
import { firestore } from "firebase";

const useStyles = makeStyles((theme) => ({
  fill: {
    width: "100%",
  },
  rewardCard: {
    padding: `${theme.spacing(1)}px !important`,
  },
  pointSpend: {
    alignItems: "center",
    verticalAlign: "middle",
    display: "inline-flex",
  },
}));

export function Chronicle({
  id,
  sheet,
}: {
  id: string;
  sheet: ChronicleSheet;
}) {
  const styles = useStyles();
  const [update, updateError] = useUpdateChronicleSheet(id);

  function SheetTextField<TKey extends keyof ChronicleSheet>({
    xs,
    sheetKey,
    subKey,
    label,
    multiline,
    rows,
    type,
  }: {
    xs: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    sheetKey: TKey;
    subKey?: keyof Exclude<ChronicleSheet[TKey], undefined>;
    label?: string;
    multiline?: boolean;
    rows?: number;
    type?: string;
  }) {
    const fieldProps = subKey
      ? {
          // @ts-ignore
          value: (sheet[sheetKey] || {})[subKey] || "",
          onChange: (e: ChangeEvent<HTMLInputElement>) =>
            update({
              ...sheet,
              [sheetKey]: {
                // @ts-ignore
                ...sheet[sheetKey],
                [subKey]: e.currentTarget.value,
              },
            }),
        }
      : {
          value: sheet[sheetKey] || "",
          onChange: (e: ChangeEvent<HTMLInputElement>) =>
            update({ ...sheet, [sheetKey]: e.currentTarget.value }),
        };

    return (
      <Grid item xs={xs}>
        <TextField
          id={`${sheetKey}-${subKey || ""}-${id}`}
          className={styles.fill}
          label={label}
          multiline={multiline}
          rows={rows}
          type={type}
          {...fieldProps}
        />
      </Grid>
    );
  }

  function SheetDateField<TKey extends keyof ChronicleSheet>({
    xs,
    sheetKey,
    subKey,
    label,
  }: {
    xs: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    sheetKey: TKey;
    subKey?: keyof Exclude<ChronicleSheet[TKey], undefined>;
    label?: string;
  }) {
    const fieldProps = subKey
      ? {
          value:
            // @ts-ignore
            ((sheet[sheetKey] || {})[subKey] as firestore.Timestamp) || null,
          onChange: (date: DateTime | null) =>
            update({
              ...sheet,
              [sheetKey]: {
                // @ts-ignore
                ...sheet[sheetKey],
                [subKey]: date?.toJSDate() || null,
              },
            }),
        }
      : {
          value: (sheet[sheetKey] as firestore.Timestamp) || null,
          onChange: (date: DateTime | null) => {
            return update({ ...sheet, [sheetKey]: date?.toJSDate() || null });
          },
        };

    return (
      <Grid item xs={xs}>
        <KeyboardDatePicker
          id={`${sheetKey}-${subKey || ""}-${id}`}
          className={styles.fill}
          variant="inline"
          format="MM/dd/yyyy"
          label={label}
          value={fieldProps.value?.toDate()}
          onChange={fieldProps.onChange as any}
        />
      </Grid>
    );
  }

  function SheetCheckField<TKey extends keyof ChronicleSheet>({
    xs,
    sheetKey,
    subKey,
    label,
    labelAfter,
  }: {
    xs: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    sheetKey: TKey;
    subKey?: keyof Exclude<ChronicleSheet[TKey], undefined>;
    label: string;
    labelAfter?: boolean;
  }) {
    const fieldProps = subKey
      ? {
          // @ts-ignore
          checked: (sheet[sheetKey] || {})[subKey] || false,
          onChange: (
            e: React.ChangeEvent<HTMLInputElement>,
            checked: boolean
          ) =>
            update({
              ...sheet,
              [sheetKey]: {
                // @ts-ignore
                ...sheet[sheetKey],
                [subKey]: checked,
              },
            }),
        }
      : {
          checked: sheet[sheetKey] || false,
          onChange: (
            e: React.ChangeEvent<HTMLInputElement>,
            checked: boolean
          ) => update({ ...sheet, [sheetKey]: checked }),
        };

    return (
      <Grid item xs={xs}>
        <FormGroup row>
          <FormControlLabel
            id={`${sheetKey}-${subKey || ""}-${id}`}
            control={<Checkbox {...fieldProps} name="checkedA" />}
            label={label}
            labelPlacement={labelAfter ? "end" : "start"}
          />
        </FormGroup>
      </Grid>
    );
  }

  return (
    <>
      <br />
      <Card>
        <CardContent className={styles.rewardCard}>
          {updateError ? (
            <div>Failed to Update: {updateError.message}</div>
          ) : null}
          <Grid container spacing={1}>
            <SheetTextField xs={6} sheetKey="scenario" label="Scenario" />
            <SheetTextField xs={2} sheetKey="tier" label="Tier" />
            <SheetTextField xs={2} sheetKey="xp" label="XP" />
            <SheetDateField xs={2} sheetKey="date" label="Date" />

            <SheetTextField xs={5} sheetKey="eventNumber" label="Event #" />
            <SheetTextField
              xs={5}
              sheetKey="coordinatorOP"
              label="Coordinator OP #"
            />
            <SheetCheckField xs={2} sheetKey="reported" label="Reported? " />

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent className={styles.rewardCard}>
                  <Grid container>
                    <SheetCheckField
                      xs={12}
                      sheetKey="reward"
                      subKey="received"
                      label="Reward: "
                    />
                    <SheetTextField
                      xs={12}
                      sheetKey="reward"
                      subKey="text"
                      multiline
                      rows={3}
                    />
                    <SheetCheckField
                      xs={6}
                      sheetKey="reward"
                      subKey="noneReplayed"
                      label=" None - Replayed Scenario"
                      labelAfter
                    />
                    <SheetCheckField
                      xs={6}
                      sheetKey="reward"
                      subKey="noneFailed"
                      label=" None - Failed Scenario"
                      labelAfter
                    />
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={2} className={styles.pointSpend}>
              <Typography>Hero Point Spend:</Typography>
            </Grid>
            <SheetCheckField
              xs={2}
              sheetKey="heroPoint"
              subKey="skill"
              label=" Skill Feat"
              labelAfter
            />
            <SheetCheckField
              xs={2}
              sheetKey="heroPoint"
              subKey="power"
              label=" Power Feat"
              labelAfter
            />
            <SheetCheckField
              xs={2}
              sheetKey="heroPoint"
              subKey="card"
              label=" Card Feat"
              labelAfter
            />
            <SheetCheckField
              xs={2}
              sheetKey="heroPoint"
              subKey="noSpend"
              label=" Did Not Spend"
              labelAfter
            />
            <SheetTextField
              xs={1}
              sheetKey="heroPoint"
              subKey="used"
              type="number"
              label="Used"
            />
            <SheetTextField
              xs={1}
              sheetKey="heroPoint"
              subKey="remaining"
              type="number"
              label="Remaining"
            />

            <SheetTextField
              xs={5}
              sheetKey="deckUpgrade"
              subKey="one"
              label="Deck Upgrade"
            />
            <SheetTextField
              xs={3}
              sheetKey="deckUpgrade"
              subKey="two"
              label="Bonus Deck Upgrade"
            />
            <SheetTextField
              xs={4}
              sheetKey="deckUpgrade"
              subKey="three"
              label="Bonus Deck Upgrade"
            />

            <SheetTextField
              xs={12}
              sheetKey="notes"
              label="Notes"
              multiline
              rows={3}
            />
          </Grid>
        </CardContent>
      </Card>
    </>
  );
}
