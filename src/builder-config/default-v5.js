import { builderConfigV4 } from "./default-v4.js";

export const builderConfigV5 = {
    ...builderConfigV4,
    metaEntities: {
        council: {
            type: "council",
            defaultAttributes: {},
            attributes: {},
        },
    },
    floorTile: {
        ...builderConfigV4.floorTile,
        health_pool: {
            defaultAttributes: {
                regeneration: 1,
            },
            attributes: {
                regeneration: { type: "number", min: 1 },
            },
        },
        unwalkable_floor: {
            defaultAttributes: {
                icon: "abyss",
            },
            attributes: {
                icon: { type: "string", oneOf: ["abyss", "barricade"] },
            },
        },
        destructible_floor: {
            defaultAttributes: {
                durability: { value: 5, max: 5 },
            },
            attributes: {
                durability: { type: "number", min: 0 },
            },
        },
        Lava: {
            defaultAttributes: {
                damage: 2,
            },
            attributes: {
                damage: { type: "number", min: 1 },
            },
        },
    },
    entity: {
        ...builderConfigV4.entity,
        wall: {
            ...builderConfigV4.entity.wall,
            attributes: {
                ...builderConfigV4.entity.wall.attributes,
                durability: {
                    ...builderConfigV4.entity.wall.attributes.durability,
                    max: 15,
                },
                days_remaining: { type: "number", min: 1 },
            },
            defaultAttributes: {
                ...builderConfigV4.entity.wall.defaultAttributes,
                durability: { value: 5, max: 12 },
            },
        },
        tank: {
            ...builderConfigV4.entity.tank,
            attributes: {
                ...builderConfigV4.entity.tank.attributes,
                speed: { type: "number", min: 1 },
                health: { type: "number", min: 1 },
            },
            defaultAttributes: {
                ...builderConfigV4.entity.tank.defaultAttributes,
                health: { value: 8, max: 8 },
                actions: { value: 0, max: 3 },
                speed: 2,
            },
        },
    },
    player: {
        ...builderConfigV4.player,
        attributes: {
            ...builderConfigV4.player.attributes,
            team: { type: "string", oneOf: ["abrams", "centurion", "leopard", "olifant"] },
        },
        defaultAttributes: {
            ...builderConfigV4.player.defaultAttributes,
            team: "abrams",
        },
    },
};