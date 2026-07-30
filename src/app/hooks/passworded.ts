import { useState } from "react";

const [passworded, setPassworded] = useState(true);

export function setHasPassword(value: boolean) {
  setPassworded(value);
}

export function hasPassword() {
  return passworded;
}
