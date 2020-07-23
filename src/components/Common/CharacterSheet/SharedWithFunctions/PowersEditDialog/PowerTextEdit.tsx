import React, { ChangeEvent, useRef, useState } from "react";
import { DragPreviewImage, useDrag, useDrop } from "react-dnd";
import {
  ButtonGroup,
  IconButton,
  Input,
  InputAdornment,
} from "@material-ui/core";
import type { PowerText } from "../../../../../firestore/wiki/character";
import { usePowerStyles } from "../usePowerStyles";
import { CheckOrLabel } from "../../CheckOrLabel";
import { makeStyles } from "@material-ui/core/styles";
import { useDebounceUpdate } from "../../../useDebounceUpdate";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import DeleteIcon from "@material-ui/icons/Delete";

interface Item {
  type: string;
  id: string;
  originalIndex: string;
}

const useStyles = makeStyles((theme) => ({
  noHover: {
    cursor: "pointer",
  },
  hover: {
    cursor: "pointer",
    backgroundColor: "rgba(0,255,0,0.25)",
  },
  hoverFromBase: {
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  dragging: {
    opacity: 0.4,
  },
}));

const transparentPixel =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=";

function InnerComponent({
  editId,
  setEditId,
  powerId,
  text,
  index,
  hover,
  setHover,
  onChange,
  reorder,
  onDelete,
}: {
  editId: string;
  setEditId(id: string): void;
  powerId: string;
  text: PowerText;
  index: number;
  hover: string | null;
  setHover(id: string | null): void;
  onChange(text: PowerText): void;
  reorder(from: string, to: string): void;
  onDelete(id: string | null): void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const [, drop] = useDrop({
    accept: powerId,
    canDrop: () => false,
    hover({ id: draggedId }: Item) {
      if (draggedId !== text.id && draggedId !== data.lastMoveId) {
        data.lastMoveId = draggedId;
        reorder(draggedId, text.id);
        setTimeout(() => {
          data.lastMoveId = "";
        }, 2000);
      }
    },
  });
  const [data] = useState({ lastMoveId: "", resetTimeout: "" as any });
  const styles = useStyles();
  const [{ isDragging }, drag, preview] = useDrag({
    item: { type: powerId, id: text.id, originalIndex: index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const inputProps = useDebounceUpdate(
    text.text,
    (e: ChangeEvent<HTMLInputElement>) => {
      return e.currentTarget.value.replace(/[\r\n]/g, "");
    },
    (textValue) =>
      onChange({
        ...text,
        text: textValue,
      })
  );

  const hoverClass = [
    hover === text.id
      ? text.fromBase
        ? styles.hoverFromBase
        : styles.hover
      : text.fromBase
      ? ""
      : styles.noHover,
    isDragging ? styles.dragging : "",
  ]
    .filter((v) => v)
    .join(" ");

  if (editId === text.id) {
    return (
      <div key={text.id}>
        <Input
          inputRef={ref}
          autoFocus
          multiline
          fullWidth
          {...inputProps}
          onBlur={() =>
            (data.resetTimeout = setTimeout(() => setEditId(""), 100))
          }
          endAdornment={
            <InputAdornment position="end">
              <ButtonGroup size="small">
                <IconButton
                  title="Checkbox"
                  size="small"
                  onClick={() => {
                    clearTimeout(data.resetTimeout);
                    ref.current?.focus();
                    onChange({
                      ...text,
                      optional: !text.optional,
                    });
                  }}
                >
                  <CheckBoxIcon fontSize="small" />
                </IconButton>
                <IconButton
                  title="Remove"
                  size="small"
                  onClick={() => {
                    onDelete(text.id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ButtonGroup>
            </InputAdornment>
          }
        />
      </div>
    );
  } else {
    return (
      <span
        className={hoverClass}
        onMouseEnter={() => setHover(text.id)}
        onMouseLeave={() => {
          if (hover === text.id) {
            setHover(null);
          }
        }}
        onDoubleClick={() => {
          if (!text.fromBase) {
            setEditId(text.id);
          }
        }}
        ref={(node: HTMLElement) => {
          text.fromBase ? drop(node) : drag(drop(node));
        }}
      >
        <DragPreviewImage connect={preview} src={transparentPixel} />
        {text.text}
      </span>
    );
  }
}

export function PowerTextEdit({
  powerId,
  text,
  nextText,
  index,
  hover,
  setHover,
  onChange,
  onDelete,
  reorder,
}: {
  powerId: string;
  text: PowerText;
  nextText: PowerText | undefined;
  index: number;
  hover: string | null;
  setHover(id: string | null): void;
  onChange(text: PowerText): void;
  reorder(from: string, to: string): void;
  onDelete(id: string): void;
}) {
  const powerStyles = usePowerStyles();
  const [editId, setEditId] = useState("");

  return (
    <CheckOrLabel
      className={[
        powerStyles.powerText,
        ...(text.optional
          ? [
              powerStyles.powerOptional,
              nextText?.text[0]?.match(/[A-Za-z]/)
                ? powerStyles.nextNotOptional
                : null,
            ]
          : [null]),
      ]
        .filter((v) => v)
        .join(" ")}
      optional={text.optional}
      text={
        <>
          {text.optional && index !== 0 ? (
            <div className={powerStyles.leftParen}>(</div>
          ) : null}
          <InnerComponent
            editId={editId}
            setEditId={setEditId}
            onChange={onChange}
            onDelete={onDelete}
            reorder={reorder}
            setHover={setHover}
            text={text}
            hover={hover}
            index={index}
            powerId={powerId}
          />
          {text.optional && index !== 0 ? ")" : null}
        </>
      }
      name={`power-${text.id}`}
      allowCharacterEdit={false}
    />
  );
}
