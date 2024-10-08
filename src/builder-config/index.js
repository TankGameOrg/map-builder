import { builderConfigV3 } from "./default-v3.js";
import { builderConfigV4 } from "./default-v4.js";
import { builderConfigV5 } from "./default-v5.js";

let configsForVersion = new Map();
configsForVersion.set("default-v3", builderConfigV3);
configsForVersion.set("default-v4", builderConfigV4);
configsForVersion.set("default-v5-experimental", builderConfigV5);

export function getBuilderConfig(name) {
    return configsForVersion.get(name);
}

export function getAllVersions() {
    return Array.from(configsForVersion.keys());
}