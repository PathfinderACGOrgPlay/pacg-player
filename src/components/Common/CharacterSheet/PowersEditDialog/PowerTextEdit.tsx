import React, { ChangeEvent, useState } from "react";
import { DragPreviewImage, useDrag, useDrop } from "react-dnd";
import { Input } from "@material-ui/core";
import { PowerText } from "../../../../firestore/wiki/character";
import { usePowerStyles } from "../usePowerStyles";
import { CheckOrLabel } from "../CheckOrLabel";
import { makeStyles } from "@material-ui/core/styles";
import { useDebounceUpdate } from "../../useDebounceUpdate";

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
  powerId,
  text,
  index,
  hover,
  setHover,
  onChange,
  reorder,
}: {
  powerId: string;
  text: PowerText;
  index: number;
  hover: string | null;
  setHover(id: string | null): void;
  onChange(text: PowerText): void;
  reorder(from: string, to: string): void;
}) {
  const [editMode, setEditMode] = useState(false);

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
  const [data] = useState({ lastMoveId: "" });
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

  if (editMode) {
    return (
      <div key={text.id}>
        <Input
          autoFocus
          multiline
          fullWidth
          {...inputProps}
          onBlur={() => setEditMode(false)}
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
            setEditMode(true);
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
}) {
  const powerStyles = usePowerStyles();

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
        text.optional && index !== 0 ? (
          <>
            <div className={powerStyles.leftParen}>(</div>
            <InnerComponent
              onChange={onChange}
              reorder={reorder}
              setHover={setHover}
              text={text}
              hover={hover}
              index={index}
              powerId={powerId}
            />
            )
          </>
        ) : (
          <InnerComponent
            onChange={onChange}
            reorder={reorder}
            setHover={setHover}
            text={text}
            hover={hover}
            index={index}
            powerId={powerId}
          />
        )
      }
      name={`power-${text.id}`}
      allowCharacterEdit={false}
    />
  );
}
