# Bike Data Visualization - HPDA Assignment 2

This project is part of the High Performance Data Analytics (HPDA) course at the University of Luxembourg. It provides interactive visualizations for bike-sharing data using React and D3.js.

## Overview

The application contains two synchronized visualizations:
- **Scatterplot** with 2D brushing to explore relationships between variables.
- **Histogram** with a dynamic X-axis and static Y-axis representing frequency to explore data distributions.

The visualizations are linked to highlight selected data in both views simultaneously, making it easy to perform detailed data exploration.

## Features
- **Interactive Brushing**: Select data points in the scatterplot or histogram, with the selection automatically linked to the other visualization.
- **Dynamic Attribute Selection**: Choose different attributes for X and Y axes in the scatterplot, and for the histogram's X-axis.
- **Reset Brush Selection**: Easily reset any selections to explore new insights.

## Installation

To run the project locally, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/parsavares/BikeDataVisualization-HPDA2.git
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Run the application:
    ```bash
    npm start
    ```

## Technology Stack
- **React**: Frontend framework for building reusable UI components.
- **D3.js**: JavaScript library for producing dynamic, interactive data visualizations.
- **Redux**: State management for synchronized visualization interactions.

## Usage

- **Scatterplot**: Select attributes to visualize their correlation and use the brush to focus on specific data ranges.
- **Histogram**: View the frequency distribution of a selected attribute and link it to the scatterplot.

## TODO:
- Non numerical attributes mapping on the brush needs to be fixed from just Histogram to Scatterplot side.

## License

This project is licensed under the MIT License.

## Author

**Parsa Vares**  
University of Luxembourg  
High Performance Data Analytics (HPDA) Course - Assignment 2
[Parsa.vares.001@student.uni.lu](mailto:parsa.vares.001@student.uni.lu)

