import { useEffect, useState } from "react";
import deepEqual from "deep-equals";

export function useDebounceUpdate<T, U, V = T>(
  value: T,
  onChange: (val: U) => T,
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
    onChange: (val: U) => {
      const newVal = onChange(val);
      changeInputValue(newVal);
      changeUpdating(true);
      clearTimeout(timeoutHolder.timeout);
      timeoutHolder.timeout = setTimeout(() => {
        Promise.resolve(onTimeout(newVal)).then(() => changeUpdating(false));
      }, timeout ?? 200);
    },
  };
}
