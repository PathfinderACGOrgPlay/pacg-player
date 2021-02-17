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
import { useDebounceUpdate } from "./useDebounceUpdate";
import firebase from "firebase/app";

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
    maxWidth: "15.5%",
    flexBasis: "15.5%",
  },
  skillFeat: {
    maxWidth: "13%",
    flexBasis: "13%",
  },
  powerFeat: {
    maxWidth: "15%",
    flexBasis: "15%",
  },
  cardFeat: {
    maxWidth: "14%",
    flexBasis: "14%",
  },
  noSpend: {
    maxWidth: "17.5%",
    flexBasis: "17.5%",
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
    className,
  }: {
    xs: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    sheetKey: TKey;
    subKey?: keyof Exclude<ChronicleSheet[TKey], undefined>;
    label?: string;
    multiline?: boolean;
    rows?: number;
    type?: string;
    className?: string;
  }) {
    return (
      <Grid item xs={xs} className={className}>
        <TextField
          id={`${sheetKey}-${subKey || ""}-${id}`}
          className={styles.fill}
          label={label}
          multiline={multiline}
          rows={rows}
          type={type}
          {...useDebounceUpdate(
            subKey
              ? // @ts-ignore
                (sheet[sheetKey] || {})[subKey] || ""
              : sheet[sheetKey] || "",
            (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
            (value) =>
              subKey
                ? update({
                    ...sheet,
                    [sheetKey]: {
                      // @ts-ignore
                      ...sheet[sheetKey],
                      [subKey]: value,
                    },
                  })
                : update({ ...sheet, [sheetKey]: value })
          )}
        />
      </Grid>
    );
  }

  function SheetDateField<TKey extends keyof ChronicleSheet>({
    xs,
    sheetKey,
    subKey,
    label,
    className,
  }: {
    xs: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    sheetKey: TKey;
    subKey?: keyof Exclude<ChronicleSheet[TKey], undefined>;
    label?: string;
    className?: string;
  }) {
    const fieldProps = subKey
      ? {
          value:
            // @ts-ignore
            ((sheet[sheetKey] || {})[subKey] as firebase.firestore.Timestamp) ||
            null,
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
          value: (sheet[sheetKey] as firebase.firestore.Timestamp) || null,
          onChange: (date: DateTime | null) => {
            return update({ ...sheet, [sheetKey]: date?.toJSDate() || null });
          },
        };

    return (
      <Grid item xs={xs} className={className}>
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
    className,
  }: {
    xs: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    sheetKey: TKey;
    subKey?: keyof Exclude<ChronicleSheet[TKey], undefined>;
    label: string;
    labelAfter?: boolean;
    className?: string;
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
      <Grid item xs={xs} className={className}>
        <FormGroup className="checkbox" row>
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
      <br className="chroniclePrintHide" />
      <Card className="printBorders">
        <CardContent className={styles.rewardCard}>
          {updateError ? (
            <div>Failed to Update: {updateError.message}</div>
          ) : null}
          <Grid container spacing={1}>
            <SheetTextField
              xs={7}
              sheetKey="scenario"
              label="Scenario"
              className="firstRow"
            />
            <SheetTextField
              xs={1}
              sheetKey="tier"
              label="Tier"
              className="firstRow"
            />
            <SheetTextField
              xs={1}
              sheetKey="xp"
              label="XP"
              className="firstRow"
            />
            <SheetDateField
              xs={3}
              sheetKey="date"
              label="Date"
              className="firstRow"
            />

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
                      className="noBorder"
                    />
                    <SheetTextField
                      xs={12}
                      sheetKey="reward"
                      subKey="text"
                      multiline
                      rows={3}
                      className="noBorder"
                    />
                    <SheetCheckField
                      xs={6}
                      sheetKey="reward"
                      subKey="noneReplayed"
                      label=" None - Replayed Scenario"
                      labelAfter
                      className="noBorder"
                    />
                    <SheetCheckField
                      xs={6}
                      sheetKey="reward"
                      subKey="noneFailed"
                      label=" None - Failed Scenario"
                      labelAfter
                      className="noBorder"
                    />
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={2} className={styles.pointSpend}>
              <Typography>Hero Point Spend:</Typography>
            </Grid>
            <SheetCheckField
              xs={1}
              sheetKey="heroPoint"
              subKey="skill"
              label=" Skill Feat"
              className={styles.skillFeat}
              labelAfter
            />
            <SheetCheckField
              xs={2}
              sheetKey="heroPoint"
              subKey="power"
              label=" Power Feat"
              className={styles.powerFeat}
              labelAfter
            />
            <SheetCheckField
              xs={2}
              sheetKey="heroPoint"
              subKey="card"
              label=" Card Feat"
              className={styles.cardFeat}
              labelAfter
            />
            <SheetCheckField
              xs={2}
              sheetKey="heroPoint"
              subKey="noSpend"
              label=" Did Not Spend"
              className={styles.noSpend}
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
              xs={2}
              sheetKey="heroPoint"
              subKey="remaining"
              type="number"
              label="Remaining"
            />

            <SheetTextField
              xs={4}
              sheetKey="deckUpgrade"
              subKey="one"
              label="Deck Upgrade"
            />
            <SheetTextField
              xs={4}
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
