import { CircularProgress } from "@material-ui/core";
import React from "react";

export function selectLoadingComponent(loading: boolean) {
  return loading
    ? (props: any) => <CircularProgress {...props} size="1.25em" />
    : undefined;
}
