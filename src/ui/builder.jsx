/* global alert, confirm, window */
import "./builder.css";
import { useCallback, useEffect, useState } from "preact/hooks";
import { clearSelection, copy, cut, deleteSelected, paste, setMap, useMapBuilder } from "../interface-adapters/map-builder.js";
import { getBuilderConfig } from "../builder-config/index.js";
import { getGameVersion } from "tank_game_ui/versions/index.js";
import { AppContent } from "tank_game_ui/ui/app-content.jsx";
import { DELETE, ESCAPE, KEY_C, KEY_O, KEY_S, KEY_V, KEY_X, useGlobalKeyHandler } from "tank_game_ui/ui/generic/global-keybinds.js";
import { openFile, restorePreviousSession, SAVE_ON_CTRL_S } from "../drivers/game-file-web.js";
import { ErrorMessage } from "tank_game_ui/ui/error_message.jsx";
import { CreateGameDialog } from "./create-map-dialog.jsx";
import { MapBuilderEditor } from "./editor.jsx";

function useMapBuilderKeyBinds(dispatch, loadFile, saveChanges, setCreateGameDialogOpen) {
    useGlobalKeyHandler((e) => {
        if(e.ctrlKey && e.keyCode == KEY_O) {
            e.preventDefault();
            loadFile();
        }
        else if(e.keyCode == ESCAPE) {
            setCreateGameDialogOpen(false);
            dispatch(clearSelection());
        }
        else if(e.keyCode == DELETE) {
            deleteSelected(dispatch);
        }
        else if(e.ctrlKey && e.keyCode == KEY_X) {
            dispatch(cut());
        }
        else if(e.ctrlKey && e.keyCode == KEY_C) {
            dispatch(copy());
        }
        else if(e.ctrlKey && e.keyCode == KEY_V) {
            dispatch(paste());
        }
        else if(e.ctrlKey && e.keyCode == KEY_S) {
            e.preventDefault();
            if(SAVE_ON_CTRL_S) {
                saveChanges();
            }
        }
    }, [dispatch, saveChanges]);
}

function useBeforeNavigate(callback, deps = []) {
    callback = useCallback(callback, [callback].concat(deps));  // eslint-disable-line

    useEffect(() => {
        window.addEventListener("beforeunload", callback);
        return () => window.removeEventListener("beforeunload", callback);
    }, [callback]);
}

async function loadGameFile(isUnsaved, setIsUnsaved, setGameFile, setError) {
    if(isUnsaved && !confirm("You have unsaved changes.  Are you sure you want to lose them?")) {
        return;
    }

    setIsUnsaved(false);
    setError(undefined);
    setGameFile(undefined);

    try {
        setGameFile(await openFile())
    }
    catch(err) {
        setError(err);
    }
}

async function saveGameFile(gameFile, setIsUnsaved) {
    // Nothing to save
    if(gameFile === undefined) return;

    try {
        await gameFile.save();
        setIsUnsaved(false);
    }
    catch(err) {
        alert(`Failed to save: ${err.message}`);
    }
}

export function MapBuilder({ debug }) {
    const [createGameDialogOpen, setCreateGameDialogOpen] = useState(false);
    const [isUnsaved, setIsUnsaved] = useState(false);
    const [error, setError] = useState();
    const [gameFile, setGameFile] = useState();
    const [mapBuilderState, dispatch] = useMapBuilder();

    const gameVersion = gameFile?.getData?.()?.gameVersion;

    const builderConfig = gameVersion !== undefined ? getBuilderConfig(gameVersion) : undefined;
    const versionConfig = gameVersion !== undefined ? getGameVersion(gameVersion) : undefined;

    useEffect(() => {
        if(gameFile && builderConfig) {
            dispatch(setMap(gameFile.getData(), builderConfig, map => {
                setIsUnsaved(true);
                gameFile.setData(map);
            }));
        }
    }, [gameFile, dispatch, builderConfig]);

    const loadFile = useCallback(
        () => loadGameFile(isUnsaved, setIsUnsaved, setGameFile, setError),
        [isUnsaved, setIsUnsaved, setGameFile, setError]);

    const saveChanges = useCallback(
        () => saveGameFile(gameFile, setIsUnsaved),
        [gameFile, setIsUnsaved]);

    useBeforeNavigate(() => {
        return isUnsaved ? "You have unsaved changes save them before closing the window" : "";
    }, [isUnsaved]);

    useMapBuilderKeyBinds(dispatch, loadFile, saveChanges, setCreateGameDialogOpen);

    const toolBarButtons = (
        <>
            <button onClick={loadFile}>Open Map</button>
            <button onClick={() => setCreateGameDialogOpen(true)}>New Map</button>
        </>
    );

    const createGameDialog = <CreateGameDialog
        open={createGameDialogOpen}
        setOpen={setCreateGameDialogOpen}
        setGameFile={setGameFile}
        setIsUnsaved={setIsUnsaved}
        isUnsaved={isUnsaved}></CreateGameDialog>;

    let versionError;
    if(gameVersion !== undefined && (builderConfig === undefined || versionConfig === undefined)) {
        versionError = `Game version ${gameVersion} is not supporred by the map builder`;
    }

    if(error !== undefined || versionError !== undefined) {
        return <AppContent>
            <div className="map-builder-toolbar">
                {toolBarButtons}
            </div>
            <ErrorMessage error={error || versionError}></ErrorMessage>
            {createGameDialog}
        </AppContent>;
    }

    if(gameFile === undefined) {
        return <AppContent>
            <div className="map-builder-toolbar">
                {toolBarButtons}
            </div>
            <p>Open or create a game file to get started</p>
            <RestoreUnsavedGame setGameFile={setGameFile} setError={setError} setIsUnsaved={setIsUnsaved}></RestoreUnsavedGame>
            {createGameDialog}
        </AppContent>;
    }

    return <MapBuilderEditor
        mapBuilderState={mapBuilderState}
        dispatch={dispatch}
        toolBarButtons={toolBarButtons}
        isUnsaved={isUnsaved}
        createGameDialog={createGameDialog}
        loadFile={loadFile}
        saveChanges={saveChanges}
        versionConfig={versionConfig}
        debug={debug}></MapBuilderEditor>
}

function RestoreUnsavedGame({ setGameFile, setError, setIsUnsaved }) {
    const [previousSession, setPreviousSession] = useState();

    useEffect(() => {
        setPreviousSession(restorePreviousSession());
    }, [setPreviousSession]);

    // Nothing to restore
    if(!previousSession) return;

    const restoreSession = () => {
        setGameFile(previousSession.gameFile);
        setError(undefined);
        setIsUnsaved(previousSession.unsaved);
    };

    const unsavedMsg = previousSession.unsaved ? " (unsaved)" : "";

    return (
        <button onClick={restoreSession}>Restore previous session{unsavedMsg}</button>
    );
}