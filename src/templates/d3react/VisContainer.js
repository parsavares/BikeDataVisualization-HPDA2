// src/templates/d3react/VisContainer.js

// Corrected the import statement to import './Vis.css'
import './Vis.css';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import VisD3 from './Vis-d3';
import { updateSelectedIndices } from '../../redux/DataSetSlice';

function VisContainer() {
  // Access data and selected indices from the Redux store
  const dataSet = useSelector(state => state.dataSet.data);
  const selectedIndices = useSelector(state => state.dataSet.selectedIndices);
  const dispatch = useDispatch();

  // References to the container div and VisD3 instance
  const divContainerRef = useRef(null);
  const visD3Ref = useRef(null);

  // Function to get the size of the chart
  const getChartSize = () => {
    let width = 800;
    let height = 600;
    if (divContainerRef.current) {
      width = divContainerRef.current.offsetWidth || width;
      height = divContainerRef.current.offsetHeight || height;
    }
    return { width, height };
  };

  // useEffect to initialize the D3 visualization (componentDidMount)
  useEffect(() => {
    console.log('VisContainer mounted');
    const visD3 = new VisD3(divContainerRef.current);
    visD3.create({ size: getChartSize() });
    visD3Ref.current = visD3;

    // Cleanup function (componentWillUnmount)
    return () => {
      console.log('VisContainer unmounting...');
      visD3.clear();
    };
  }, []);

  // useEffect to update the visualization when data or selection changes (componentDidUpdate)
  useEffect(() => {
    console.log('VisContainer updating visualization...');
    const visD3 = visD3Ref.current;

    // Controller methods to handle interactions
    const handleBrush = (selectedIndices) => {
      // Dispatch action to update selected indices in the Redux store
      dispatch(updateSelectedIndices(selectedIndices));
    };

    const isSelected = (index) => {
      // Determine if a data point is selected
      return selectedIndices.length === 0 || selectedIndices.includes(index);
    };

    const isSelectedHour = (hour) => {
      // Determine if any selected data point corresponds to the given hour
      if (selectedIndices.length === 0) return true;
      const selectedData = dataSet.filter(d => selectedIndices.includes(d.index));
      return selectedData.some(d => d.Hour === hour);
    };

    const controllerMethods = {
      handleBrush,
      isSelected,
      isSelectedHour,
    };

    visD3.renderVis(dataSet, controllerMethods);
  }, [dataSet, selectedIndices, dispatch]);

  return (
    <div ref={divContainerRef} className="visDivContainer">
      {/* The D3 visualization will be rendered inside this div */}
    </div>
  );
}

export default VisContainer;
