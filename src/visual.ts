"use strict";

import powerbi from "powerbi-visuals-api";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataView = powerbi.DataView;
import * as d3 from 'd3'
import { sankey, sankeyCenter, sankeyLeft, sankeyRight, sankeyJustify, sankeyLinkHorizontal } from 'd3-sankey';

interface SankeyChartData {
    nodes: SankeyNode[];
    links: SankeyLink[];
}

interface SankeyNode {
    name: string;
    color?: string;
    x0?: number;
    y0?: number;
    x1?: number;
    y1?: number;
}

interface SankeyLink {
    source: number;
    target: number;
    value: number;
    color?: string;
}
enum NodeAlignment {
    Left = 'left',
    Right = 'right',
    Center = 'center',
    Justify = 'justify',
}
export class Visual implements IVisual {
    private target: HTMLElement;
    private host: IVisualHost;
    private barContainer: d3.Selection<SVGElement, any, any, any>;
    private svg: d3.Selection<SVGElement, any, any, any>;
    private data: SankeyChartData;

    private label: HTMLLabelElement
    private dropdownContainerX: HTMLSelectElement
    private nodeAlignment: NodeAlignment = NodeAlignment.Justify;
    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.host = options.host;

        this.label = document.createElement('label');
        this.label.textContent = "X : ";
        options.element.appendChild(this.label);

        this.dropdownContainerX = document.createElement('select');
        options.element.appendChild(this.dropdownContainerX);
        this.dropdownContainerX.style.marginRight = "10px";
        const xAxisOptions = ["left", "right", "center", 'justify']

        xAxisOptions.forEach(option => {
            const xAxisOption = document.createElement('option');
            xAxisOption.value = option;
            xAxisOption.textContent = option;
            this.dropdownContainerX.appendChild(xAxisOption);
        });

        this.svg = d3.select(options.element).append("svg");
        this.barContainer = this.svg.append("g").classed("bar-container", true);

    }


    public update(options: VisualUpdateOptions) {
        const dataView: DataView = options.dataViews[0];
        this.data = this.converter(dataView);

        // Clear previous nodes and links
        this.barContainer.selectAll('.node, .link').remove();

        this.dropdownContainerX.addEventListener('change', () => {
            this.nodeAlignment = this.dropdownContainerX.value as NodeAlignment;
            this.barContainer.selectAll('.node, .link').remove(); // Clear previous nodes and links
            this.render(this.data)
        });
        this.render(this.data)
    }




    private converter(dataView: DataView): SankeyChartData {
        let nodes: SankeyNode[] = [];
        let links: SankeyLink[] = [];

        const categorical = dataView.categorical;

        if (!categorical || !categorical.categories || !categorical.values || categorical.categories.length < 2) {
            return { nodes: [], links: [] };
        }

        const categoryValues = categorical.categories[0].values;
        const legendValues = categorical.categories[1].values;
        const valueValues = categorical.values[0].values;
        const colors = this.host.colorPalette;

        for (let i = 0; i < legendValues.length; i++) {
            const category = categoryValues[i].toString();
            const legend = legendValues[i].toString();
            const value = valueValues[i] as number;

            // Find or add the category node
            let sourceNodeIndex = nodes.findIndex(node => node.name === category);
            if (sourceNodeIndex === -1) {
                sourceNodeIndex = nodes.length;
                nodes.push({ name: category, color: colors.getColor(category).value });
            }

            // Find or add the legend node (target)
            let targetNodeIndex = nodes.findIndex(node => node.name === legend);
            if (targetNodeIndex === -1) {
                targetNodeIndex = nodes.length;
                nodes.push({ name: legend, color: colors.getColor(legend).value });
            }

            // Create a link between category (source) and legend (target) with the value
            links.push({
                source: sourceNodeIndex,
                target: targetNodeIndex,
                value: value,
                color: colors.getColor(legend).value
            });
        }

        return { nodes: nodes, links: links };
    }
    private render(data: SankeyChartData) {
        const width = this.target.clientWidth;
        const height = this.target.clientHeight;
        let nodeAlignFunction;
        switch (this.nodeAlignment) {
            case NodeAlignment.Left:
                nodeAlignFunction = sankeyLeft;
                break;
            case NodeAlignment.Right:
                nodeAlignFunction = sankeyRight;
                break;
            case NodeAlignment.Center:
                nodeAlignFunction = sankeyCenter;
                break;
            default:
                nodeAlignFunction = sankeyJustify;
                break;
        }

        // Clear previous strokes and text elements
        this.svg.selectAll('.link').remove();
        this.svg.selectAll('text').remove();

        this.svg.attr('width', width).attr('height', height);
        const sankeyLayout = sankey<SankeyNode, SankeyLink>()
            .nodeWidth(15)
            .nodePadding(10)
            .nodeAlign(nodeAlignFunction)
            .extent([[1, 5], [this.target.clientWidth - 1, this.target.clientHeight - 5]]);

        const { nodes, links } = sankeyLayout(data);

        const nodeGroup = this.barContainer
            .selectAll('.node')
            .data(nodes)
            .enter().append('rect')
            .attr('x', d => d.x0)
            .attr('y', d => d.y0 ?? 0)
            .attr('width', d => d.x0 ? d.x1 - d.x0 : 0)
            .attr('height', d => d.y1 ? d.y1 - d.y0 : 0)
            .style('fill', d => d.color)
            .append('title')
            .text(d => `${d.name}\n${d.value}`);

        const linkGroup = this.svg.append('g')
            .selectAll('path')
            .data(links)
            .enter().append('path')
            .attr('class', 'link') // Add class to identify links
            .attr('d', sankeyLinkHorizontal())
            .attr('stroke', d => d.color ? `${d.color}40` : 'black')
            .attr('stroke-width', d => Math.max(1, d.width ?? 0))
            .attr('fill', 'none');

        const textGroup = this.svg.append('g')
            .selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .attr("x", d => (d.x0 < width / 2) ? d.x1 + 6 : d.x0 - 6)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .style("fill", d => d.color)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => (d.x0 < width / 2) ? "start" : "end")
            .text(d => d.name)
            .style("fill", d => d.color);
    }



}
