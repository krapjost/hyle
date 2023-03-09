import { useContext, createSignal, JSX } from "solid-js"
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

function UIProvider(props: { children: JSX.Element }) {
  const ui = createUI()
  return <UIContext.Provider value={ui}> {props.children} </UIContext.Provider>
}

const useUI = () => useContext(UIContext)!

export { UIProvider, useUI }
