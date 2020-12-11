import React from 'react';
import logo from './logo.svg';
import './App.css';
import TestContext from "./testContext"
import TestPortals from "./testPortals"

function App() {
  return (
    <div className="App">
      <TestContext/>
      <TestPortals/>
    </div>
  );
}

export default App;
