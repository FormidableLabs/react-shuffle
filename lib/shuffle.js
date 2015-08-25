'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
/* eslint no-unused-vars:0 */
/*global window, document, getComputedStyle*/

var _React = require('react/addons');

var _React2 = _interopRequireWildcard(_React);

var _cloneWithProps = require('react/lib/cloneWithProps');

var _cloneWithProps2 = _interopRequireWildcard(_cloneWithProps);

var _assign = require('object-assign');

var _assign2 = _interopRequireWildcard(_assign);

var _tweenState = require('react-tween-state');

var _tweenState2 = _interopRequireWildcard(_tweenState);

var ReactTransitionGroup = _React2['default'].addons.TransitionGroup;

var Clones = _React2['default'].createClass({
  displayName: 'ShuffleClones',

  _childrenWithPositions: function _childrenWithPositions() {
    var _this = this;

    var children = [];
    _React2['default'].Children.forEach(this.props.children, function (child) {
      var style = _this.props.positions[child.key];
      var key = child.key;
      children.push(_React2['default'].createElement(Clone, {
        child: child,
        style: style,
        key: key,
        initial: _this.props.initial,
        fade: _this.props.fade,
        scale: _this.props.scale,
        duration: _this.props.duration }));
    });
    return children.sort(function (a, b) {
      return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    });
  },

  render: function render() {
    return _React2['default'].createElement(
      'div',
      { className: 'ShuffleClones' },
      _React2['default'].createElement(
        ReactTransitionGroup,
        null,
        this._childrenWithPositions()
      )
    );
  }
});

var Clone = _React2['default'].createClass({
  mixins: [_tweenState2['default'].Mixin],
  displayName: 'ShuffleClone',
  getInitialState: function getInitialState() {
    return {
      top: this.props.style ? this.props.style.top : 0,
      left: this.props.style ? this.props.style.left : 0,
      opacity: 1,
      transform: 1
    };
  },
  componentWillAppear: function componentWillAppear(cb) {
    this.tweenState('opacity', {
      easing: _tweenState2['default'].easingTypes.easeOutSine,
      duration: this.props.duration,
      beginValue: this.props.initial ? 0 : 1,
      endValue: 1,
      onEnd: cb
    });
  },
  componentWillEnter: function componentWillEnter(cb) {
    this.tweenState('opacity', {
      easing: _tweenState2['default'].easingTypes.easeOutSine,
      duration: this.props.duration,
      beginValue: 0,
      endValue: 1,
      onEnd: cb
    });
  },
  componentWillLeave: function componentWillLeave(cb) {
    this.tweenState('opacity', {
      easing: _tweenState2['default'].easingTypes.easeOutSine,
      duration: this.props.duration,
      endValue: 0,
      onEnd: function onEnd() {
        try {
          cb();
        } catch (e) {}
      }
    });
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.tweenState('top', {
      easing: _tweenState2['default'].easingTypes.easeOutSine,
      duration: nextProps.duration,
      endValue: nextProps.style.top
    });
    this.tweenState('left', {
      easing: _tweenState2['default'].easingTypes.easeOutSine,
      duration: nextProps.duration,
      endValue: nextProps.style.left
    });
  },
  render: function render() {
    var style = {};
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
    var key = this.props.key;
    return _cloneWithProps2['default'](this.props.child, { style: style, key: key });
  }
});

var Shuffle = _React2['default'].createClass({

  displayName: 'Shuffle',

  propTypes: {
    duration: _React2['default'].PropTypes.number,
    scale: _React2['default'].PropTypes.bool,
    fade: _React2['default'].PropTypes.bool,
    initial: _React2['default'].PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      duration: 300,
      scale: true,
      fade: true,
      initial: false
    };
  },

  getInitialState: function getInitialState() {
    return {
      animating: false,
      ready: false
    };
  },

  componentDidMount: function componentDidMount() {
    this._makePortal();
    window.addEventListener('resize', this._renderClonesInitially);
  },

  componentWillUnmount: function componentWillUnmount() {
    _React2['default'].findDOMNode(this.refs.container).removeChild(this._portalNode);
    window.removeEventListener('resize', this._renderClonesInitially);
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this._startAnimation(nextProps);
  },

  componentDidUpdate: function componentDidUpdate(prevProps) {
    var _this2 = this;

    if (this.state.ready === false) {
      this.setState({ ready: true }, function () {
        _this2._renderClonesInitially();
      });
    } else {
      this._renderClonesToNewPositions(this.props);
    }
  },

  _makePortal: function _makePortal() {
    this._portalNode = document.createElement('div');
    this._portalNode.style.left = '0px';
    this._portalNode.style.top = '0px';
    this._portalNode.style.position = 'absolute';
    _React2['default'].findDOMNode(this.refs.container).appendChild(this._portalNode);
  },

  _addTransitionEndEvent: function _addTransitionEndEvent() {
    setTimeout(this._finishAnimation, this.props.duration);
  },

  _startAnimation: function _startAnimation(nextProps) {
    var _this3 = this;

    if (this.state.animating) {
      return;
    }

    var cloneProps = _assign2['default']({}, nextProps, {
      positions: this._getPositions(),
      initial: this.props.initial,
      fade: this.props.fade,
      scale: this.props.scale,
      duration: this.props.duration
    });
    this._renderClones(cloneProps, function () {
      _this3._addTransitionEndEvent();
      _this3.setState({ animating: true });
    });
  },

  _renderClonesToNewPositions: function _renderClonesToNewPositions(props) {
    var cloneProps = _assign2['default']({}, props, {
      positions: this._getPositions(),
      initial: this.props.initial,
      fade: this.props.fade,
      scale: this.props.scale,
      duration: this.props.duration
    });
    this._renderClones(cloneProps);
  },

  _finishAnimation: function _finishAnimation() {
    this.setState({ animating: false });
  },

  _getPositions: function _getPositions() {
    var _this4 = this;

    var positions = {};
    _React2['default'].Children.forEach(this.props.children, function (child) {
      var ref = child.key;
      var node = _React2['default'].findDOMNode(_this4.refs[ref]);
      var rect = node.getBoundingClientRect();
      var computedStyle = getComputedStyle(node);
      var marginTop = parseInt(computedStyle.marginTop, 10);
      var marginLeft = parseInt(computedStyle.marginLeft, 10);
      var position = {
        top: node.offsetTop - marginTop,
        left: node.offsetLeft - marginLeft,
        width: rect.width,
        height: rect.height,
        position: 'absolute',
        opacity: 1
      };
      positions[ref] = position;
    });
    return positions;
  },

  _renderClonesInitially: function _renderClonesInitially() {
    var cloneProps = _assign2['default']({}, this.props, {
      positions: this._getPositions(),
      initial: this.props.initial,
      fade: this.props.fade,
      scale: this.props.scale,
      duration: this.props.duration
    });
    _React2['default'].render(_React2['default'].createElement(Clones, cloneProps), this._portalNode);
    this.setState({ ready: true });
  },

  _renderClones: function _renderClones(props, cb) {
    _React2['default'].render(_React2['default'].createElement(Clones, props), this._portalNode, cb);
  },

  _childrenWithRefs: function _childrenWithRefs() {
    return _React2['default'].Children.map(this.props.children, function (child) {
      return _cloneWithProps2['default'](child, { ref: child.key });
    });
  },

  render: function render() {
    var showContainer = this.props.initial ? 0 : 1;
    if (this.state.ready) {
      showContainer = 0;
    }
    return _React2['default'].createElement(
      'div',
      _extends({ ref: 'container', style: { position: 'relative' } }, this.props),
      _React2['default'].createElement(
        'div',
        { style: { opacity: showContainer } },
        this._childrenWithRefs()
      )
    );
  }
});

exports['default'] = Shuffle;
module.exports = exports['default'];

// This try catch handles component umounting jumping the gun