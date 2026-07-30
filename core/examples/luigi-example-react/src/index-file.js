import { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router';
import { addInitListener } from '@luigi-project/client';

import Home from './views/home.js';
import Sample1 from './views/sample1.js';
import Sample2 from './views/sample2.js';
import './index.css';

class App extends Component {
  constructor(props) {
    super(props);
    addInitListener(() => {
      console.log('Luigi Client initialized.');
    });
  }
  render() {
    return (
      <HashRouter>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/sample1" element={<Sample1 />} />
          <Route path="/sample2" element={<Sample2 />} />
        </Routes>
      </HashRouter>
    );
  }
}

const root = createRoot(document.getElementById('root'));

root.render(<App />);
