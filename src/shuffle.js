/* eslint no-unused-vars:0 */
/*global window, document, getComputedStyle*/

import React from 'react';
import ReactDom from 'react-dom';
import assign from 'object-assign';
import tweenState from 'react-tween-state';
import ReactTransitionGroup from 'react-addons-transition-group';

const Clones = React.createClass({
  displayName: 'ShuffleClones',

  _childrenWithPositions() {
    let children = [];
    React.Children.forEach(this.props.children, (child) => {
      let style = this.props.positions[child.key];
      let key = child.key;
      children.push(<Clone
        child={child}
        style={style}
        key={key}
        initial={this.props.initial}
        fade={this.props.fade}
        scale={this.props.scale}
        duration={this.props.duration}/>);
    });
    return children.sort((a, b) =>
      (a.key < b.key) ? -1 : (a.key > b.key) ? 1 : 0
    );
  },

  render() {
    return (
      <div className="ShuffleClones">
        <ReactTransitionGroup>
          {this._childrenWithPositions()}
        </ReactTransitionGroup>
      </div>
    );
  }
});

const Clone = React.createClass({
  mixins: [tweenState.Mixin],
  displayName: 'ShuffleClone',
  getInitialState() {
    return {
      top: this.props.style ? this.props.style.top : 0,
      left: this.props.style ? this.props.style.left : 0,
      opacity: 1,
      transform: 1
    }
  },
  componentWillAppear(cb) {
    this.tweenState('opacity', {
      easing: tweenState.easingTypes.easeOutSine,
      duration: this.props.duration,
      beginValue: this.props.initial ? 0 : 1,
      endValue: 1,
      onEnd: cb
    });
  },
  componentWillEnter(cb) {
    this.tweenState('opacity', {
      easing: tweenState.easingTypes.easeOutSine,
      duration: this.props.duration,
      beginValue: 0,
      endValue: 1,
      onEnd: cb
    });
  },
  componentWillLeave(cb) {
    this.tweenState('opacity', {
      easing: tweenState.easingTypes.easeOutSine,
      duration: this.props.duration,
      endValue: 0,
      onEnd: () => {
        try {
          cb()
        } catch (e) {
          // This try catch handles component umounting jumping the gun
        }
      }
    });
  },
  componentWillReceiveProps(nextProps) {
    this.tweenState('top', {
      easing: tweenState.easingTypes.easeOutSine,
      duration: nextProps.duration,
      endValue: nextProps.style.top
    });
    this.tweenState('left', {
      easing: tweenState.easingTypes.easeOutSine,
      duration: nextProps.duration,
      endValue: nextProps.style.left
    });
  },
  render() {
    let style = {};
    if (this.props.style) {
      style = {
        top: this.getTweeningValue('top'),
        left: this.getTweeningValue('left'),
        opacity: this.props.fade ? this.getTweeningValue('opacity') : 1,
        transform: this.props.scale ? 'scale(' + this.getTweeningValue('opacity') + ')' : 0,
        transformOrigin: 'center center',
        width: this.props.style.width,
        height: this.props.style.height,
        position: this.props.style.position
      };
    }
    let key = this.props.key;
    return (
      React.cloneElement(this.props.child, {style, key})
    )
  }
})

const Shuffle = React.createClass({

  displayName: 'Shuffle',

  propTypes: {
    duration: React.PropTypes.number,
    scale: React.PropTypes.bool,
    fade: React.PropTypes.bool,
    initial: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      duration: 300,
      scale: true,
      fade: true,
      initial: false
    }
  },

  getInitialState() {
    return {
      animating: false,
      ready: false
    };
  },

  componentDidMount() {
    this._makePortal();
    window.addEventListener('resize', this._renderClonesInitially);
  },

  componentWillUnmount() {
    ReactDom.unmountComponentAtNode(this._portalNode);
    ReactDom.findDOMNode(this.refs.container).removeChild(this._portalNode);
    window.removeEventListener('resize', this._renderClonesInitially);
  },

  componentWillReceiveProps(nextProps) {
    this._startAnimation(nextProps);
  },

  componentDidUpdate(prevProps) {
    if (this.state.ready === false) {
      this.setState({ready: true}, () => {
        this._renderClonesInitially();
      });
    } else {
      this._renderClonesToNewPositions(this.props);
    }
  },

  _makePortal() {
    this._portalNode = document.createElement('div');
    this._portalNode.style.left = '0px';
    this._portalNode.style.top = '0px';
    this._portalNode.style.position = 'absolute';
    ReactDom.findDOMNode(this.refs.container).appendChild(this._portalNode);
  },

  _addTransitionEndEvent() {
    setTimeout(this._finishAnimation, this.props.duration);
  },

  _startAnimation(nextProps) {
    if (this.state.animating) {
      return;
    }

    let cloneProps = assign({}, nextProps, {
      positions: this._getPositions(),
      initial: this.props.initial,
      fade: this.props.fade,
      scale: this.props.scale,
      duration: this.props.duration
    });
    this._renderClones(cloneProps, () => {
      this._addTransitionEndEvent();
      this.setState({animating: true});
    });
  },

  _renderClonesToNewPositions(props) {
    let cloneProps = assign({}, props, {
      positions: this._getPositions(),
      initial: this.props.initial,
      fade: this.props.fade,
      scale: this.props.scale,
      duration: this.props.duration
    });
    this._renderClones(cloneProps);
  },

  _finishAnimation() {
    this.setState({animating: false});
  },

  _getPositions() {
    let positions = {};
    React.Children.forEach(this.props.children, (child) => {
      let ref = child.key;
      let node = ReactDom.findDOMNode(this.refs[ref]);
      let rect = node.getBoundingClientRect();
      let computedStyle = getComputedStyle(node);
      let marginTop = parseInt(computedStyle.marginTop, 10);
      let marginLeft = parseInt(computedStyle.marginLeft, 10);
      let position = {
        top: (node.offsetTop - marginTop),
        left: (node.offsetLeft - marginLeft),
        width: rect.width,
        height: rect.height,
        position: 'absolute',
        opacity: 1
      };
      positions[ref] = position;
    });
    return positions;
  },

  _renderClonesInitially() {
    let cloneProps = assign({}, this.props, {
      positions: this._getPositions(),
      initial: this.props.initial,
      fade: this.props.fade,
      scale: this.props.scale,
      duration: this.props.duration
    });
    ReactDom.unstable_renderSubtreeIntoContainer(this, <Clones {...cloneProps}/>, this._portalNode);
    this.setState({ready: true});
  },

  _renderClones(props, cb) {
    ReactDom.unstable_renderSubtreeIntoContainer(this, <Clones {...props}/>, this._portalNode, cb);
  },

  _childrenWithRefs() {
    return React.Children.map(this.props.children, (child) =>
      React.cloneElement(child, {ref: child.key})
    );
  },

  render() {
    let { initial, fade, duration, ...props } = this.props;
    var showContainer = initial ? 0 : 1;
    if (this.state.ready) {
      showContainer = 0;
    }
    return (
      <div ref="container" style={{position: 'relative'}} {...props}>
        <div style={{opacity: showContainer}}>
          {this._childrenWithRefs()}
        </div>
      </div>
    );
  }
});

export default Shuffle;
