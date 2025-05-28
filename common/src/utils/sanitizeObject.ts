import { clone } from "lodash";

export const sanitizeObject = <T>(value: T) => {
  const newObject = clone(value);

  for (const key in newObject) {
    const typedKey = key as keyof T;
    if (newObject[key] === undefined) {
      delete newObject[key];
    }
  }

  return newObject;
};
