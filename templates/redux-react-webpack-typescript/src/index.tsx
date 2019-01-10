import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import reducers from './redux/reducers';
import Example from './components/Example';

import './style';


const store = createStore(reducers);

ReactDOM.render(
   <Provider store={store}>
      <Example />
   </Provider>, 
   document.getElementById('root')
);