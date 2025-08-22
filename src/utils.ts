export const nowSec = () => Math.floor(Date.now() / 1000);
export const addMinutes = (mins: number) => nowSec() + mins * 60;
export const randomCode = (len = 6) =>
  Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");
