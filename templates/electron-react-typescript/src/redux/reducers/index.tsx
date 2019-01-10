import { combineReducers } from 'redux';
import { Actions } from "../actions";

const reducer = (state = [], action) => {
   switch(action.type){
      default:
         return state;
   }
}

export default combineReducers({reducer});