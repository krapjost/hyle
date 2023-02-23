import type { Accessor, ParentProps } from "solid-js";
import {
  onMount,
  createEffect,
  createMemo,
  createSignal,
  createContext,
  useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import { set as idbSet, get as idbGet, del as idbDel } from "idb-keyval";
import { STORE_KEY_DIRECTORY_HANDLE } from "./constants";
import {
  askReadWritePermissionsIfNeeded,
  createFile,
  getFSFileHandle,
  writeContentToFileIfChanged,
} from "./helpers";
import { getLastWriteCacheData, setLastWriteCacheData } from "./cache";
import * as Y from "yjs";
import { getDeltaOperations } from "./yjs";

type YFS = {
  isSupported: Accessor<boolean>;
  setRootDirectory: (withWritePermission: boolean) => Promise<void>;
  unsetRootDirectory: () => Promise<void>;
  grantWritePermission: () => Promise<void>;
  isWritePermissionGranted: Accessor<boolean>;
  directoryName: Accessor<string | undefined>;
  syncDoc: (
    name: string,
    format: string,
    content: string,
    doc: Y.Doc
  ) => Promise<void>;
};

const FileSyncContext = createContext();

export function FileSyncProvider(props: ParentProps) {
  const [filesync, setFilesync] = createStore({});

  const [isSupported, setSupported] = createSignal(false);
  const [isWritePermissionGranted, setWritePermissionGranted] =
    createSignal(false);
  const [directoryHandle, setDirectoryHandle] = createSignal<
    FileSystemDirectoryHandle | undefined
  >(undefined);

  const loadHandle = async () => {
    const handle = await idbGet(STORE_KEY_DIRECTORY_HANDLE);
    if (handle) {
      setDirectoryHandle(handle);
    }
  };

  onMount(() => {
    setSupported(typeof (window as any).showDirectoryPicker === "function");
    loadHandle();
  });

  createEffect(() => {
    if (directoryHandle()) {
      idbSet(STORE_KEY_DIRECTORY_HANDLE, directoryHandle());
    }
  });

  const grantWritePermission = async () => {
    if (!isSupported() || !directoryHandle()) return;

    try {
      const granted = await askReadWritePermissionsIfNeeded(directoryHandle()!);
      setWritePermissionGranted(granted);
    } catch (error) {
      console.error(error);
    }
  };

  const setRootDirectory = async (withWritePermission: boolean) => {
    if (!isSupported()) return;

    try {
      const handle = await (window as any).showDirectoryPicker();
      if (handle) {
        setDirectoryHandle(handle);
        if (withWritePermission) {
          const granted = await askReadWritePermissionsIfNeeded(handle);
          setWritePermissionGranted(granted);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const unsetRootDirectory = async () => {
    setDirectoryHandle(undefined);
    idbDel(STORE_KEY_DIRECTORY_HANDLE);
  };

  const updateFileContent = async (
    file: globalThis.File,
    filename: string,
    fileHandle: FileSystemFileHandle,
    newContent: string
  ) => {
    // When we write to the file system, we also save a version
    // in cache in order to be able to watch for subsequent changes
    // to the file.
    await writeContentToFileIfChanged(file, fileHandle, newContent);
    await setLastWriteCacheData(filename, newContent, file.lastModified);
  };

  const syncDoc = async (
    name: string,
    format: string,
    content: string,
    doc: Y.Doc
  ) => {
    const dirHandle = directoryHandle();
    if (!dirHandle) return;
    const filename = `${name}.${format}`;
    const fileHandle = await getFSFileHandle(filename, dirHandle);
    console.log("syncing started for filename : ", filename);

    // const docContent = doc.getXmlFragment("hyle").toArray().toString();
    // if (!docContent) return;
    // console.log("hello :::::", docContent);

    if (!fileHandle) {
      // File is not present in the file system, so create it.
      const newFileHandle = await createFile(dirHandle, filename, "");
      const newFile = await newFileHandle.getFile();
      await updateFileContent(newFile, filename, newFileHandle, content);
      return;
    }

    const file = await fileHandle.getFile();

    // File exists, so compare it with the last-write-cache.
    const lastWriteCacheData = await getLastWriteCacheData(filename);

    if (!lastWriteCacheData) {
      // Cached version does not exist. This should never happen. Indeed,
      // even if the user clears the app data, the directory handle will
      // be cleared as well, so the user will be asked to select a directory
      // again, in which case a hard overwrite will happen, and the
      // last-write-cache will be populated. So in case `lastWriteCacheData`
      // does not exist, we can consider this situation as similar to the
      // initial file dump situation and simply overwrite the FS file.
      await updateFileContent(file, filename, fileHandle, content);
      return;
    }

    // Cached version exists. This allows us to see the changes in the
    // local file, and compute the diff which in turn gives us as
    // state update vector for our CRDT. We can then apply it
    // to the app file for a seamless merging of the two versions.

    if (file.lastModified === lastWriteCacheData.lastModified) {
      // File has not changed in the file system. Since the FS file cache
      // is only set when a project file is synced, this means that the
      // only option is that the app file has changed, in which
      // case it should be written to the FS file.
      await updateFileContent(file, filename, fileHandle, content);
      return;
    }

    // File has changed in the file system.
    const fileContent = await file.text();
    const lastWriteFileContent = lastWriteCacheData.content;
    const deltas = getDeltaOperations(lastWriteFileContent, fileContent);

    if (deltas.length === 0) {
      // Same comment as above: no difference between FS file and
      // and last-write-cache, so just write the app file to FS.
      await updateFileContent(file, filename, fileHandle, content);
      return;
    }

    // A change has happened in the file, since it differs
    // from the cached version. So we merge it with the app doc.
    doc.getText().applyDelta(deltas);

    const mergedContent = doc.getText().toString();
    await updateFileContent(file, filename, fileHandle, mergedContent);
  };

  const directoryName = createMemo(() => directoryHandle()?.name);

  return (
    <FileSyncContext.Provider value={filesync}>
      {props.children}
    </FileSyncContext.Provider>
  );
}

export function useFileSync() {
  return useContext(FileSyncContext);
}
