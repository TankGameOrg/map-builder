import "./edit-entity.css";
import { setMetaEntityAttibute, setSelectedAttibute, setSelectedEntityType } from "../interface-adapters/map-builder.js";
import { prettyifyName } from "tank_game_ui/utils.js";
import { KEY_S } from "tank_game_ui/ui/generic/global-keybinds.js";

// Stop propagation of ctrl+x,c,v key presses inside editor
function filterKeyBinds(e) {
    if(!e.ctrlKey || e.keyCode != KEY_S) e.stopPropagation();
}

export function EditSpace({ mapBuilderState, dispatch }) {
    return (
        <>
            <h2>Entity</h2>
            <EditEntity dispatch={dispatch} targetType="entity" mapBuilderState={mapBuilderState}></EditEntity>
            <h2>Floor</h2>
            <EditEntity dispatch={dispatch} targetType="floorTile" mapBuilderState={mapBuilderState}></EditEntity>
        </>
    );
}

function EditEntity({ dispatch, targetType, mapBuilderState }) {
    const selectEntityType = e => {
        dispatch(setSelectedEntityType(targetType, e.target.value));
    };

    const {editable, type, attributeEditor} = mapBuilderState?.editor?.[targetType] || {};
    if(!editable) {
        return (
            <p>Select one or more {prettyifyName(targetType, { capitalize: false, plural: true })} that have the same type and attributes to edit</p>
        );
    }

    const updateAttribute = (attributeName, value) => {
        dispatch(setSelectedAttibute(targetType, attributeName, value));
    };

    return (
        <div onKeyDown={filterKeyBinds}>
            <select value={type} onChange={selectEntityType}>
                <option key="empty" value="empty">Empty</option>
                {mapBuilderState[`${targetType}Types`].map(type => {
                    return (
                        <option key={type} value={type}>{prettyifyName(type)}</option>
                    );
                })}
            </select>
            <EditAttributes
                attributeEditor={attributeEditor}
                updateAttribute={updateAttribute}></EditAttributes>
        </div>
    );
}

export function EditAttributes({ attributeEditor, updateAttribute }) {
    return (
        <>
            {Object.keys(attributeEditor.attributes).map(attributeName => {
                const builderAttributeConfig = attributeEditor.builderEntitiyConfig?.attributes?.[attributeName];
                if(builderAttributeConfig?.hidden) {
                    return;
                }

                const description = builderAttributeConfig?.description;
                const errorMessage = attributeEditor.attributeErrors[attributeName];
                const value = attributeEditor.attributes[attributeName];
                const hasMax = value?.value !== undefined && value?.max !== undefined;

                const onInput = hasMax ?
                    (key, e) => updateAttribute(attributeName, { ...value, [key]: e.target.value }) :
                    e => updateAttribute(attributeName, e.target.value);

                let editor = <input value={value} onInput={onInput} onKeyDown={e => e.stopPropagation()}/>;
                if(hasMax) {
                    editor = (
                        <div>
                            <input
                                value={value.value}
                                onInput={e => onInput("value", e)}
                                style={{ width: "100px" }}
                                onKeyDown={e => e.stopPropagation()}/>
                            <span> / </span>
                            <input
                                value={value.max}
                                onInput={e => onInput("max", e)}
                                style={{ width: "100px" }}
                                onKeyDown={e => e.stopPropagation()}/>
                        </div>
                    );
                }

                return (
                    <label key={attributeName} className={errorMessage === undefined ? "" : "edit-entity-field-error"}>
                        <h4>{prettyifyName(attributeName)}</h4>
                        {description !== undefined ? <div>{description}</div> : undefined}
                        {editor}
                        {errorMessage ? <div className="edit-entity-error-message">{errorMessage}</div> : undefined}
                    </label>
                );
            })}
        </>
    );
}

export function MetaEntityEditor({ mapBuilderState, dispatch }) {
    const {metaEntities} = mapBuilderState.editor;

    return (
        <>
            {Object.keys(metaEntities).map((metaEntityName) => {
                const {name, attributeEditor} = metaEntities[metaEntityName];

                const updateAttribute = (attributeName, value) => {
                    dispatch(setMetaEntityAttibute(name, attributeName, value));
                };

                return (
                    <div key={name}>
                        <h2>{prettyifyName(name)}</h2>
                        <EditAttributes
                            attributeEditor={attributeEditor}
                            updateAttribute={updateAttribute}></EditAttributes>
                    </div>
                );
            })}
        </>
    );
}
