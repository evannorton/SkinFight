import type { SkinViewer } from "skinview3d";

const CHARACTER_SKIN_SNAPSHOT_SIZE_PX = 256;
const CHARACTER_SKIN_SNAPSHOT_ZOOM = 0.8;
const CHARACTER_SKIN_SNAPSHOT_Y_ROTATION_RADIANS = Math.PI / 5;
const SHARED_SKIN_VIEWER_IDLE_DISPOSE_DELAY_MS = 2000;
const CHARACTER_SKIN_SNAPSHOT_BACKGROUND_COLOR = 0x1c1c1f;

type CharacterSkinSnapshotCacheEntry =
  | {
      status: "ready";
      objectUrl: string;
    }
  | {
      status: "failed";
    };

type CharacterSkinSnapshotWaiter = {
  resolve: (snapshotObjectUrl: string) => void;
  reject: (error: Error) => void;
};

const characterSkinSnapshotCacheByFileUrl = new Map<
  string,
  CharacterSkinSnapshotCacheEntry
>();
const characterSkinSnapshotWaitersByFileUrl = new Map<
  string,
  CharacterSkinSnapshotWaiter[]
>();
const characterSkinSnapshotRequestQueue: string[] = [];

let isProcessingCharacterSkinSnapshotQueue = false;
let sharedSkinViewer: SkinViewer | null = null;
let sharedSkinViewerCanvasElement: HTMLCanvasElement | null = null;
let sharedSkinViewerCreatePromise: Promise<SkinViewer> | null = null;
let sharedSkinViewerIdleDisposeTimeoutId: number | null = null;

function captureCanvasPngBlob(canvasElement: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvasElement.toBlob((pngBlob) => {
        if (pngBlob === null) {
          reject(new Error("Failed to capture character skin snapshot PNG."));
          return;
        }
        resolve(pngBlob);
      }, "image/png");
    } catch (error) {
      if (error instanceof Error) {
        reject(error);
        return;
      }
      reject(new Error("Failed to capture character skin snapshot PNG."));
    }
  });
}

function cancelSharedSkinViewerIdleDispose(): void {
  if (sharedSkinViewerIdleDisposeTimeoutId !== null) {
    window.clearTimeout(sharedSkinViewerIdleDisposeTimeoutId);
    sharedSkinViewerIdleDisposeTimeoutId = null;
  }
}

function disposeSharedSkinViewer(): void {
  if (sharedSkinViewer !== null) {
    sharedSkinViewer.dispose();
    sharedSkinViewer = null;
  }
  if (sharedSkinViewerCanvasElement !== null) {
    sharedSkinViewerCanvasElement.remove();
    sharedSkinViewerCanvasElement = null;
  }
}

function scheduleSharedSkinViewerIdleDispose(): void {
  cancelSharedSkinViewerIdleDispose();
  sharedSkinViewerIdleDisposeTimeoutId = window.setTimeout(() => {
    sharedSkinViewerIdleDisposeTimeoutId = null;
    if (
      isProcessingCharacterSkinSnapshotQueue === false &&
      characterSkinSnapshotRequestQueue.length === 0
    ) {
      disposeSharedSkinViewer();
    }
  }, SHARED_SKIN_VIEWER_IDLE_DISPOSE_DELAY_MS);
}

function waitForNextAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      resolve();
    });
  });
}

async function createSharedSkinViewer(): Promise<SkinViewer> {
  const skinview3dModule = await import("skinview3d");
  const snapshotCanvasElement = document.createElement("canvas");
  snapshotCanvasElement.setAttribute("aria-hidden", "true");
  snapshotCanvasElement.style.position = "fixed";
  snapshotCanvasElement.style.left = "-9999px";
  snapshotCanvasElement.style.top = "0";
  snapshotCanvasElement.style.pointerEvents = "none";
  snapshotCanvasElement.style.width = `${CHARACTER_SKIN_SNAPSHOT_SIZE_PX}px`;
  snapshotCanvasElement.style.height = `${CHARACTER_SKIN_SNAPSHOT_SIZE_PX}px`;
  document.body.appendChild(snapshotCanvasElement);
  sharedSkinViewerCanvasElement = snapshotCanvasElement;

  try {
    const skinViewer = new skinview3dModule.SkinViewer({
      canvas: snapshotCanvasElement,
      width: CHARACTER_SKIN_SNAPSHOT_SIZE_PX,
      height: CHARACTER_SKIN_SNAPSHOT_SIZE_PX,
      pixelRatio: 1,
      renderPaused: true,
      enableControls: false,
      preserveDrawingBuffer: true,
      zoom: CHARACTER_SKIN_SNAPSHOT_ZOOM,
      background: CHARACTER_SKIN_SNAPSHOT_BACKGROUND_COLOR,
    });
    skinViewer.autoRotate = false;
    skinViewer.playerWrapper.rotation.y =
      CHARACTER_SKIN_SNAPSHOT_Y_ROTATION_RADIANS;
    return skinViewer;
  } catch (error) {
    snapshotCanvasElement.remove();
    sharedSkinViewerCanvasElement = null;
    throw error;
  }
}

async function getOrCreateSharedSkinViewer(): Promise<SkinViewer> {
  if (sharedSkinViewer !== null) {
    return sharedSkinViewer;
  }
  if (sharedSkinViewerCreatePromise !== null) {
    return sharedSkinViewerCreatePromise;
  }

  sharedSkinViewerCreatePromise = createSharedSkinViewer();
  try {
    const createdSkinViewer = await sharedSkinViewerCreatePromise;
    sharedSkinViewer = createdSkinViewer;
    return createdSkinViewer;
  } finally {
    sharedSkinViewerCreatePromise = null;
  }
}

function rejectCharacterSkinSnapshotWaiters(
  snapshotWaiters: CharacterSkinSnapshotWaiter[],
  error: unknown,
): void {
  const rejectionError =
    error instanceof Error
      ? error
      : new Error("Failed to render character skin snapshot.");
  for (const snapshotWaiter of snapshotWaiters) {
    snapshotWaiter.reject(rejectionError);
  }
}

async function renderAndCacheCharacterSkinSnapshot(
  skinFileUrl: string,
): Promise<void> {
  const snapshotWaiters =
    characterSkinSnapshotWaitersByFileUrl.get(skinFileUrl);
  if (typeof snapshotWaiters === "undefined") {
    throw new Error(
      `Missing snapshot waiters for skin file URL: ${skinFileUrl}`,
    );
  }
  characterSkinSnapshotWaitersByFileUrl.delete(skinFileUrl);

  try {
    const skinViewer = await getOrCreateSharedSkinViewer();
    skinViewer.playerObject.resetJoints();
    skinViewer.playerWrapper.rotation.set(
      0,
      CHARACTER_SKIN_SNAPSHOT_Y_ROTATION_RADIANS,
      0,
    );
    await skinViewer.loadSkin(skinFileUrl);
    skinViewer.render();
    await waitForNextAnimationFrame();
    const pngBlob = await captureCanvasPngBlob(skinViewer.canvas);
    const snapshotObjectUrl = URL.createObjectURL(pngBlob);
    characterSkinSnapshotCacheByFileUrl.set(skinFileUrl, {
      status: "ready",
      objectUrl: snapshotObjectUrl,
    });
    for (const snapshotWaiter of snapshotWaiters) {
      snapshotWaiter.resolve(snapshotObjectUrl);
    }
  } catch (error) {
    characterSkinSnapshotCacheByFileUrl.set(skinFileUrl, {
      status: "failed",
    });
    rejectCharacterSkinSnapshotWaiters(snapshotWaiters, error);
  }
}

async function processCharacterSkinSnapshotQueue(): Promise<void> {
  if (isProcessingCharacterSkinSnapshotQueue === true) {
    return;
  }

  isProcessingCharacterSkinSnapshotQueue = true;
  cancelSharedSkinViewerIdleDispose();

  try {
    while (characterSkinSnapshotRequestQueue.length > 0) {
      const skinFileUrl = characterSkinSnapshotRequestQueue.shift();
      if (typeof skinFileUrl === "undefined") {
        throw new Error(
          "Character skin snapshot queue shifted an undefined URL.",
        );
      }
      await renderAndCacheCharacterSkinSnapshot(skinFileUrl);
    }
  } finally {
    isProcessingCharacterSkinSnapshotQueue = false;
    if (characterSkinSnapshotRequestQueue.length > 0) {
      void processCharacterSkinSnapshotQueue();
    } else {
      scheduleSharedSkinViewerIdleDispose();
    }
  }
}

export function requestCharacterSkinSnapshot(
  skinFileUrl: string,
): Promise<string> {
  const cachedSnapshot = characterSkinSnapshotCacheByFileUrl.get(skinFileUrl);
  if (typeof cachedSnapshot !== "undefined") {
    if (cachedSnapshot.status === "ready") {
      return Promise.resolve(cachedSnapshot.objectUrl);
    }
    return Promise.reject(
      new Error("Character skin snapshot previously failed to render."),
    );
  }

  return new Promise((resolve, reject) => {
    const existingWaiters =
      characterSkinSnapshotWaitersByFileUrl.get(skinFileUrl);
    if (typeof existingWaiters !== "undefined") {
      existingWaiters.push({ resolve, reject });
      return;
    }

    characterSkinSnapshotWaitersByFileUrl.set(skinFileUrl, [
      { resolve, reject },
    ]);
    characterSkinSnapshotRequestQueue.push(skinFileUrl);
    void processCharacterSkinSnapshotQueue();
  });
}
