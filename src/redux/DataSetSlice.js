// src/redux/DataSetSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Papa from 'papaparse';

// Async thunk to fetch and parse the data
export const getSeoulBikeData = createAsyncThunk('dataSet/fetchData', async () => {
  const response = await fetch('data/SeoulBikeData.csv');
  const responseText = await response.text();
  const parsedData = Papa.parse(responseText, { header: true, dynamicTyping: true });

  // Map parsed data to add indices
  const data = parsedData.data.map((item, i) => ({ ...item, index: i }));

  // Identify numerical and categorical attributes
  const sample = data[0];
  const numericalAttributes = [];
  const categoricalAttributes = [];

  Object.keys(sample).forEach((key) => {
    if (key === 'index') return;
    if (typeof sample[key] === 'number') {
      numericalAttributes.push(key);
    } else {
      categoricalAttributes.push(key);
    }
  });

  return { data, numericalAttributes, categoricalAttributes };
});

const dataSetSlice = createSlice({
  name: 'dataSet',
  initialState: {
    data: [],
    selectedIndices: [],
    xAttribute: 'Temperature',
    yAttribute: 'Humidity',
    histogramAttribute: 'RentedBikeCount',
    numericalAttributes: [],
    categoricalAttributes: [],
  },
  reducers: {
    // Reducer to update selected indices
    updateSelectedIndices: (state, action) => {
      state.selectedIndices = action.payload;
    },
    // Reducer to update the x attribute
    updateXAttribute: (state, action) => {
      state.xAttribute = action.payload;
    },
    // Reducer to update the y attribute
    updateYAttribute: (state, action) => {
      state.yAttribute = action.payload;
    },
    // Reducer to update the histogram attribute
    updateHistogramAttribute: (state, action) => {
      state.histogramAttribute = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getSeoulBikeData.fulfilled, (state, action) => {
      const { data, numericalAttributes, categoricalAttributes } = action.payload;
      state.data = data;
      state.numericalAttributes = numericalAttributes;
      state.categoricalAttributes = categoricalAttributes;
    });
  },
});

export const {
  updateSelectedIndices,
  updateXAttribute,
  updateYAttribute,
  updateHistogramAttribute,
} = dataSetSlice.actions;
export default dataSetSlice.reducer;
