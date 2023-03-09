import { render } from "solid-js/web"
import App from "./App"
import Providers from "./store"

render(
  () => (
    <Providers>
      <App />
    </Providers>
  ),
  document.getElementById("root") as HTMLElement
)
