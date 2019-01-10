import * as React from 'react';
import { connect } from 'react-redux'
import { addAction } from '../../redux/actions';

export interface ExampleProps {
   add: (val: number) => void;
   count;
}

class Example extends React.Component<ExampleProps, any> {
   onClick = () => {
      this.props.add(1);
   }

   public render() {
      return (
         <div>
            {this.props.count}
            <div>
               <button onClick={this.onClick}>Increment</button>
            </div>
         </div>
      );
   }
}

const mapStateToProps = state => {
   const { counter } = state;

   return {
      count: counter.count
   };
}

const mapDispatchToProps = dispatch => {
   return {
      add: (val: number) => dispatch(addAction(val))
   }
}

export default connect(mapStateToProps, mapDispatchToProps)(Example);
