import "./editor/editor.css";
import "prosemirror-view/style/prosemirror.css";
import type { Component } from "solid-js";

import { useFileSync } from "./editor/YFS";
import * as Y from "yjs";
import { createSignal, createEffect } from "solid-js";
import { useI18n } from "@solid-primitives/i18n";
import schema from "./editor/schema";
import setupPlugins from "./editor/setup";

import { EditorView } from "prosemirror-view";
import { EditorState, Selection } from "prosemirror-state";
import { defaultMarkdownParser } from "prosemirror-markdown";
import { FileWithDirectoryAndFileHandle } from "browser-fs-access";

declare global {
  interface Window {
    view: EditorView;
  }
}

type EditorProps = {
  doc: string | undefined;
};

// TODO: 브라우저 밖 다른 에디터에서 수정하는 것도 자동으로 싱크되도록 바라보고 있기
const Editor: Component<EditorProps> = (props) => {
  let view: EditorView;
  let content: HTMLDivElement;
  let editor: HTMLDivElement;

  const ydoc = new Y.Doc();
  const yXml = ydoc.getXmlFragment("hyle");

  const fs = useFileSync();
  const [t] = useI18n();
  const [contentSize, setContentSize] = createSignal(0);

  function setCursorAtEnd(view: EditorView) {
    view.dispatch(view.state.tr.setSelection(Selection.atEnd(view.state.doc)));
    return view;
  }

  async function startSyncFor(
    handle: FileWithDirectoryAndFileHandle | FileSystemDirectoryHandle
  ) {
    if (handle instanceof File) {
      const text = await handle.text();
      const docNodes = defaultMarkdownParser.parse(text);
      const mdSchema = docNodes?.type.schema;

      if (docNodes && mdSchema) {
        if (view) {
          view.destroy();
        }
        view = new EditorView(editor, {
          state: EditorState.create({
            doc: docNodes,
            plugins: setupPlugins({
              xml: yXml,
              schema: mdSchema,
            }),
          }),
          dispatchTransaction: (tr) => {
            if (!tr.docChanged) return view.updateState(view.state.apply(tr));
            setContentSize(tr.doc.content.size);
            fs?.sync(tr.doc, handle);
            view.updateState(view.state.apply(tr));
          },
        });
        setCursorAtEnd(view).focus();
      }
    } else {
      if (view) {
        view.destroy();
      }
      view = new EditorView(editor, {
        state: EditorState.create({
          schema,
          plugins: setupPlugins({
            xml: yXml,
            schema: schema,
          }),
        }),
        dispatchTransaction: (tr) => {
          if (!tr.docChanged) return view.updateState(view.state.apply(tr));
          setContentSize(tr.doc.content.size);
          const titleBefore = tr.before.content.firstChild?.textContent;
          const titleCurrent = tr.doc.content.firstChild?.textContent;
          if (titleCurrent && titleBefore === titleCurrent) {
            fs?.sync(tr.doc, handle);
          }
          view.updateState(view.state.apply(tr));
        },
      });
      setCursorAtEnd(view).focus();
    }
  }

  createEffect(() => {
    const handles = fs?.fsHandles();
    if (props.doc && handles) {
      const file = (handles as Array<FileWithDirectoryAndFileHandle>).find(
        (file: File) => file.name === props.doc
      );
      if (file) {
        document.title = props.doc;
        startSyncFor(file);
      }
    } else if (handles?.at(0) instanceof FileSystemDirectoryHandle) {
      const emptyDir = handles[0];
      document.title = t("editor.default_title");
      startSyncFor(emptyDir);
    }
  });

  return (
    <div class="flex flex-col grow min-h-screen ">
      <div class="absolute top-5 right-5 bg-black/50 text-white px-2 py-1 text-xs rounded">
        {contentSize()}
      </div>
      <div ref={content!} id="content" />
      <div
        ref={editor!}
        id="editor"
        class="bg-white text-black dark:bg-gray-900 dark:text-white"
      />
      <div
        class="grow w-full cursor-text bg-gray-50 dark:bg-gray-900"
        onclick={() => {
          if (view) {
            view.dispatch(
              view.state.tr.setSelection(Selection.atEnd(view.state.doc))
            );
            view.focus();
          } else {
            if (confirm("are oyu want to set dir")) {
              fs?.setRoot();
            }
          }
        }}
      ></div>
    </div>
  );
};

export default Editor;
