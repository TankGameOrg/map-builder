import { useState } from "preact/hooks";
import { addPlayer, linkEntityToPlayer, setPlayerAttribute, shufflePlayers } from "../interface-adapters/map-builder.js";
import { EditAttributes } from "./edit-entity.jsx";


export function PlayersEditor({ mapBuilderState, dispatch }) {
    const {players} = mapBuilderState.editor;

    return (
        <>
            {players.map(({playerEditor, playerRef}, index) => {
                const updateAttribute = (attributeName, value) => {
                    dispatch(setPlayerAttribute(index, attributeName, value));
                };

                return (
                    <div key={index}>
                        {index > 0 ? <hr/> : undefined}
                        <EditAttributes
                            attributeEditor={playerEditor}
                            updateAttribute={updateAttribute}></EditAttributes>
                        <EditPlayerLinks
                            mapBuilderState={mapBuilderState}
                            dispatch={dispatch}
                            playerRef={playerRef}
                            builderConfig={playerEditor.builderEntitiyConfig}></EditPlayerLinks>
                    </div>
                );
            })}
            <div key="add-player">
                <hr/>
                <button onClick={() => dispatch(addPlayer())}>Add player</button>
                <button onClick={() => dispatch(shufflePlayers())}>Shuffle Players</button>
            </div>
        </>
    );
}

function EditPlayerLinks({ mapBuilderState, dispatch, playerRef, builderConfig }) {
    const [entityToLinkIndex, setEntityToLinkIndex] = useState(0);
    const gameState = mapBuilderState?.map?.initialGameState;
    const player = playerRef.getPlayer(gameState);
    if(!player) return;

    const linkableEntities = builderConfig.getLinkableEntities(gameState, player);

    const linkEntity = () => {
        const entityToLink = linkableEntities[entityToLinkIndex];
        dispatch(linkEntityToPlayer(entityToLink, player));
    };

    return (
        <>
            <h3>Links</h3>
            <ul>
                {gameState.getEntitiesByPlayer(player).map((entity, index) => {
                    return (
                        <li key={entity.position?.humanReadable || index}>
                            {describeEntity(entity)}
                        </li>
                    );
                })}
            </ul>
            <p>
                {linkableEntities.length > 0 ? (
                    <>
                        <select
                                value={entityToLinkIndex}
                                onChange={e => setEntityToLinkIndex(+e.target.value || 0)}>
                            {linkableEntities.map((entity, index) => {
                                return <option key={index} value={index}>{describeEntity(entity)}</option>;
                            })}
                        </select>
                        <button
                            disabled={entityToLinkIndex >= linkableEntities.length} onClick={linkEntity}>
                            Link
                        </button>
                    </>
                ) : undefined}
            </p>
        </>
    );
}

function describeEntity(entity) {
    return `${entity.type}${entity.position ? ` at ${entity.position.humanReadable}` : ""}`;
}