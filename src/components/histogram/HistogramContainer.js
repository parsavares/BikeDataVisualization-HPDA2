// src/components/histogram/HistogramContainer.js
import './Histogram.css';
import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import HistogramD3 from './HistogramD3';
import { updateSelectedIndices } from '../../redux/DataSetSlice';

function HistogramContainer() {
  const data = useSelector((state) => state.dataSet.data);
  const selectedIndices = useSelector((state) => state.dataSet.selectedIndices);
  const histogramAttribute = useSelector((state) => state.dataSet.histogramAttribute);
  const dispatch = useDispatch();
  const chartRef = useRef();
  const histogram = useRef();

  useEffect(() => {
    // Initialize HistogramD3
    histogram.current = new HistogramD3(chartRef.current, (selected) => {
      dispatch(updateSelectedIndices(selected));
    });

    // Cleanup on unmount
    return () => {
      histogram.current.destroy();
    };
  }, [dispatch]);

  useEffect(() => {
    // Update histogram when data or attribute changes
    if (histogram.current && data.length > 0) {
      histogram.current.update(data, histogramAttribute, selectedIndices);
    }
  }, [data, histogramAttribute, selectedIndices]);

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '500px' }}
      className="histogram-container"
    ></div>
  );
}

export default HistogramContainer;
