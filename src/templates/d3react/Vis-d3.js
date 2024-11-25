// src/templates/d3react/Vis-d3.js

import * as d3 from 'd3';

class VisD3 {
    constructor(el) {
        this.el = el;
    }

    create(config) {
        this.size = { width: config.size.width, height: config.size.height };

        // Define margins
        this.margin = { top: 20, right: 20, bottom: 50, left: 60 };
        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = (this.size.height / 2) - this.margin.top - this.margin.bottom;

        // Create SVG container
        this.svg = d3.select(this.el).append('svg')
            .attr('width', this.size.width)
            .attr('height', this.size.height);

        // Create group for scatterplot
        this.scatterplot = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        // Create group for second visualization (e.g., bar chart)
        this.barChart = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.height + this.margin.top * 3})`);

        // Initialize scales for scatterplot
        this.xScale = d3.scaleLinear().range([0, this.width]);
        this.yScale = d3.scaleLinear().range([this.height, 0]);

        // Initialize axes for scatterplot
        this.xAxis = this.scatterplot.append('g')
            .attr('transform', `translate(0, ${this.height})`);
        this.yAxis = this.scatterplot.append('g');

        // Initialize brush for scatterplot
        this.brush = d3.brush()
            .extent([[0, 0], [this.width, this.height]])
            .on('brush end', this.brushed.bind(this));

        // Append brush to scatterplot
        this.scatterplot.append('g')
            .attr('class', 'brush')
            .call(this.brush);

        // Initialize scales for bar chart
        this.xScaleBar = d3.scaleBand().range([0, this.width]).padding(0.1);
        this.yScaleBar = d3.scaleLinear().range([this.height, 0]);

        // Initialize axes for bar chart
        this.xAxisBar = this.barChart.append('g')
            .attr('transform', `translate(0, ${this.height})`);
        this.yAxisBar = this.barChart.append('g');

        // Initialize brush for bar chart
        this.brushBar = d3.brushX()
            .extent([[0, 0], [this.width, this.height]])
            .on('brush end', this.brushedBar.bind(this));

        // Append brush to bar chart
        this.barChart.append('g')
            .attr('class', 'brush')
            .call(this.brushBar);
    }

    // Function to handle brushing on scatterplot
    brushed(event) {
        const { selection } = event;
        if (selection) {
            const [[x0, y0], [x1, y1]] = selection;
            const selectedIndices = this.data
                .filter(d => {
                    const x = this.xScale(d.Temperature);
                    const y = this.yScale(d.RentedBikeCount);
                    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
                })
                .map(d => d.index);
            this.controllerMethods.handleBrush(selectedIndices);
        } else {
            // Clear selection
            this.controllerMethods.handleBrush([]);
        }
    }

    // Function to handle brushing on bar chart
    brushedBar(event) {
        const { selection } = event;
        if (selection) {
            const [x0, x1] = selection;
            const selectedHours = this.xScaleBar.domain().filter(hour => {
                const x = this.xScaleBar(hour) + this.xScaleBar.bandwidth() / 2;
                return x0 <= x && x <= x1;
            });
            const selectedIndices = this.data
                .filter(d => selectedHours.includes(d.Hour))
                .map(d => d.index);
            this.controllerMethods.handleBrush(selectedIndices);
        } else {
            // Clear selection
            this.controllerMethods.handleBrush([]);
        }
    }

    renderVis(data, controllerMethods) {
        this.data = data;
        this.controllerMethods = controllerMethods;

        /*** Scatterplot ***/

        // Set domains for scatterplot scales
        this.xScale.domain(d3.extent(data, d => d.Temperature));
        this.yScale.domain(d3.extent(data, d => d.RentedBikeCount));

        // Update scatterplot axes
        this.xAxis.call(d3.axisBottom(this.xScale));
        this.yAxis.call(d3.axisLeft(this.yScale));

        // Bind data to scatterplot circles
        const circles = this.scatterplot.selectAll('.data-point')
            .data(data, d => d.index);

        // Enter, update, and exit for scatterplot circles
        circles.enter().append('circle')
            .attr('class', 'data-point')
            .attr('r', 3)
            .attr('cx', d => this.xScale(d.Temperature))
            .attr('cy', d => this.yScale(d.RentedBikeCount))
            .style('fill', 'steelblue')
            .merge(circles)
            .attr('opacity', d => controllerMethods.isSelected(d.index) ? 1 : 0.3);

        circles.exit().remove();

        /*** Bar Chart ***/

        // Aggregate data by Hour
        const dataByHour = d3.rollups(
            data,
            v => d3.sum(v, d => d.RentedBikeCount),
            d => d.Hour
        ).map(([key, value]) => ({ Hour: key, TotalRented: value }));

        // Sort data by Hour
        dataByHour.sort((a, b) => a.Hour - b.Hour);

        // Set domains for bar chart scales
        this.xScaleBar.domain(dataByHour.map(d => d.Hour));
        this.yScaleBar.domain([0, d3.max(dataByHour, d => d.TotalRented)]);

        // Update bar chart axes
        this.xAxisBar.call(d3.axisBottom(this.xScaleBar));
        this.yAxisBar.call(d3.axisLeft(this.yScaleBar));

        // Bind data to bar chart bars
        const bars = this.barChart.selectAll('.bar')
            .data(dataByHour, d => d.Hour);

        // Enter, update, and exit for bar chart bars
        bars.enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => this.xScaleBar(d.Hour))
            .attr('y', d => this.yScaleBar(d.TotalRented))
            .attr('width', this.xScaleBar.bandwidth())
            .attr('height', d => this.height - this.yScaleBar(d.TotalRented))
            .style('fill', 'orange')
            .merge(bars)
            .attr('opacity', d => controllerMethods.isSelectedHour(d.Hour) ? 1 : 0.3);

        bars.exit().remove();
    }

    clear() {
        // Clear the visualization
        d3.select(this.el).selectAll('*').remove();
    }
}

export default VisD3;
