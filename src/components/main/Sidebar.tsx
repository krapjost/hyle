import { lazy, createEffect, createSignal, For } from "solid-js";
import { useI18n } from "@solid-primitives/i18n";
import { useFileSync } from "../editor/YFS";
import { useUIState } from "../../store";
import { FileWithDirectoryAndFileHandle } from "browser-fs-access";

const Tooltip = lazy(() => import("../common/tooltip"));

function TrashButton() {
  const [t] = useI18n();
  const { tab, setTab } = useUIState();
  return (
    <button
      onclick={() => setTab("trash")}
      class={
        tab === "trash"
          ? "flex items-center py-2 gap-2 rounded-lg text-md bg-gray-100 dark:bg-gray-700"
          : "flex items-center py-2 gap-2 rounded-lg text-md hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-100"
      }
    >
      <div class="i-carbon-trash-can" />
      <span class="">{t("project.trash")}</span>
    </button>
  );
}
function FileButton(props: { name: string }) {
  const { setTab } = useUIState();
  return (
    <div
      onclick={() => {
        setTab(`doc-${props.name}`);
      }}
      class="group flex items-center pl-4 py-1 gap-2 text-sm rounded hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-100 cursor-pointer select-none"
    >
      <div class="i-carbon-book text-sm" />
      <span>{props.name}</span>
      <div class="grow" />
      <button class="opacity-0 transition-opacity group-hover:opacity-100 delay-50 rounded p-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
        <div class="i-carbon-add text-sm" />
      </button>
    </div>
  );
}

function SearchButton() {
  const [t] = useI18n();
  const { toggleSearchModal } = useUIState();
  return (
    <button
      class="w-full text-xs rounded-lg border border-gray-400 shadow-sm flex justify-between items-center py-2 px-4 hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-100"
      onclick={toggleSearchModal}
    >
      <div class="flex items-center gap-2">
        <span class="i-carbon-search text-sm" />
        <span>{t("project.search")}</span>
      </div>
      <span class="rounded">Ctrl K</span>
    </button>
  );
}

export default function Sidebar() {
  let sidebarRef: HTMLDivElement;
  const fs = useFileSync();
  const [t] = useI18n();
  const { sidebar, toggleSidebar } = useUIState();
  const [files, setFiles] = createSignal<
    FileWithDirectoryAndFileHandle[] | FileSystemDirectoryHandle[] | undefined
  >();
  const [rootDirectoryName, setRootDirectoryName] = createSignal<string>("");

  createEffect(() => {
    const handles = fs?.fsHandles();
    if (handles) {
      console.log("handle is", handles);
      console.log("inside sidebar", handles[0].name);
      const firstHandle = handles.at(0);
      if (firstHandle instanceof File && firstHandle.directoryHandle) {
        setFiles(handles);
        setRootDirectoryName(firstHandle.directoryHandle.name);
      } else {
        setFiles(undefined);
        if (firstHandle instanceof FileSystemDirectoryHandle) {
          setRootDirectoryName(firstHandle.name);
        } else {
          setRootDirectoryName("Set Directory");
        }
      }
    }

    if (sidebar()) {
      sidebarRef.classList.replace("sm:w-55", "sm:w-0");
    } else {
      sidebarRef.classList.replace("sm:w-0", "sm:w-55");
    }
  });

  return (
    <div
      ref={sidebarRef!}
      class={`flex flex-col justify-between w-40 sm:w-55 flex-none transition-width h-screen bg-white dark:bg-gray-900 border-r dark:border-gray-700 group/sidebar`}
    >
      <div class="text-gray-700 dark:text-gray-50">
        <div class="w-full px-2 my-2">
          <nav aria-label="Main Nav" class="flex flex-col mt-2 space-y-1">
            <div class="flex items-center justify-between">
              <button
                class="flex-auto group text-md rounded p-1 shrink-0 hover:bg-gray-50 hover:text-black dark:hover:bg-gray-700 w-min cursor-pointer flex items-center gap-2 relative"
                onclick={() => fs?.setRoot()}
              >
                <div class="i-carbon-folder" />
                {rootDirectoryName()}
                <Tooltip for="directory" direction="bottom" />
              </button>
            </div>

            <For each={files()} fallback={<div>Empty directory</div>}>
              {(file) => <FileButton name={file.name} />}
            </For>
          </nav>
        </div>
      </div>
      <div class="flex items-center justify-end gap-2 inset-x-0 bottom-0 border-t border-gray-200 dark:border-gray-600 p-2">
        <SearchButton />
        <button
          onclick={toggleSidebar}
          class="group flex relative p-2 rounded bg-white text-white group-hover/sidebar:bg-black transition-colors delay-100 ease-in"
        >
          <Tooltip for="hideSidebar" />
          <span class="i-carbon-chevron-left" />
        </button>
      </div>
    </div>
  );
}
