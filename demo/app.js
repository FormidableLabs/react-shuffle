'use strict';

import React from 'react';
import ReactDom from 'react-dom';
import Shuffle from '../src/Shuffle';

const alphabet = [
  'a','b','c','d','e','f','g','h','i','j','k','l','m',
  'n','o','p','q','r','s','t','u','v','w','x','y','z']

const App = React.createClass({
  getInitialState() {
    return {
      children: alphabet,
      filtered: false
    }
  },
  filterChildren() {
    if (this.state.filtered === false) {
      let newChildren = this.state.children.filter(function(child,index){
        if (index % 2 ===0) {
          return child
        }
      });
      this.setState({
        children: newChildren,
        filtered: true
      });
    } else {
      this.setState({
        children: alphabet,
        filtered: false
      });
    }
  },
  render() {
    return (
      <div className="demo">
        <button type="button" onClick={this.filterChildren}>Filter Children</button>
        <Shuffle duration={500} fade={false}>
          {this.state.children.map(function(letter){
            return (
              <div className="tile" key={letter}>
                <img
                  src={"http://placehold.it/100x100&text=" + letter} />
              </div>
            )
          })}
        </Shuffle>
      </div>
    )
  }
});

const content = document.getElementById('content');

ReactDom.render(<App/>, content)

