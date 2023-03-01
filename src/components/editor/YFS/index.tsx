import { Accessor, ParentProps } from "solid-js"
import { createSignal, createContext, useContext } from "solid-js"
import { createStore } from "solid-js/store"
import { set as idbSet, get as idbGet, del as idbDel } from "idb-keyval"
import { STORE_KEY_DIRECTORY_HANDLE } from "./constants"
import { createFile, writeContentToFileIfChanged } from "./helpers"
import { getLastWriteCacheData, setLastWriteCacheData } from "./cache"
import { getDeltaOperations } from "./yjs"

import type { FileWithDirectoryAndFileHandle } from "browser-fs-access"
import { directoryOpen, supported } from "browser-fs-access"
import { Node } from "prosemirror-model"
import { defaultMarkdownSerializer } from "prosemirror-markdown"

type FileSync = {
  setRoot: () => Promise<void>
  fsHandles: Accessor<
    | Array<FileWithDirectoryAndFileHandle>
    | Array<FileSystemDirectoryHandle>
    | undefined
  >
  addFile: undefined
  sync: (
    doc: Node,
    handle: FileWithDirectoryAndFileHandle | FileSystemDirectoryHandle
  ) => void
  deleteFile: undefined
  deleteDirectory: undefined
}

const unsetRootDirectory = async () => {
  // setDirectoryHandle(undefined);
  idbDel(STORE_KEY_DIRECTORY_HANDLE)
}

const FileSyncContext = createContext<FileSync>()

async function getRootDirectory() {
  try {
    return await directoryOpen()
  } catch (error) {
    console.error("getRootDirectory throw error", error)
  }
}

async function getFileHandle(
  name: string,
  currentDirectoryHandle: FileSystemDirectoryHandle
) {
  try {
    return await currentDirectoryHandle.getFileHandle(name)
  } catch (error) {
    console.error("getFileHandle throw error", error)
  }
}

export function FileSyncProvider(props: ParentProps) {
  const [fsHandles, setFsHandles] = createSignal<
    FileWithDirectoryAndFileHandle[] | FileSystemDirectoryHandle[] | undefined
  >()

  const setRoot = async () => {
    if (!supported) return
    try {
      const handles = await directoryOpen({
        recursive: true,
        mode: "readwrite",
      })
      if (handles) {
        setFsHandles(handles)
      }
    } catch (error) {
      console.error("set root error", error)
    }
  }

  const updateFileContent = async (
    file: globalThis.File,
    filename: string,
    fileHandle: FileSystemFileHandle,
    newContent: string
  ) => {
    await writeContentToFileIfChanged(file, fileHandle, newContent)
    await setLastWriteCacheData(filename, newContent, file.lastModified)
  }

  const sync = async (
    doc: Node,
    handle: FileWithDirectoryAndFileHandle | FileSystemDirectoryHandle
  ) => {
    const content = defaultMarkdownSerializer.serialize(doc)

    if (handle instanceof File && handle.handle) {
      const fileHandle = handle.handle
      const file = await fileHandle.getFile()
      const filename = file.name
      const lastWriteCacheData = await getLastWriteCacheData(filename)
      console.log("file is : ", file)

      if (!lastWriteCacheData) {
        await updateFileContent(file, filename, fileHandle, content)
        return
      }
      if (file.lastModified === lastWriteCacheData.lastModified) {
        await updateFileContent(file, filename, fileHandle, content)
        return
      }

      // File has changed in the file system.
      const fileContent = await file.text()
      const lastWriteFileContent = lastWriteCacheData.content
      const deltas = getDeltaOperations(lastWriteFileContent, fileContent)
      if (deltas.length === 0) {
        await updateFileContent(file, filename, fileHandle, content)
        return
      }
      await updateFileContent(file, filename, fileHandle, content)
    } else if (
      handle instanceof FileSystemDirectoryHandle &&
      doc.content.firstChild
    ) {
      const newFileName = doc.content.firstChild.textContent
      const newFileHandle = await createFile(handle, newFileName, "")
      const newFile = await newFileHandle.getFile()
      await updateFileContent(newFile, newFileName, newFileHandle, content)
      return
    }
  }

  const [filesync, setFilesync] = createStore({
    setRoot: setRoot,
    fsHandles: fsHandles,
    addFile: undefined,
    sync: sync,
    deleteFile: undefined,
    deleteDirectory: undefined,
  })

  return (
    <FileSyncContext.Provider value={filesync}>
      {props.children}
    </FileSyncContext.Provider>
  )
}

export function useFileSync() {
  return useContext(FileSyncContext)
}
