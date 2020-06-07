import React, { useEffect } from "react";
import { Typography } from "@material-ui/core";

export function ErrorDisplay({
  label,
  error,
}: {
  label: string;
  error: Error | undefined | null;
}) {
  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);
  return error ? (
    <Typography>
      {label}: {error.message}
    </Typography>
  ) : null;
}
