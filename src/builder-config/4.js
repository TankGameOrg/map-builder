import { builderConfigV3 } from "./3.js";

export const builderConfigV4 = {
    ...builderConfigV3,
    metaEntities: {
        ...builderConfigV3.metaEntities,
        council: {
            ...builderConfigV3.metaEntities.council,
            defaultAttributes: {
                ...builderConfigV3.metaEntities.council.defaultAttributes,
                armistice: { value: 0, max: 50 },
            },
            attributes: {
                ...builderConfigV3.metaEntities.council.attributes,
                armistice: { type: "number", min: 0 },
            },
        },
    },
    entity: {
        ...builderConfigV3.entity,
        wall: {
            ...builderConfigV3.entity.wall,
            attributes: {
                ...builderConfigV3.entity.wall.attributes,
                durability: {
                    ...builderConfigV3.entity.wall.attributes.durability,
                    max: 6,
                },
            },
        },
    },
}
