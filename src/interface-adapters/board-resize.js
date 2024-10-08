import { Position } from "tank_game_ui/game/state/board/position.js";
import { updateEditorOnSelection } from "./editor.js";

export function resizeBoardReducer(state, action) {
    if(action.type == "resize-board") {
        const newBoard = state.map.initialGameState.board.cloneAndResize(action.resizeParameters);

        const remapPosition = position => remapPositionForResize(position, newBoard, action.resizeParameters);

        // Transfer selection so it is still in the same place on the new board or is removed if it was on the edge
        const locations = state.locationSelector.locations !== undefined ?
            state.locationSelector.locations
                .map(position => remapPosition(position))
                .filter(position => position !== undefined) :
            [];

        const lastSelected = state.locationSelector.lastSelected !== undefined ?
            remapPosition(state.locationSelector.lastSelected) :
            undefined;

        // Update the clipboard position to fit on the resized board
        const clipboard = state?.clipboard?.remapPositions?.(newBoard, lastSelected !== undefined ? new Position(lastSelected): undefined, remapPosition);

        const initialGameState = state.map.initialGameState.modify({
            board: newBoard,
        });

        state = {
            ...state,
            clipboard,
            map: {
                ...state.map,
                initialGameState,
            },
            locationSelector: {
                ...state.locationSelector,
                // Make all of the locations on the new board selectable
                selectableLocations: generateAllLocations(newBoard),
                locations,
                lastSelected,
            },
            resizeBoard: checkCanResize(newBoard, state._builderConfig),
            // Reset the editor if the location we're editing is removed
            editor: updateEditorOnSelection(initialGameState, locations, state._builderConfig),
        };

        state.onChange(state.map);

        return state;
    }
}

function remapPositionForResize(position, board, { left = 0, top = 0 }) {
    try {
        position = new Position(position);
        position = new Position(position.x + left, position.y + top);
        if(!board.isInBounds(position)) return;
        return position.humanReadable;
    }
    catch(err) {
        return;
    }
}

export function checkCanResize(board, builderConfig) {
    return {
        canGrowX: board.width < builderConfig.board.maxWidth,
        canGrowY: board.height < builderConfig.board.maxHeight,
        canShrinkX: board.width > 1,
        canShrinkY: board.height > 1,
    };
}

export function generateAllLocations(board) {
    let positions = [];

    for(let x = 0; x < board.width; ++x) {
        for(let y = 0; y < board.height; ++y) {
            positions.push(new Position(x, y).humanReadable);
        }
    }

    return positions;
}