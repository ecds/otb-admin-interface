export const debounce = <T extends unknown[]>(
  callback: (...args: T) => void,
  wait: number,
): ((...args: T) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: T) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback(...args);
    }, wait);
  };
};
