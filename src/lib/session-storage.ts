import { createJSONStorage, type StateStorage } from "zustand/middleware";

const memoryStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export function createSessionStorage() {
  if (typeof window === "undefined") {
    return createJSONStorage(() => memoryStorage);
  }
  return createJSONStorage(() => sessionStorage);
}

export function clearAllAppStorage() {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith("silent-hope-")) keys.push(key);
  }
  keys.forEach((k) => sessionStorage.removeItem(k));
}
