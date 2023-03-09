import { lazy, createEffect, createSignal, For } from "solid-js"
import { useI18n } from "@solid-primitives/i18n"
import { FileWithDirectoryAndFileHandle } from "browser-fs-access"
import { useUI } from "hyle/store/ui"
import { useFileSync } from "hyle/store/filesync"
import { ThemeSwitchButton } from "../common/buttons"

const Tooltip = lazy(() => import("../common/tooltip"))

function FileButton(props: { name: string }) {
  const { setTab } = useUI()
  return (
    <div
      onclick={() => {
        setTab(`doc-${props.name}`)
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
  )
}

function SearchButton() {
  const [t] = useI18n()
  const { toggleSearchModal } = useUI()
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
  )
}

export default function Sidebar() {
  let sidebarRef: HTMLDivElement
  const { handles, setRoot } = useFileSync()
  const [t] = useI18n()
  const { sidebar, toggleSidebar } = useUI()
  const [files, setFiles] = createSignal<
    FileWithDirectoryAndFileHandle[] | FileSystemDirectoryHandle[]
  >()
  const [rootDirectoryName, setRootDirectoryName] = createSignal<string>("")

  createEffect(() => {
    const fsHandles = handles()
    if (!fsHandles) return
    const firstHandle = fsHandles.at(0)
    if (firstHandle instanceof File && firstHandle.directoryHandle) {
      setFiles(fsHandles)
      setRootDirectoryName(firstHandle.directoryHandle.name)
    } else {
      setFiles(undefined)
      if (firstHandle instanceof FileSystemDirectoryHandle) {
        setRootDirectoryName(firstHandle.name)
      } else {
        setRootDirectoryName("Set Directory to edit")
      }
    }
  })

  createEffect(() => {
    if (sidebar()) {
      sidebarRef.classList.replace("sm:w-55", "sm:w-0")
    } else {
      sidebarRef.classList.replace("sm:w-0", "sm:w-55")
    }
  })

  return (
    <div
      ref={sidebarRef!}
      class={`flex flex-col justify-between w-40 sm:w-55 flex-none transition-width h-screen bg-white dark:bg-gray-900 border-r dark:border-gray-700 group/sidebar`}
    >
      <div class="text-gray-700 dark:text-gray-50">
        <ThemeSwitchButton />
        <div class="w-full px-2 my-2">
          <nav aria-label="Main Nav" class="flex flex-col mt-2 space-y-1">
            <div class="flex items-center justify-between">
              <button
                class="flex-auto group text-md rounded p-1 shrink-0 hover:bg-gray-50 hover:text-black dark:hover:bg-gray-700 w-min cursor-pointer flex items-center gap-2 relative"
                onclick={() => setRoot()}
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
  )
}
