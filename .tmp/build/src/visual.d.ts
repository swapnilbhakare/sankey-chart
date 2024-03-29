import powerbi from "powerbi-visuals-api";
import "./../style/visual.less";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
export declare class Visual implements IVisual {
    private target;
    private host;
    private barContainer;
    private svg;
    private data;
    private label;
    private dropdownContainerX;
    private nodeAlignment;
    constructor(options: VisualConstructorOptions);
    update(options: VisualUpdateOptions): void;
    private converter;
    private render;
}
