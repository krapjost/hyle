import type { JSX } from "solid-js";
import { useContext } from "solid-js";
import { I18nContext } from "@solid-primitives/i18n";
import { getUserLocaleContext } from "hyle/i18n";

import createUI, { UIContext } from "./createUI";
// import createDB, { DBContext } from "./createDB";

type ProviderProps = { children: JSX.Element };
const Provider = (props: ProviderProps) => {
  const ui = createUI();

  return (
    <I18nContext.Provider value={getUserLocaleContext()}>
      <UIContext.Provider value={ui}>
        {props.children}
      </UIContext.Provider>
    </I18nContext.Provider>
  );
};

const useUIState = () => useContext(UIContext)!;
// const useDBState = () => useContext(DBContext)!;

export {
  useUIState,
  // useDBState,
};
export default Provider;
