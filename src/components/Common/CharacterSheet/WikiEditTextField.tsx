import { TextFieldProps } from "@material-ui/core/TextField/TextField";
import { TextField, Typography } from "@material-ui/core";
import React, { ReactNode, ReactNodeArray } from "react";

export function WikiEditTextField({
  wikiEdit,
  className,
  text,
  children,
  ...rest
}: TextFieldProps & {
  text?: string;
  wikiEdit: boolean | undefined;
  children?: ReactNode | ReactNodeArray;
}) {
  return wikiEdit ? (
    children ? (
      <div className={`FieldWrapper ${className || ""}`}>
        <TextField {...rest} />
        {children}
      </div>
    ) : (
      <TextField className={className} {...rest} />
    )
  ) : (
    <Typography className={className}>
      {text || (rest.value as string)}
      {children}
    </Typography>
  );
}
