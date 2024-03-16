import { Visual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api";
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import DialogConstructorOptions = powerbiVisualsApi.extensibility.visual.DialogConstructorOptions;
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];
var sankeyE829DE6DFE6A4C13A573BD1FB9C7C096_DEBUG: IVisualPlugin = {
    name: 'sankeyE829DE6DFE6A4C13A573BD1FB9C7C096_DEBUG',
    displayName: 'sankey',
    class: 'Visual',
    apiVersion: '5.1.0',
    create: (options?: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }
        throw 'Visual instance not found';
    },
    createModalDialog: (dialogId: string, options: DialogConstructorOptions, initialState: object) => {
        const dialogRegistry = (<any>globalThis).dialogRegistry;
        if (dialogId in dialogRegistry) {
            new dialogRegistry[dialogId](options, initialState);
        }
    },
    custom: true
};
if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["sankeyE829DE6DFE6A4C13A573BD1FB9C7C096_DEBUG"] = sankeyE829DE6DFE6A4C13A573BD1FB9C7C096_DEBUG;
}
export default sankeyE829DE6DFE6A4C13A573BD1FB9C7C096_DEBUG;