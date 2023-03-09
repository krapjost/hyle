import "hyle/pm/editor.css"
import "prosemirror-view/style/prosemirror.css"

import type { Component } from "solid-js"
import type { FileWithDirectoryAndFileHandle } from "browser-fs-access"

import { createSignal, createEffect } from "solid-js"

import { EditorView } from "prosemirror-view"
import { Fragment, Node, Schema } from "prosemirror-model"
import { EditorState, Selection, Transaction } from "prosemirror-state"

import setupPlugins from "hyle/pm"
import { useFileSync } from "hyle/store/filesync"
import { useI18n } from "@solid-primitives/i18n"
import { parser } from "hyle/pm/markdown/parser"

type View = EditorView | undefined

declare global {
  // eslint-disable-next-line no-var
  var v: View
}
globalThis.v = undefined

type EditorProps = {
  docName: string | undefined
}

const Editor: Component<EditorProps> = (props) => {
  const { setRoot, setView, handles, startSync } = useFileSync()
  const [t] = useI18n()
  const [contentSize, setContentSize] = createSignal(0)

  function setCursorAtEnd() {
    if (!v) return
    v.dispatch(v.state.tr.setSelection(Selection.atEnd(v.state.doc)))
    v.focus()
  }

  function setContentCharSize(tr: Transaction) {
    const titleSize = tr.doc.firstChild?.textContent.length ?? 0
    const totalContentSize = tr.doc.textContent.length
    setContentSize(totalContentSize - titleSize)
  }

  async function parseMarkdownFile(file: File) {
    const text = await file.text()
    return parser.parse(text)
  }

  function createTitleNode(schema: Schema) {
    const titleJSON = [{ type: "text", text: props.docName }]
    return schema.nodes.heading.create(
      { level: 1 },
      Fragment.fromJSON(schema, titleJSON)
    )
  }

  function setFileView(doc: Node) {
    v?.destroy()
    v = setView(
      new EditorView(document.getElementById("editor"), {
        state: EditorState.create({
          doc: doc,
          plugins: setupPlugins(),
        }),
        dispatchTransaction: (tr) => {
          if (!v) return
          setContentCharSize(tr)
          v.updateState(v.state.apply(tr))
        },
      })
    )
    v.dispatch(v.state.tr.insert(0, createTitleNode(v.state.schema)))
    setContentCharSize(v.state.tr)
  }

  function setTabbarTitle(title?: string | undefined) {
    document.title = title ?? t("editor.default_title")
  }

  createEffect(async () => {
    const fsHandles = handles()
    if (!fsHandles) return

    const isEmptyDirectory = fsHandles[0] instanceof FileSystemDirectoryHandle
    if (isEmptyDirectory) {
      setTabbarTitle()
    } else {
      const { docName: selectedDocName } = props
      if (!selectedDocName) return
      setTabbarTitle(selectedDocName)

      const selectedHandle = (
        fsHandles as Array<FileWithDirectoryAndFileHandle>
      ).find((f) => f.name === selectedDocName)
      if (!selectedHandle) return
      const selectedFileHandle = selectedHandle.handle
      if (!selectedFileHandle) return
      const selectedFile = await selectedFileHandle.getFile()

      parseMarkdownFile(selectedFile).then((doc) => {
        if (!doc) return
        setFileView(doc)
        startSync(selectedFileHandle)
      })
    }
  })

  return (
    <div class="flex flex-col grow min-h-screen ">
      <div class="absolute top-5 right-5 bg-black/50 text-white px-2 py-1 text-xs rounded">
        {contentSize()}
      </div>
      <div
        id="editor"
        class="bg-white text-black dark:bg-gray-900 dark:text-white"
      />
      <div
        class="grow w-full cursor-text bg-gray-50 dark:bg-gray-900"
        onclick={() => {
          if (v) {
            setCursorAtEnd()
          } else {
            if (confirm("Do you want to set dir")) {
              setRoot()
            }
          }
        }}
      ></div>
    </div>
  )
}

export default Editor
