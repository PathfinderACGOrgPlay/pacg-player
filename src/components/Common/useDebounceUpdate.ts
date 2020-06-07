import { useEffect, useState } from "react";

export function useDebounceUpdate<T, U>(
  value: T,
  onChange: (val: U) => T,
  onTimeout: (val: T) => void,
  timeout?: number
): {
  value: T;
  onChange: (val: U) => any;
} {
  const [inputValue, changeInputValue] = useState(value);
  const [origValue, changeOrigValue] = useState(value);
  const [updating, changeUpdating] = useState(false);
  const [timeoutHolder] = useState({ timeout: null as any });

  useEffect(() => {
    if (value !== origValue) {
      changeOrigValue(value);
      if (!updating) {
        changeInputValue(value);
      }
    }
  }, [origValue, updating, value]);

  return {
    value: inputValue,
    onChange: (val) => {
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
