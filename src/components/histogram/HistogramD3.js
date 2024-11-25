// src/components/histogram/HistogramD3.js
import * as d3 from 'd3';

class HistogramD3 {
  constructor(element, onBrushEnd) {
    this.element = element;
    this.onBrushEnd = onBrushEnd;

    // Set up margins and dimensions
    this.margin = { top: 20, right: 20, bottom: 50, left: 50 };
    this.width = element.clientWidth - this.margin.left - this.margin.right;
    this.height = element.clientHeight - this.margin.top - this.margin.bottom;

    // Create the SVG element
    this.svg = d3
      .select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${element.clientWidth} ${element.clientHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create the plot area
    this.plotArea = this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Initialize axes
    this.xAxisGroup = this.plotArea
      .append('g')
      .attr('transform', `translate(0,${this.height})`);
    this.yAxisGroup = this.plotArea.append('g');

    // Initialize brush
    this.brush = d3
      .brushX()
      .extent([
        [0, 0],
        [this.width, this.height],
      ])
      .on('end', (event) => this.brushed(event));

    // Append brush to the plot area
    this.brushGroup = this.plotArea.append('g').attr('class', 'brush');
    this.brushGroup.call(this.brush);

    // Apply distinct styling to the brush selection and handles for better visibility
    this.brushGroup.selectAll(".selection")
      .attr("stroke", "#ff8c00") // Edge color for brush to make it stand out
      .attr("stroke-width", 2);  // Width for better visibility

    this.brushGroup.selectAll(".handle")
      .attr("fill", "#ffa500")   // Handle color for better visibility
      .attr("stroke", "#333")    // Add dark outline for enhanced visibility
      .attr("stroke-width", 1.5);
  }

  update(data, attribute, selectedIndices) {
    this.data = data;
    this.attribute = attribute;
    this.selectedIndices = selectedIndices;

    const isCategorical = typeof data[0][attribute] === 'string';

    if (isCategorical) {
      // Handle categorical data as a bar chart
      const counts = d3.rollup(
        data,
        (v) => v.length,
        (d) => d[attribute]
      );

      const categories = Array.from(counts.keys());

      // Set up scales
      this.xScale = d3.scaleBand().domain(categories).range([0, this.width]).padding(0.1);
      this.yScale = d3.scaleLinear().domain([0, d3.max(counts.values())]).range([this.height, 0]);

      // Update axes
      this.xAxisGroup.call(d3.axisBottom(this.xScale));
      this.yAxisGroup.call(d3.axisLeft(this.yScale));

      // Add X and Y axis labels
      this.addAxisLabels(attribute, 'Frequency');

      // Bind data to bars
      const bars = this.plotArea.selectAll('.bar').data(Array.from(counts.entries()), (d) => d[0]);

      // Enter new bars
      bars
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => this.xScale(d[0]))
        .attr('y', (d) => this.yScale(d[1]))
        .attr('width', this.xScale.bandwidth())
        .attr('height', (d) => this.height - this.yScale(d[1]))
        .attr('fill', (d) =>
          this.isCategorySelected(d[0]) ? '#FF6347' : '#4682B4'
        );

      // Update existing bars
      bars
        .attr('x', (d) => this.xScale(d[0]))
        .attr('y', (d) => this.yScale(d[1]))
        .attr('width', this.xScale.bandwidth())
        .attr('height', (d) => this.height - this.yScale(d[1]))
        .attr('fill', (d) =>
          this.isCategorySelected(d[0]) ? '#FF6347' : '#4682B4'
        );

      // Remove exiting bars
      bars.exit().remove();
    } else {
      // Handle numerical data as a histogram
      const histogram = d3
        .histogram()
        .value((d) => d[attribute])
        .domain(d3.extent(data, (d) => d[attribute]))
        .thresholds(20);

      const bins = histogram(data);

      // Update scales
      this.xScale = d3.scaleLinear().domain([bins[0].x0, bins[bins.length - 1].x1]).range([0, this.width]);
      this.yScale = d3.scaleLinear().domain([0, d3.max(bins, (d) => d.length)]).range([this.height, 0]);

      // Update axes
      this.xAxisGroup.call(d3.axisBottom(this.xScale));
      this.yAxisGroup.call(d3.axisLeft(this.yScale));

      // Add X and Y axis labels
      this.addAxisLabels(attribute, 'Frequency');

      // Bind data to bars
      const bars = this.plotArea.selectAll('.bar').data(bins);

      // Enter new bars
      bars
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => this.xScale(d.x0))
        .attr('y', (d) => this.yScale(d.length))
        .attr('width', (d) => this.xScale(d.x1) - this.xScale(d.x0) - 1)
        .attr('height', (d) => this.height - this.yScale(d.length))
        .attr('fill', (d) =>
          this.isBinSelected(d) ? '#FF6347' : '#4682B4'
        );

      // Update existing bars
      bars
        .attr('x', (d) => this.xScale(d.x0))
        .attr('y', (d) => this.yScale(d.length))
        .attr('width', (d) => this.xScale(d.x1) - this.xScale(d.x0) - 1)
        .attr('height', (d) => this.height - this.yScale(d.length))
        .attr('fill', (d) =>
          this.isBinSelected(d) ? '#FF6347' : '#4682B4'
        );

      // Remove exiting bars
      bars.exit().remove();
    }

    // Re-apply the brush to maintain brush state
    this.brushGroup.call(this.brush);
  }

  // Add axis labels for X and Y
  addAxisLabels(xAttribute, yLabel) {
    this.svg.selectAll('.x-axis-label').remove();
    this.svg
      .append('text')
      .attr('class', 'x-axis-label')
      .attr('x', this.width / 2 + this.margin.left)
      .attr('y', this.height + this.margin.top + 50)
      .style('text-anchor', 'middle')
      .text(xAttribute)
      .style('font-size', '16px')
      .style('font-weight', 'bold');

    this.svg.selectAll('.y-axis-label').remove();
    this.svg
      .append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2 - this.margin.top)
      .attr('y', this.margin.left - 50)
      .style('text-anchor', 'middle')
      .text(yLabel)
      .style('font-size', '16px')
      .style('font-weight', 'bold');
  }

  brushed(event) {
    if (!event.selection) {
      this.onBrushEnd([]);
      return;
    }

    const [x0, x1] = event.selection.map(this.xScale.invert);

    // Find selected items based on brushing range
    const selected = this.data
      .filter((d) => {
        const x = d[this.attribute];
        return typeof x === 'number' ? (x0 <= x && x <= x1) : false;
      })
      .map((d) => d.index);

    this.onBrushEnd(selected);
  }

  isCategorySelected(category) {
    if (!this.selectedIndices.length) return false;

    return this.data
      .filter((d) => d[this.attribute] === category)
      .some((d) => this.selectedIndices.includes(d.index));
  }

  isBinSelected(bin) {
    if (!this.selectedIndices.length) return false;

    return bin.some((d) => this.selectedIndices.includes(d.index));
  }

  destroy() {
    this.svg.remove();
  }
}

export default HistogramD3;
