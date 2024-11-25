// src/components/controlbar/ControlBar.js
import React from 'react';
import './ControlBar.css';
import { useSelector, useDispatch } from 'react-redux';
import { updateXAttribute, updateYAttribute, updateHistogramAttribute, updateSelectedIndices } from '../../redux/DataSetSlice';

export default function ControlBar() {
  const dispatch = useDispatch();
  const numericalAttributes = useSelector((state) => state.dataSet.numericalAttributes);
  const categoricalAttributes = useSelector((state) => state.dataSet.categoricalAttributes);

  // Handle changes to scatterplot attributes (separate from histogram)
  const handleScatterplotAttributeChange = (e, axis) => {
    if (axis === 'x') {
      dispatch(updateXAttribute(e.target.value));
    } else if (axis === 'y') {
      dispatch(updateYAttribute(e.target.value));
    }
  };

  // Handle changes to the histogram attribute (independent)
  const handleHistogramAttributeChange = (e) => {
    dispatch(updateHistogramAttribute(e.target.value));
  };

  // Handle resetting the brush selection
  const handleResetSelection = () => {
    dispatch(updateSelectedIndices([]));
  };

  return (
    <div className="control-bar">
      <div className="attribute-selection">
        
        {/* Scatterplot Controls */}
        <div className="scatterplot-controls">
          <h4>Scatterplot Attributes</h4>
          <label>X Axis: </label>
          <select onChange={(e) => handleScatterplotAttributeChange(e, 'x')} defaultValue="Temperature">
            {[...numericalAttributes, ...categoricalAttributes].map((attr) => (
              <option key={attr} value={attr}>
                {attr}
              </option>
            ))}
          </select>
          <label> Y Axis: </label>
          <select onChange={(e) => handleScatterplotAttributeChange(e, 'y')} defaultValue="Humidity">
            {[...numericalAttributes, ...categoricalAttributes].map((attr) => (
              <option key={attr} value={attr}>
                {attr}
              </option>
            ))}
          </select>
        </div>

        {/* Histogram Controls */}
        <div className="histogram-controls">
          <h4>Histogram Attribute</h4>
          <label>Attribute (X Axis): </label>
          <select onChange={handleHistogramAttributeChange} defaultValue="RentedBikeCount">
            {[...numericalAttributes, ...categoricalAttributes].map((attr) => (
              <option key={attr} value={attr}>
                {attr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reset Button */}
      <div>
        <button onClick={handleResetSelection} className="reset-button">
          Reset Brush Selection
        </button>
      </div>
    </div>
  );
}
