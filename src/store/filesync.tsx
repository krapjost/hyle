import type { Accessor, ParentProps, Setter } from "solid-js"
import { createSignal, createContext, useContext } from "solid-js"
import { createStore } from "solid-js/store"

import type { FileWithDirectoryAndFileHandle } from "browser-fs-access"
import { directoryOpen, supported } from "browser-fs-access"
import * as Diff from "diff"

import { EditorView } from "prosemirror-view"
import { Transform } from "prosemirror-transform"
import { Fragment, Node, Schema } from "prosemirror-model"

import { parser } from "hyle/pm/markdown/parser"
import { serializer } from "hyle/pm/markdown/serializer"

type FileSync = {
  setRoot: () => Promise<void>
  setView: Setter<EditorView>
  handles: Accessor<
    | Array<FileWithDirectoryAndFileHandle>
    | Array<FileSystemDirectoryHandle>
    | undefined
  >
  startSync: (
    fileHandle?: FileSystemFileHandle | undefined,
    delay?: number | undefined
  ) => void
}

const FileSyncContext = createContext<FileSync>()

export function FileSyncProvider(props: ParentProps) {
  const [fsHandles, setFsHandles] = createSignal<
    FileWithDirectoryAndFileHandle[] | FileSystemDirectoryHandle[] | undefined
  >()
  const [view, setView] = createSignal<EditorView>()
  const [prevContent, setPrevContent] = createSignal<string>()
  const [timerId, setTimerId] = createSignal<NodeJS.Timeout>()

  const setRoot = async () => {
    if (!supported) return
    try {
      const handles = await directoryOpen({
        recursive: true,
        mode: "readwrite",
      })
      if (handles) {
        console.log(handles)
        setFsHandles(handles)
      }
    } catch (error) {
      console.error("set root error", error)
    }
  }

  const updateFileContent = async (
    fileHandle: FileSystemFileHandle,
    newContent: string
  ) => {
    const writable = await (fileHandle as any).createWritable()
    await writable.write(newContent)
    await writable.close()
  }

  function startSync(
    fileHandle?: FileSystemFileHandle | undefined,
    delay?: number | undefined
  ) {
    delay ??= 1000
    if (timerId()) clearInterval(timerId())
    setTimerId(setInterval(() => sync(fileHandle), delay))
    console.log("::: Starting autoSync, id is :", timerId())
  }

  const sync = async (handle?: FileSystemFileHandle | undefined) => {
    const v = view()
    if (!supported || !handle || !v) return

    const previousPmContent = prevContent()
    let pmDoc
    if (v.state.doc.firstChild?.textContent === handle.name) {
      pmDoc = v.state.tr.delete(0, v.state.doc.firstChild.nodeSize).doc
    } else {
      pmDoc = v.state.doc
    }
    const pmContent = serializer.serialize(pmDoc)

    if (!previousPmContent) {
      await updateFileContent(handle, pmContent)
      return setPrevContent(pmContent)
    }

    const changedFromBrowser =
      Diff.diffChars(previousPmContent, pmContent).length > 1
    if (changedFromBrowser) {
      await updateFileContent(handle, pmContent)
      return setPrevContent(pmContent)
    }

    const file = await handle.getFile()
    const fsContent = await file.text()

    if (fsContent === pmContent) {
      return setPrevContent(pmContent)
    }

    const changedFromFileSystem =
      Diff.diffChars(pmContent, fsContent).length > 1
    if (changedFromFileSystem) {
      const fsDoc = parser.parse(fsContent)

      if (fsDoc) {
        replaceWholeViewWithNewDoc(
          v,
          createNewDocWithTitleIfNotHasOne(v.state.schema, fsDoc, handle.name)
        )
      }
    }
    return setPrevContent(pmContent)
  }
  function createNewDocWithTitleIfNotHasOne(
    schema: Schema,
    doc: Node,
    title: string
  ) {
    if (doc.firstChild?.textContent !== title) {
      const tr = new Transform(doc)
      return tr.insert(0, createTitleNode(schema, title)).doc
    } else {
      return doc
    }
  }

  function replaceWholeViewWithNewDoc(view: EditorView, doc: Node) {
    view.dispatch(
      view.state.tr.replaceRangeWith(0, view.state.doc.content.size, doc)
    )
  }

  function createTitleNode(schema: Schema, text: string) {
    const titleJSON = [{ type: "text", text: text }]
    return schema.nodes.heading.create(
      { level: 1 },
      Fragment.fromJSON(schema, titleJSON)
    )
  }

  const [filesync] = createStore({
    setRoot: setRoot,
    setView: setView,
    handles: fsHandles,
    startSync: startSync,
  })

  return (
    <FileSyncContext.Provider value={filesync}>
      {props.children}
    </FileSyncContext.Provider>
  )
}

export function useFileSync() {
  return useContext(FileSyncContext)!
}
