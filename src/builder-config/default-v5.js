import { builderConfigV4 } from "./default-v4.js";

export const builderConfigV5 = {
    ...builderConfigV4,
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
        unwalkable_floor: {},
        destructible_floor: {
            defaultAttributes: {
                durability: { value: 5, max: 5 },
            },
            attributes: {
                durability: { type: "number", min: 0 },
            },
        },
    },
};