import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Provider } from 'react-redux'
import './style';
import Editor from './Editor';
import reducers from './redux/reducers';
import { createStore } from 'redux';

const store = createStore(reducers);
ReactDOM.render(
   <Provider store={store}>
      <Editor />
   </Provider>,
   document.getElementById('root'));