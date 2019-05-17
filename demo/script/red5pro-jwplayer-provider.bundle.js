/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./red5pro-jwplayer-provider.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./red5pro-jwplayer-provider.js":
/*!**************************************!*\
  !*** ./red5pro-jwplayer-provider.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

(function (window, Promise, jwplayer, red5pro) {
  if (!jwplayer) {
    console.error('JWPlayer required.');
    return;
  }

  red5pro.setLogLevel('debug');
  var RED5PRO = 'red5pro';
  var typeMatch = /^red5pro/;

  var log = function log(message) {
    console.log("[red5pro] :: ".concat(message));
  };

  var generateVideoElement = function generateVideoElement(elementId, muted) {
    var video = document.createElement('video');
    video.id = elementId;
    video.muted = muted;
    return video;
  };

  function R5ProPlayerProvider(playerId, config, mediaElement) {
    var _this = this;

    // eslint-disable-line no-unused-vars
    this.container = undefined;
    this.subscriber = undefined;
    this.volumeValue = 1;
    this.initPlaybackSettings = {
      autostart: config.autostart,
      muted: config.muted
    };
    this.initConfiguration = Object.assign(config.setupConfig.red5pro, {
      streamName: config.setupConfig.file.match(/(.*)\.red5pro/)[1]
    });
    console.log(config);
    console.log(this.initConfiguration);
    Object.assign(this, jwplayer(playerId).Events, {
      onSubscribeEvent: function onSubscribeEvent(event) {
        console.log(event);
      },
      play: function play() {
        log('play()');

        if (_this.subscriber) {
          _this.subscriber.resume();

          _this.setState('playing');

          _this.setVisibility(true);
        }

        return Promise.resolve();
      },
      pause: function pause() {
        log('pause()');

        if (_this.subscriber) {
          _this.setState('paused');

          _this.subscriber.pause();
        }
      },
      stop: function stop() {
        log('stop()');

        if (_this.subscriber) {
          _this.setState('idle');

          _this.subscriber.stop();
        }
      },
      preload: function preload() {
        log('preload()');
      },
      load: function load() {
        log('load()');
        _this.duration = NaN;

        _this.setState('buffering');

        new red5pro.RTCSubscriber().init(_this.initConfiguration).then(function (subscriberImpl) {
          _this.subscriber = subscriberImpl;

          _this.subscriber.on('*', _this.onSubscribeEvent);

          return _this.subscriber.subscribe();
        }).then(function () {
          _this.trigger('bufferFull');

          if (_this.initPlaybackSettings.autostart) {
            _this.play();
          }
        })["catch"](function (error) {
          console.error(error);
        });
      },
      volume: function volume(value) {
        log("setVolume(".concat(value, ")"));
        _this.volumeValue = value / 100;

        if (_this.subscriber) {
          _this.subscriber.setVolume(_this.volumeValue);
        }
      },
      mute: function mute(muted) {
        log("mute(".concat(muted, ")"));

        if (_this.subscriber) {
          muted ? _this.subscriber.mute() : _this.subscriber.unmute();
          muted ? _this.subscriber.setVolume(0) : _this.subscriber.setVolume(_this.volumeValue);
        }
      },
      setContainer: function setContainer(container) {
        log('setContainer()');
        var videoElement = generateVideoElement(_this.initConfiguration.mediaElementId, _this.initPlaybackSettings.muted);
        _this.container = container;

        _this.container.appendChild(videoElement);
      }
    });
  }

  R5ProPlayerProvider.supports = function (item) {
    return typeMatch.test(item.type);
  };

  R5ProPlayerProvider.getName = function () {
    return {
      name: RED5PRO
    };
  };

  jwplayer.api.registerProvider(R5ProPlayerProvider);
})(window, window.Promise, window.jwplayer, window.red5prosdk);

/***/ })

/******/ });
//# sourceMappingURL=red5pro-jwplayer-provider.bundle.js.map