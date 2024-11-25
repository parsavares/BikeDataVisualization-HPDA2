// src/App.js
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSeoulBikeData } from './redux/DataSetSlice';
import ScatterPlotContainer from './components/scatterplot/ScatterPlotContainer';
import HistogramContainer from './components/histogram/HistogramContainer';
import ControlBar from './components/controlbar/ControlBar';
import LegendD3 from './components/legend/LegendD3'; // Import LegendD3
import './App.css';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch and load data on component mount
    dispatch(getSeoulBikeData());
  }, [dispatch]);

  return (
    <div className="App">
      <h1>Seoul Bike Data Visualizations</h1>
      <ControlBar />
      <LegendD3 /> {/* Include the Legend component */}
      <div className="visualization-container">
        <ScatterPlotContainer />
        <HistogramContainer />
      </div>
    </div>
  );
}

export default App;
