import { useCallback, useEffect, useState } from "react";
import deepEqual from "deep-equal";

export function useDebounceUpdate<T, U, V = T, W = any>(
  value: T,
  onChange: (val: U, val2: W) => T,
  onTimeout: (val: T) => void,
  timeout?: number,
  valueKey?: string,
  triggerValue?: V
): any {
  const [inputValue, changeInputValue] = useState(value);
  const [origValue, changeOrigValue] = useState(triggerValue || value);
  const [updating, changeUpdating] = useState(false);
  const [timeoutHolder] = useState({ timeout: null as any });

  const stack = new Error();
  useEffect(() => {
    if (!deepEqual(triggerValue || value, origValue)) {
      changeOrigValue(triggerValue || value);
      if (!updating) {
        changeInputValue(value);
      }
    }
  }, [origValue, stack, triggerValue, updating, value]);

  return {
    [valueKey || "value"]: inputValue,
    onChange: useCallback(
      (val: U, val2: W) => {
        const newVal = onChange(val, val2);
        changeInputValue(newVal);
        changeUpdating(true);
        clearTimeout(timeoutHolder.timeout);
        timeoutHolder.timeout = setTimeout(() => {
          Promise.resolve(onTimeout(newVal)).then(() => changeUpdating(false));
        }, timeout ?? 200);
      },
      [onChange, onTimeout, timeout, timeoutHolder]
    ),
  };
}
