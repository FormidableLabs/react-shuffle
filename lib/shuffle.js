'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _reactTweenState = require('react-tween-state');

var _reactTweenState2 = _interopRequireDefault(_reactTweenState);

var _reactAddonsTransitionGroup = require('react-addons-transition-group');

var _reactAddonsTransitionGroup2 = _interopRequireDefault(_reactAddonsTransitionGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; } /* eslint no-unused-vars:0 */
/*global window, document, getComputedStyle*/

var Clones = _react2.default.createClass({
  displayName: 'ShuffleClones',

  _childrenWithPositions: function _childrenWithPositions() {
    var _this = this;

    var children = [];
    _react2.default.Children.forEach(this.props.children, function (child) {
      var style = _this.props.positions[child.key];
      var key = child.key;
      children.push(_react2.default.createElement(Clone, {
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
    return _react2.default.createElement(
      'div',
      { className: 'ShuffleClones' },
      _react2.default.createElement(
        _reactAddonsTransitionGroup2.default,
        null,
        this._childrenWithPositions()
      )
    );
  }
});

var Clone = _react2.default.createClass({
  mixins: [_reactTweenState2.default.Mixin],
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
      easing: _reactTweenState2.default.easingTypes.easeOutSine,
      duration: this.props.duration,
      beginValue: this.props.initial ? 0 : 1,
      endValue: 1,
      onEnd: cb
    });
  },
  componentWillEnter: function componentWillEnter(cb) {
    this.tweenState('opacity', {
      easing: _reactTweenState2.default.easingTypes.easeOutSine,
      duration: this.props.duration,
      beginValue: 0,
      endValue: 1,
      onEnd: cb
    });
  },
  componentWillLeave: function componentWillLeave(cb) {
    this.tweenState('opacity', {
      easing: _reactTweenState2.default.easingTypes.easeOutSine,
      duration: this.props.duration,
      endValue: 0,
      onEnd: function onEnd() {
        try {
          cb();
        } catch (e) {
          // This try catch handles component umounting jumping the gun
        }
      }
    });
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.tweenState('top', {
      easing: _reactTweenState2.default.easingTypes.easeOutSine,
      duration: nextProps.duration,
      endValue: nextProps.style.top
    });
    this.tweenState('left', {
      easing: _reactTweenState2.default.easingTypes.easeOutSine,
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
    return _react2.default.cloneElement(this.props.child, { style: style, key: key });
  }
});

var Shuffle = _react2.default.createClass({

  displayName: 'Shuffle',

  propTypes: {
    duration: _react2.default.PropTypes.number,
    scale: _react2.default.PropTypes.bool,
    fade: _react2.default.PropTypes.bool,
    initial: _react2.default.PropTypes.bool
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
    _reactDom2.default.unmountComponentAtNode(this._portalNode);
    _reactDom2.default.findDOMNode(this.refs.container).removeChild(this._portalNode);
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
    _reactDom2.default.findDOMNode(this.refs.container).appendChild(this._portalNode);
  },
  _addTransitionEndEvent: function _addTransitionEndEvent() {
    setTimeout(this._finishAnimation, this.props.duration);
  },
  _startAnimation: function _startAnimation(nextProps) {
    var _this3 = this;

    if (this.state.animating) {
      return;
    }

    var cloneProps = (0, _objectAssign2.default)({}, nextProps, {
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
    var cloneProps = (0, _objectAssign2.default)({}, props, {
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
    _react2.default.Children.forEach(this.props.children, function (child) {
      var ref = child.key;
      var node = _reactDom2.default.findDOMNode(_this4.refs[ref]);
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
    var cloneProps = (0, _objectAssign2.default)({}, this.props, {
      positions: this._getPositions(),
      initial: this.props.initial,
      fade: this.props.fade,
      scale: this.props.scale,
      duration: this.props.duration
    });
    _reactDom2.default.unstable_renderSubtreeIntoContainer(this, _react2.default.createElement(Clones, cloneProps), this._portalNode);
    this.setState({ ready: true });
  },
  _renderClones: function _renderClones(props, cb) {
    _reactDom2.default.unstable_renderSubtreeIntoContainer(this, _react2.default.createElement(Clones, props), this._portalNode, cb);
  },
  _childrenWithRefs: function _childrenWithRefs() {
    return _react2.default.Children.map(this.props.children, function (child) {
      return _react2.default.cloneElement(child, { ref: child.key });
    });
  },
  render: function render() {
    var _props = this.props,
        initial = _props.initial,
        fade = _props.fade,
        duration = _props.duration,
        props = _objectWithoutProperties(_props, ['initial', 'fade', 'duration']);

    var showContainer = initial ? 0 : 1;
    if (this.state.ready) {
      showContainer = 0;
    }
    return _react2.default.createElement(
      'div',
      _extends({ ref: 'container', style: { position: 'relative' } }, props),
      _react2.default.createElement(
        'div',
        { style: { opacity: showContainer } },
        this._childrenWithRefs()
      )
    );
  }
});

exports.default = Shuffle;