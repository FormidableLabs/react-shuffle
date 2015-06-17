#react-shuffle

Animated shuffling of child components

###Install

```
npm install react-shuffle
```

###Example
```javascript
'use strict';

var React = require('react');

var Shuffle = require('react-shuffle');

const App = React.createClass({
  render() {
    return (
      <Shuffle>
       {this.renderChildren()}
      </Shuffle>
    )
  }
});

module.exports = App;
