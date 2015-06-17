#react-shuffle

Animated shuffling of child components

###Install

```
npm install react-shuffle
```

###Preview

![http://i.imgur.com/B1RFfvj.gif](http://i.imgur.com/B1RFfvj.gif)

### Usage

Simply wrap child components with this component and dynamically change them to see them animate. The only real requirement is that each child has a non-index based key, for proper position identification.

### Props

| Prop | PropType | Description |
| ---- | -------- | ----------- |
| duration | React.PropTypes.number | Duration of animation |
| fade | React.PropTypes.bool | Should children fade on enter/leave |
| scale | React.PropTypes.bool | Should children scale on enter/leave |
| intial | React.PropTypes.bool | Should scale/fade occur on first load |

###Example
```javascript
'use strict';

var React = require('react');

var Shuffle = require('react-shuffle');

const App = React.createClass({
  render() {
    return (
      <Shuffle>
       {// Method to render children goes here}
      </Shuffle>
    )
  }
});

module.exports = App;

```

### Shout out

react-shuffle is heavily inspired by Ryan Florences Magic Move demo https://youtu.be/z5e7kWSHWTg
