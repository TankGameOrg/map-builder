/* global document */
import "tank_game_ui/ui/index.css";
import { render } from "preact";
import { useDebugMode } from "tank_game_ui/ui/debug_mode.jsx";
import { MapBuilder } from "./builder.jsx";

function App() {
    const debug = useDebugMode();

    return (
        <MapBuilder debug={debug}></MapBuilder>
    )
}

render(<App></App>, document.body);
