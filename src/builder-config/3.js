function getLinkableEntities(gameState, player) {
    const controlledEntities = gameState.getEntitiesByPlayer(player);

    if(controlledEntities.length > 0 || player.type !== "tank") {
        return [];
    }

    return gameState.board.getAllEntities()
        .filter(entity => entity.type == "tank" && entity.getPlayerRefs().length === 0);
}


function getPlayersToShuffle(gameState) {
    return gameState.players.getAllPlayers().filter(player => {
        const entities = gameState.getEntitiesByPlayer(player);

        // Multiple entities imples councilor, don't touch
        if(entities.length > 1) return false;

        // No entities we can assign one easily
        if(entities.length === 0) return true;

        return entities[0].type == "tank";
    });
}

function getEntitiesToShuffle(gameState) {
    return gameState.board.getAllEntities()
        .filter(entity => entity.type == "tank" && entity.attributes.health !== undefined);
}


export const builderConfigV3 = {
    metaEntities: {
        council: {
            type: "council",
            defaultAttributes: {
                coffer: 0,
            },
            attributes: {
                coffer: { type: "number", min: 0 },
            },
        },
    },
    entity: {
        tank: {
            defaultAttributes: {
                health: 3,
                range: 3,
                actions: 0,
                gold: 0,
                bounty: 0,
            },
            attributes: {
                health: { type: "number", min: 1, max: 3 },
                range: { type: "number", min: 1 },
                actions: { type: "number", min: 0, max: 5, description: "Tank will start game with actions + 1" },
                gold: { type: "number", min: 0 },
                bounty: { type: "number", min: 0 },
                durability: { type: "number", min: 0, max: 3 },
            },
        },
        wall: {
            defaultAttributes: {
                durability: 3,
            },
            attributes: {
                durability: { type: "number", min: 1, max: 3 },
            },
        },
    },
    floorTile: {
        gold_mine: {},
    },
    board: {
        maxWidth: 26,
        maxHeight: 26,
    },
    player: {
        getLinkableEntities,
        attributes: {
            name: { type: "string", allowEmpty: false },
            type: { type: "string", oneOf: ["tank", "councilor", "senator"], hidden: true },
        },
        defaultAttributes: {
            name: "Unnamed Player",
            type: "tank",
        },
    },
    getPlayersToShuffle,
    getEntitiesToShuffle,
};
