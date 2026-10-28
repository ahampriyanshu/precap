export type DiagramWork = {
  version: 1;
  scene: string;
  notes: string;
  reviewed: boolean;
  updatedAt: number;
};
export type DiagramProgress = {
  id: string;
  reviewed: boolean;
  started: boolean;
};

let database: Promise<IDBDatabase> | null = null;
function openDatabase(): Promise<IDBDatabase> {
  if (!database) {
    database = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("precap-diagrams", 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("drawings");
        request.result.createObjectStore("progress", { keyPath: "id" });
      };
      request.onsuccess = () => {
        request.result.onversionchange = () => {
          request.result.close();
          database = null;
        };
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
      request.onblocked = () =>
        reject(new Error("Diagram storage is blocked by another tab."));
    }).catch((error) => {
      database = null;
      throw error;
    });
  }
  return database;
}

export function parseDiagram(value: unknown): DiagramWork {
  if (!value || typeof value !== "object")
    throw new Error("Invalid diagram draft.");
  const work = value as DiagramWork;
  if (
    work.version !== 1 ||
    typeof work.scene !== "string" ||
    typeof work.notes !== "string" ||
    typeof work.reviewed !== "boolean" ||
    !Number.isFinite(work.updatedAt)
  )
    throw new Error("Invalid diagram draft.");
  const scene = JSON.parse(work.scene);
  if (
    scene.type !== "excalidraw" ||
    !Array.isArray(scene.elements) ||
    !scene.elements.every(
      (element: unknown) =>
        !!element &&
        typeof element === "object" &&
        typeof (element as { id?: unknown }).id === "string" &&
        typeof (element as { type?: unknown }).type === "string",
    ) ||
    !scene.appState ||
    typeof scene.appState !== "object" ||
    !scene.files ||
    typeof scene.files !== "object"
  )
    throw new Error("Invalid Excalidraw scene.");
  return work;
}

export async function loadDiagram(id: string): Promise<DiagramWork | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db
      .transaction("drawings", "readonly")
      .objectStore("drawings")
      .get(id);
    request.onsuccess = () => {
      try {
        resolve(
          request.result === undefined ? null : parseDiagram(request.result),
        );
      } catch (error) {
        reject(error);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveDiagram(
  id: string,
  work: DiagramWork,
): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["drawings", "progress"], "readwrite");
    transaction.objectStore("drawings").put(work, id);
    transaction.objectStore("progress").put({
      id,
      reviewed: work.reviewed,
      started: true,
    } satisfies DiagramProgress);
    transaction.oncomplete = () => {
      window.dispatchEvent(new Event("lessons:progress"));
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("Diagram save was aborted."));
  });
}

export async function loadDiagramProgress(): Promise<DiagramProgress[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db
      .transaction("progress", "readonly")
      .objectStore("progress")
      .getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function blankDiagram(): DiagramWork {
  return {
    version: 1,
    scene: JSON.stringify({
      type: "excalidraw",
      version: 2,
      source: "precap",
      elements: [],
      appState: { viewBackgroundColor: "#ffffff" },
      files: {},
    }),
    notes: "",
    reviewed: false,
    updatedAt: 0,
  };
}
