(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LaunchControl = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _CURSOR, _extends$parseMessage$buildLedData;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _xtend = require("xtend");

var _xtend2 = _interopRequireDefault(_xtend);

var PAD = [0x09, 0x0a, 0x0b, 0x0c, 0x19, 0x1a, 0x1b, 0x1c];
var KNOB1 = [0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c];
var KNOB2 = [0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x30];
var CURSOR = (_CURSOR = {}, _defineProperty(_CURSOR, 0x72, "cursor:up"), _defineProperty(_CURSOR, 0x73, "cursor:down"), _defineProperty(_CURSOR, 0x74, "cursor:left"), _defineProperty(_CURSOR, 0x75, "cursor:right"), _CURSOR);
var COLOR_NAMES = {
  off: 0,
  "dark red": 1,
  red: 2,
  "light red": 3,
  "dark green": 4,
  "dark amber": 5,
  green: 8,
  amber: 10,
  "light green": 12,
  "light amber": 15
};
var TRACK_SELECTOR = {
  all: function all() {
    return true;
  },
  even: function even(_, i) {
    return i % 2 === 0;
  },
  odd: function odd(_, i) {
    return i % 2 === 1;
  }
};

function parseMessage(st, d1, d2) {
  var messageType = st & 0xf0;
  var value = Math.max(0, Math.min(d2, 127));
  var channel = Math.max(0, Math.min(st & 0x0f, 15));
  var track = undefined;

  // note on
  if (messageType === 0x90) {
    track = PAD.indexOf(d1);
    if (track !== -1) {
      return { dataType: "pad", track: track, value: value, channel: channel };
    }
  }

  // control change
  if (messageType === 0xb0) {
    track = KNOB1.indexOf(d1);
    if (track !== -1) {
      return { dataType: "knob1", track: track, value: value, channel: channel };
    }

    track = KNOB2.indexOf(d1);
    if (track !== -1) {
      return { dataType: "knob2", track: track, value: value, channel: channel };
    }

    var cursor = CURSOR[d1];

    if (cursor) {
      return { dataType: cursor, value: value, channel: channel };
    }
  }

  return null;
}

function buildLedData(track, color, channel) {
  if (typeof color === "string") {
    color = COLOR_NAMES[color];
  }
  color = (color | 0) % 16;

  var st = 0x90 + (channel | 0) % 16;
  var d2 = ((color & 0x0c) << 2) + 0x0c + (color & 0x03);

  if (TRACK_SELECTOR.hasOwnProperty(track)) {
    return PAD.filter(TRACK_SELECTOR[track]).map(function (d1) {
      return [st, d1, d2];
    });
  }

  if (/^[-o]+$/.test(track)) {
    var data = [];

    for (var i = 0; i < 8; i++) {
      if (track[i % track.length] === "o") {
        data.push([st, PAD[i], d2]);
      }
    }

    return data;
  }

  var d1 = PAD[(track | 0) % 8];

  return [[st, d1, d2]];
}

function _extends(MIDIDevice) {
  return (function (_MIDIDevice) {
    function LaunchControl() {
      var _this = this;

      var deviceName = arguments[0] === undefined ? "Launch Control" : arguments[0];

      _classCallCheck(this, LaunchControl);

      _get(Object.getPrototypeOf(LaunchControl.prototype), "constructor", this).call(this, deviceName);

      this._channel = 8;
      this._onmidimessage = function (e) {
        var msg = parseMessage(e.data[0], e.data[1], e.data[2]);

        if (msg === null) {
          return;
        }

        _this._channel = msg.channel;
        _this.emit("message", (0, _xtend2["default"])({ type: "message", deviceName: _this.deviceName }, msg));
      };
    }

    _inherits(LaunchControl, _MIDIDevice);

    _createClass(LaunchControl, [{
      key: "led",
      value: function led(track, color) {
        var _this2 = this;

        var channel = arguments[2] === undefined ? this._channel : arguments[2];

        buildLedData(track, color, channel).forEach(function (data) {
          _this2.send(data);
        });
      }
    }]);

    return LaunchControl;
  })(MIDIDevice);
}

exports["default"] = (_extends$parseMessage$buildLedData = {}, _defineProperty(_extends$parseMessage$buildLedData, "extends", _extends), _defineProperty(_extends$parseMessage$buildLedData, "parseMessage", parseMessage), _defineProperty(_extends$parseMessage$buildLedData, "buildLedData", buildLedData), _extends$parseMessage$buildLedData);
module.exports = exports["default"];
},{"xtend":8}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _mohayonaoMidiDeviceWebmidi = require("@mohayonao/midi-device/webmidi");

var _mohayonaoMidiDeviceWebmidi2 = _interopRequireDefault(_mohayonaoMidiDeviceWebmidi);

var _LaunchControl = require("./LaunchControl");

var _LaunchControl2 = _interopRequireDefault(_LaunchControl);

exports["default"] = _LaunchControl2["default"]["extends"](_mohayonaoMidiDeviceWebmidi2["default"]);
module.exports = exports["default"];
},{"./LaunchControl":1,"@mohayonao/midi-device/webmidi":7}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _mohayonaoEventEmitter = require("@mohayonao/event-emitter");

var _mohayonaoEventEmitter2 = _interopRequireDefault(_mohayonaoEventEmitter);

exports["default"] = _mohayonaoEventEmitter2["default"];
module.exports = exports["default"];
},{"@mohayonao/event-emitter":6}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _EventEmitter2 = require("./EventEmitter");

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

var MIDIDevice = (function (_EventEmitter) {
  function MIDIDevice(deviceName) {
    _classCallCheck(this, MIDIDevice);

    _get(Object.getPrototypeOf(MIDIDevice.prototype), "constructor", this).call(this);

    this._input = null;
    this._output = null;
    this._deviceName = deviceName;
  }

  _inherits(MIDIDevice, _EventEmitter);

  _createClass(MIDIDevice, [{
    key: "open",
    value: function open() {
      return Promise.reject(new Error("subclass responsibility"));
    }
  }, {
    key: "close",
    value: function close() {
      return Promise.reject(new Error("subclass responsibility"));
    }
  }, {
    key: "send",
    value: function send() {
      throw new Error("subclass responsibility");
    }
  }, {
    key: "_onmidimessage",
    value: function _onmidimessage() {}
  }, {
    key: "deviceName",
    get: function get() {
      return this._deviceName;
    }
  }], [{
    key: "requestDeviceNames",
    value: function requestDeviceNames() {
      return Promise.reject(new Error("subclass responsibility"));
    }
  }]);

  return MIDIDevice;
})(_EventEmitter3["default"]);

exports["default"] = MIDIDevice;
module.exports = exports["default"];
},{"./EventEmitter":3}],5:[function(require,module,exports){
(function (global){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _MIDIDevice2 = require("./MIDIDevice");

var _MIDIDevice3 = _interopRequireDefault(_MIDIDevice2);

function findMIDIPortByName(iter, deviceName) {
  for (var x = iter.next(); !x.done; x = iter.next()) {
    if (x.value.name === deviceName) {
      return x.value;
    }
  }

  return null;
}

function collectDeviceNames(iter) {
  var result = [];

  for (var x = iter.next(); !x.done; x = iter.next()) {
    result.push(x.value.name);
  }

  return result;
}

var WebMIDIDevice = (function (_MIDIDevice) {
  function WebMIDIDevice() {
    _classCallCheck(this, WebMIDIDevice);

    _get(Object.getPrototypeOf(WebMIDIDevice.prototype), "constructor", this).apply(this, arguments);
  }

  _inherits(WebMIDIDevice, _MIDIDevice);

  _createClass(WebMIDIDevice, [{
    key: "open",
    value: function open() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        if (!global.navigator || typeof global.navigator.requestMIDIAccess !== "function") {
          return reject(new TypeError("Web MIDI API is not supported"));
        }

        if (_this._input !== null || _this._output !== null) {
          return reject(new TypeError(_this.deviceName + " has already been opened"));
        }

        var successCallback = function successCallback(access) {
          _this._access = access;

          var input = findMIDIPortByName(access.inputs.values(), _this.deviceName);
          var output = findMIDIPortByName(access.outputs.values(), _this.deviceName);

          if (input === null && output === null) {
            return reject(new TypeError(_this.deviceName + " is not found"));
          }

          if (input !== null) {
            _this._input = input;

            input.onmidimessage = function (e) {
              _this._onmidimessage(e);
            };
          }

          if (output !== null) {
            _this._output = output;
          }

          return Promise.all([_this._input && _this._input.open(), _this._output && _this._output.open()]).then(resolve, reject);
        };

        if (_this._access) {
          return successCallback(_this._access);
        }

        return global.navigator.requestMIDIAccess().then(successCallback, reject);
      });
    }
  }, {
    key: "close",
    value: function close() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        if (_this2._input === null && _this2._output === null) {
          return reject(new TypeError(_this2.deviceName + " has already been closed"));
        }

        var input = _this2._input;
        var output = _this2._output;

        _this2._input = null;
        _this2._output = null;

        return Promise.all([input && input.close(), output && output.close()]).then(resolve, reject);
      });
    }
  }, {
    key: "send",
    value: function send(data) {
      if (this._output !== null) {
        this._output.send(data);
      }
    }
  }], [{
    key: "requestDeviceNames",
    value: function requestDeviceNames() {
      return new Promise(function (resolve, reject) {
        if (!global.navigator || typeof global.navigator.requestMIDIAccess !== "function") {
          return reject(new TypeError("Web MIDI API is not supported"));
        }

        return global.navigator.requestMIDIAccess().then(function (access) {
          var inputDeviceNames = collectDeviceNames(access.inputs.values());
          var outputDeviceNames = collectDeviceNames(access.outputs.values());

          resolve({
            inputs: inputDeviceNames,
            outputs: outputDeviceNames
          });
        }, reject);
      });
    }
  }]);

  return WebMIDIDevice;
})(_MIDIDevice3["default"]);

exports["default"] = WebMIDIDevice;
module.exports = exports["default"];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./MIDIDevice":4}],6:[function(require,module,exports){
"use strict";

var LISTENERS = typeof Symbol !== "undefined" ? Symbol("LISTENERS") : "_@mohayonao/event-emitter:listeners";

function EventEmitter() {
  this[LISTENERS] = {};
}

EventEmitter.prototype.listeners = function(event) {
  if (this[LISTENERS].hasOwnProperty(event)) {
    return this[LISTENERS][event].map(function(listener) {
      return listener.listener || listener;
    }).reverse();
  }

  return [];
};

EventEmitter.prototype.addListener = function(event, listener) {
  if (typeof listener === "function") {
    if (!this[LISTENERS].hasOwnProperty(event)) {
      this[LISTENERS][event] = [ listener ];
    } else {
      this[LISTENERS][event].unshift(listener);
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(event, listener) {
  var _this, func;

  _this = this;

  if (typeof listener === "function") {
    func = function(arg1) {
      _this.removeListener(event, func);
      listener(arg1);
    };

    func.listener = listener;

    this.addListener(event, func);
  }

  return this;
};

EventEmitter.prototype.removeListener = function(event, listener) {
  var listeners, i;

  if (typeof listener === "function" && this[LISTENERS].hasOwnProperty(event)) {
    listeners = this[LISTENERS][event];

    for (i = listeners.length - 1; i >= 0; i--) {
      if (listeners[i] === listener || listeners[i].listener === listener) {
        listeners.splice(i, 1);
        break;
      }
    }
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(event) {
  if (typeof event === "undefined") {
    this[LISTENERS] = {};
  } else if (this[LISTENERS].hasOwnProperty(event)) {
    delete this[LISTENERS][event];
  }

  return this;
};

EventEmitter.prototype.emit = function(event, arg1) {
  var listeners, i;

  if (this[LISTENERS].hasOwnProperty(event)) {
    listeners = this[LISTENERS][event];

    for (i = listeners.length - 1; i >= 0; i--) {
      listeners[i](arg1);
    }
  }

  return this;
};

module.exports = EventEmitter;

},{}],7:[function(require,module,exports){
module.exports = require("./lib/WebMIDIDevice");

},{"./lib/WebMIDIDevice":5}],8:[function(require,module,exports){
module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],9:[function(require,module,exports){
module.exports = require("./lib/WebMIDILaunchControl");

},{"./lib/WebMIDILaunchControl":2}]},{},[9])(9)
});