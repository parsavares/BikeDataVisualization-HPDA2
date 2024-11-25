// src/components/scatterplot/ScatterPlotContainer.js
import './ScatterPlot.css';
import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ScatterPlotD3 from './ScatterPlotD3';
import { updateSelectedIndices } from '../../redux/DataSetSlice';

function ScatterPlotContainer() {
  const data = useSelector((state) => state.dataSet.data);
  const selectedIndices = useSelector((state) => state.dataSet.selectedIndices);
  const xAttribute = useSelector((state) => state.dataSet.xAttribute);
  const yAttribute = useSelector((state) => state.dataSet.yAttribute);
  const dispatch = useDispatch();
  const chartRef = useRef();
  const scatterPlot = useRef();

  useEffect(() => {
    // Initialize ScatterPlotD3
    scatterPlot.current = new ScatterPlotD3(chartRef.current, (selected) => {
      dispatch(updateSelectedIndices(selected));
    });

    // Cleanup on unmount
    return () => {
      scatterPlot.current.destroy();
    };
  }, [dispatch]);

  useEffect(() => {
    // Update scatterplot when data, attributes, or selection changes
    if (scatterPlot.current && data.length > 0) {
      scatterPlot.current.update(data, xAttribute, yAttribute, selectedIndices);
    }
  }, [data, xAttribute, yAttribute, selectedIndices]);

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '500px' }}
      className="scatterplot-container"
    ></div>
  );
}

export default ScatterPlotContainer;
