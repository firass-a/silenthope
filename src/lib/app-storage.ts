import { createJSONStorage, type StateStorage } from "zustand/middleware";

const PREFIX = "silent-hope-";

const memoryStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

/** One-time copy of tab-scoped session keys into durable localStorage. */
function migrateFromSessionStorage(key: string) {
  try {
    if (localStorage.getItem(key) != null) return;
    const legacy = sessionStorage.getItem(key);
    if (legacy == null) return;
    localStorage.setItem(key, legacy);
    sessionStorage.removeItem(key);
  } catch {
    // Ignore quota / privacy mode failures
  }
}

function createBrowserLocalStorage(): StateStorage {
  return {
    getItem: (name) => {
      migrateFromSessionStorage(name);
      return localStorage.getItem(name);
    },
    setItem: (name, value) => {
      localStorage.setItem(name, value);
      try {
        sessionStorage.removeItem(name);
      } catch {
        // ignore
      }
    },
    removeItem: (name) => {
      localStorage.removeItem(name);
      try {
        sessionStorage.removeItem(name);
      } catch {
        // ignore
      }
    },
  };
}

/** Durable browser storage for all Zustand stores (survives tab/browser close). */
export function createAppStorage() {
  if (typeof window === "undefined") {
    return createJSONStorage(() => memoryStorage);
  }
  return createJSONStorage(() => createBrowserLocalStorage());
}

/** @deprecated Use createAppStorage — kept so older imports keep working. */
export const createSessionStorage = createAppStorage;

export function clearAllAppStorage() {
  if (typeof window === "undefined") return;

  const sweep = (storage: Storage) => {
    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(PREFIX)) keys.push(key);
    }
    keys.forEach((k) => storage.removeItem(k));
  };

  try {
    sweep(localStorage);
  } catch {
    // ignore
  }
  try {
    sweep(sessionStorage);
  } catch {
    // ignore
  }
}
