/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 */

import GkManager from './GkManager';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

console.log("Applying feature flag overwrites: ", GkManager);

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
