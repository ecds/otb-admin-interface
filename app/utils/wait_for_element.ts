export const waitForElement = (
  selector: string,
  callback: (element: Element) => void,
) => {
  const interval = setInterval(() => {
    const element = document.getElementById(selector);
    if (element) {
      clearInterval(interval);
      callback(element);
    }
  }, 100);
};
