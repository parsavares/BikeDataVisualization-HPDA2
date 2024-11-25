// src/components/scatterplot/ScatterPlotD3.js
import * as d3 from 'd3';

class ScatterPlotD3 {
  constructor(element, onBrushEnd) {
    this.element = element;
    this.onBrushEnd = onBrushEnd;

    // Set up margins and dimensions
    this.margin = { top: 20, right: 30, bottom: 60, left: 60 };
    this.width = element.clientWidth - this.margin.left - this.margin.right;
    this.height = element.clientHeight - this.margin.top - this.margin.bottom;

    // Create the SVG element and set the dimensions
    this.svg = d3
      .select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${element.clientWidth} ${element.clientHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create the plot area inside the margins
    this.plotArea = this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Initialize axes for future rendering
    this.xAxisGroup = this.plotArea
      .append('g')
      .attr('transform', `translate(0,${this.height})`);
    this.yAxisGroup = this.plotArea.append('g');

    // Initialize brush with debounce for better performance on large datasets
    this.brush = d3
      .brush()
      .extent([
        [0, 0],
        [this.width, this.height],
      ])
      .on('end', (event) => this.debounceBrush(event));

    // Append the brush area to the plot area
    this.brushGroup = this.plotArea.append('g').attr('class', 'brush');
    this.brushGroup.call(this.brush);

    // Debounce function to limit frequency of brush event calls
    this.debounceBrush = this.debounce((event) => this.brushed(event), 100);
  }

  // Debounce function to prevent excessive function calls (improves performance)
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Function to update the scatterplot visualization based on new data and attributes
  update(data, xAttribute, yAttribute, selectedIndices) {
    this.data = data;
    this.xAttribute = xAttribute;
    this.yAttribute = yAttribute;
    this.selectedIndices = selectedIndices;

    // Determine if attributes are categorical or numerical
    const isXCategorical = typeof data[0][xAttribute] === 'string';
    const isYCategorical = typeof data[0][yAttribute] === 'string';

    // Define scales based on attribute types
    this.xScale = isXCategorical
      ? d3.scaleBand().domain(data.map((d) => d[xAttribute])).range([0, this.width]).padding(0.1)
      : d3.scaleLinear().domain(d3.extent(data, (d) => d[xAttribute])).range([0, this.width]).nice();

    this.yScale = isYCategorical
      ? d3.scaleBand().domain(data.map((d) => d[yAttribute])).range([this.height, 0]).padding(0.1)
      : d3.scaleLinear().domain(d3.extent(data, (d) => d[yAttribute])).range([this.height, 0]).nice();

    // Update the axes with smooth transitions for better visuals
    this.xAxisGroup
      .transition()
      .duration(500)
      .call(isXCategorical ? d3.axisBottom(this.xScale) : d3.axisBottom(this.xScale).tickSize(-this.height));

    this.yAxisGroup
      .transition()
      .duration(500)
      .call(isYCategorical ? d3.axisLeft(this.yScale) : d3.axisLeft(this.yScale).tickSize(-this.width));

    // Add descriptive axis labels with tooltips
    this.addAxisLabels(xAttribute, yAttribute);

    // Bind data to circles in the scatterplot
    const circles = this.plotArea.selectAll('circle').data(data, (d) => d.index);

    // Add new circles to the plot
    circles
      .enter()
      .append('circle')
      .attr('cx', (d) => (isXCategorical ? this.xScale(d[xAttribute]) + this.xScale.bandwidth() / 2 : this.xScale(d[xAttribute])))
      .attr('cy', (d) => (isYCategorical ? this.yScale(d[yAttribute]) + this.yScale.bandwidth() / 2 : this.yScale(d[yAttribute])))
      .attr('r', 4)
      .attr('fill', (d) => (selectedIndices.includes(d.index) ? '#FF6347' : '#4682B4')) // Different color for selected vs unselected
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .style('opacity', (d) => (selectedIndices.includes(d.index) ? 1 : 0.6))
      .style('transition', 'all 0.3s ease')
      .on('mouseover', (event, d) => this.handleMouseOver(event, d)) // Handle mouseover to show tooltip
      .on('mouseout', (event) => this.handleMouseOut(event)); // Handle mouseout to hide tooltip

    // Update existing circles based on new data
    circles
      .attr('cx', (d) => (isXCategorical ? this.xScale(d[xAttribute]) + this.xScale.bandwidth() / 2 : this.xScale(d[xAttribute])))
      .attr('cy', (d) => (isYCategorical ? this.yScale(d[yAttribute]) + this.yScale.bandwidth() / 2 : this.yScale(d[yAttribute])))
      .attr('fill', (d) => (selectedIndices.includes(d.index) ? '#FF6347' : '#4682B4'))
      .style('opacity', (d) => (selectedIndices.includes(d.index) ? 1 : 0.6));

    // Remove circles that are no longer needed
    circles.exit().remove();
  }

  // Function to handle the brushing action and determine selected points
  brushed(event) {
    if (!event.selection) {
      this.onBrushEnd([]);
      return;
    }

    const [[x0, y0], [x1, y1]] = event.selection;

    // Determine which points are within the brushed area
    const selected = this.data
      .filter((d) => {
        const x = this.xScale(d[this.xAttribute]);
        const y = this.yScale(d[this.yAttribute]);
        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
      })
      .map((d) => d.index);

    // Callback to update selected indices in the Redux store
    this.onBrushEnd(selected);
  }

  // Add axis labels with tooltips for better user understanding
  addAxisLabels(xAttribute, yAttribute) {
    this.svg.selectAll('.x-axis-label').remove();
    this.svg
      .append('text')
      .attr('class', 'x-axis-label')
      .attr('x', this.width / 2 + this.margin.left)
      .attr('y', this.height + this.margin.top + 40)
      .style('text-anchor', 'middle')
      .text(xAttribute)
      .style('font-size', '14px');

    this.svg.selectAll('.y-axis-label').remove();
    this.svg
      .append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2 - this.margin.top)
      .attr('y', this.margin.left - 50)
      .style('text-anchor', 'middle')
      .text(yAttribute)
      .style('font-size', '14px');
  }

  // Handle mouseover to show tooltip with data point information
  handleMouseOver(event, d) {
    d3.select(event.currentTarget)
      .transition()
      .duration(200)
      .attr('r', 6)
      .attr('stroke-width', 2);

    // Append a tooltip to the container
    d3.select(this.element)
      .append('div')
      .attr('class', 'tooltip')
      .style('left', `${event.pageX}px`)
      .style('top', `${event.pageY - 28}px`)
      .html(`<strong>Index:</strong> ${d.index}<br><strong>${this.xAttribute}:</strong> ${d[this.xAttribute]}<br><strong>${this.yAttribute}:</strong> ${d[this.yAttribute]}`);
  }

  // Handle mouseout to hide tooltip
  handleMouseOut(event) {
    d3.select(event.currentTarget)
      .transition()
      .duration(200)
      .attr('r', 4)
      .attr('stroke-width', 0.5);

    // Remove tooltip
    d3.select(this.element).select('.tooltip').remove();
  }

  // Clean up the SVG element to prevent memory leaks
  destroy() {
    this.svg.remove();
  }
}

export default ScatterPlotD3;
