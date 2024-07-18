import {webpackConfig} from "tank_game_ui/webpack.config.js";

export default function mapBuilderWebpackConfig() {
    return webpackConfig({
        appName: "Map Builder",
        configFileUrl: import.meta.url,
    });
}