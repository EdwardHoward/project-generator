import { Action } from "./actions";
import { combineReducers } from 'redux';

const counter = (state = { count: 0 }, action) => {
   switch(action.type){
      case Action.INCREMENT_COUNTER:
         return { count: state.count + action.value };
      default:
         return state;
   }
}

export default combineReducers({
   counter
});