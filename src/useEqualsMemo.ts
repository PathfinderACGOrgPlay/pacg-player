import { DependencyList, useEffect, useMemo, useState } from "react";
import deepEquals from "deep-equal";

export function useEqualsMemo<T>(
  factory: () => T,
  deps: DependencyList | undefined
): T {
  const data = useMemo(factory, deps);
  const [value, setValue] = useState(data);

  useEffect(() => {
    if (!deepEquals(data, value)) {
      setValue(data);
    }
  }, [data, deps, value]);

  return value;
}
