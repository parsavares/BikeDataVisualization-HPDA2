// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import dataSetReducer from './redux/DataSetSlice';

const store = configureStore({
  reducer: {
    dataSet: dataSetReducer,
  },
});

export default store;
