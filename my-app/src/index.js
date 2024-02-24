import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = createRoot(document.getElementById('root'));
root.render(
  // disabling strict mode as there are 2 api get calls made to backened for each map load 
  //https://stackoverflow.com/questions/73174642/component-making-two-api-calls-from-single-dispatch
  //<React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  //</React.StrictMode>,
);

reportWebVitals();
