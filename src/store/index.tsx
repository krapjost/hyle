import type { JSX } from "solid-js"

import { FileSyncProvider } from "./filesync"
import { I18nProvider } from "./i18n"
import { UIProvider } from "./ui"

const Providers = (props: { children: JSX.Element }) => {
  return (
    <FileSyncProvider>
      <I18nProvider>
        <UIProvider>{props.children}</UIProvider>
      </I18nProvider>
    </FileSyncProvider>
  )
}

export default Providers
