import { createSignal } from "solid-js"
import { createContext } from "solid-js"
import { createStore } from "solid-js/store"

const createUI = () => {
  const [showSidebar, setShowSidebar] = createSignal(false)

  const [ui, setUI] = createStore({
    searchModal: false,
    sidebar: showSidebar,
    tab: "doc",

    hideSearchModal: (): void => setUI("searchModal", false),
    toggleSearchModal: (): void => setUI("searchModal", !ui.searchModal),
    toggleSidebar: (): boolean => setShowSidebar(!showSidebar()),
    setTab: (t: string): void => setUI("tab", t),
  })

  return ui
}

type UIContextType = ReturnType<typeof createUI>
const UIContext = createContext<UIContextType>()

export { UIContext }
export default createUI
