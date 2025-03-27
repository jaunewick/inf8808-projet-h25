import React from 'react';
import DBReader from '../services/dbReader';

class Test extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null
        };
    }   

    async componentDidMount() {
        const data = await DBReader.getData();
        this.setState({ data });
  }
    
    render() {
        return (
        <div>
            {this.state.data ? (
                <h1>Data loaded</h1>
            ) : (
                <h1>Data not loaded</h1>
            )}
        </div>
        );
    }
}

export default Test;