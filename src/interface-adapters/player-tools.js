import Player from "tank_game_ui/game/state/players/player.js";
import Players from "tank_game_ui/game/state/players/players.js";
import { deepClone } from "tank_game_ui/utils.js";
import { AttributeEditor } from "./editor.js";


export function makePlayerEditor(playerIndex, player, builderConfig) {
    return {
        playerRef: player.asRef(),
        playerEditor: new AttributeEditor({
            entities: [player],
            builderEntitiyConfig: builderConfig.player,
            modifyEntity: (map, player) => ({
                ...map,
                initialGameState: map.initialGameState.modify({
                    players: new Players([
                        ...map.initialGameState.players.getAllPlayers().slice(0, playerIndex),
                        player,
                        ...map.initialGameState.players.getAllPlayers().slice(playerIndex + 1),
                    ]),
                }),
            }),
        }),
    };
}


export function playerToolsReducer(state, action) {
    if(action.type == "add-player") {
        const builderConfig = state._builderConfig;
        const newPlayer = new Player(deepClone(builderConfig.player.defaultAttributes));

        state = {
            ...state,
            map: {
                ...state.map,
                initialGameState: state.map.initialGameState.modify({
                    players: new Players([
                        ...state.map.initialGameState.players.getAllPlayers(),
                        newPlayer,
                    ]),
                }),
            },
            editor: {
                ...state.editor,
                players: [
                    ...state.editor.players,
                    makePlayerEditor(state.editor.players.length, newPlayer, builderConfig),
                ],
            }
        };

        state.onChange(state.map);

        return state;
    }
    else if(action.type == "link-entity-to-player") {
        let newEntity = action.entity.clone();
        newEntity.addPlayer(action.player);

        // TODO: Support linking to meta entities
        let newBoard = state.map.initialGameState.board.clone();
        newBoard.setEntity(newEntity);

        state = {
            ...state,
            map: {
                ...state.map,
                initialGameState: state.map.initialGameState.modify({
                    board: newBoard,
                }),
            },
        };

        state.onChange(state.map);

        return state;
    }
    else if(action.type == "set-player-attribute") {
        const {playerEditor} = state.editor.players[action.playerIndex];
        const [map, attributeEditor] = playerEditor.editAttribute(state.map, action.name, action.value);

        state = {
            ...state,
            map: map,
            editor: {
                ...state.editor,
                players: [
                    ...state.editor.players.slice(0, action.playerIndex),
                    {
                        ...state.editor.players[action.playerIndex],
                        playerEditor: attributeEditor,
                    },
                    ...state.editor.players.slice(action.playerIndex + 1),
                ],
            }
        };

        state.onChange(state.map);

        return state;
    }
    else if(action.type == "shuffle-players") {
        state = {
            ...state,
            map: {
                ...state.map,
                initialGameState: shufflePlayers(state.map.initialGameState, state._builderConfig),
            }
        };

        state.onChange(state.map);

        return state;
    }
}


export function buildPlayerEditors(players, builderConfig) {
    let playerEditor = [];
    players = players.getAllPlayers();
    for(let i = 0; i < players.length; ++i) {
        playerEditor.push(makePlayerEditor(i, players[i], builderConfig));
    }

    return playerEditor;
}


function shuffleArray(array) {
    // Basic impl of Fisher–Yates shuffle
    for(let i = array.length - 1; i >= 0; --i) {
        const randomIndex = Math.floor(Math.random() * i);
        const temp = array[randomIndex];
        array[randomIndex] = array[i];
        array[i] = temp;
    }
}


function shufflePlayers(gameState, builderConfig) {
    let playersToShuffle = builderConfig.getPlayersToShuffle(gameState)
        .map(player => player.clone());
    let entitiesToShuffle = builderConfig.getEntitiesToShuffle(gameState)
        .map(entity => entity.clone({ removePlayers: true }));

    shuffleArray(playersToShuffle);
    shuffleArray(entitiesToShuffle);

    const minLength = Math.min(playersToShuffle.length, entitiesToShuffle.length);
    for(let i = 0; i < minLength; ++i) {
        entitiesToShuffle[i].addPlayer(playersToShuffle[i]);
    }

    // TODO: Handle shuffling non board entities
    let newBoard = gameState.board.clone();
    for(const entity of entitiesToShuffle) {
        newBoard.setEntity(entity);
    }

    return gameState.modify({
        board: newBoard,
    });
}
