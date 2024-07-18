import { builderConfigV3 } from "./3.js";
import { builderConfigV4 } from "./4.js";

let configsForVersion = new Map();
configsForVersion.set("3", builderConfigV3);
configsForVersion.set("4", builderConfigV4);

export function getBuilderConfig(name) {
    return configsForVersion.get(name);
}

export function getAllVersions() {
    return Array.from(configsForVersion.keys());
}