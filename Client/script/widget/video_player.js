(function() {
  var _base;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  (_base = ET.School.UI.Common).VideoPlayer || (_base.VideoPlayer = {
    "Settings": {},
    "Models": {},
    "Events": {},
    "Handlers": {},
    "Behaviors": {}
  });
  ET.School.UI.Common.VideoPlayer.Handlers = {
    'loadstart': null,
    'progress': null,
    'suspend': null,
    'abort': null,
    'error': null,
    'emptied': null,
    'stalled': null,
    'play': null,
    'pause': null,
    'loadedmetadata': null,
    'loadeddata': null,
    'waiting': null,
    'playing': null,
    'canplay': null,
    'canplaythrough': null,
    'seeking': null,
    'seeked': null,
    'timeupdate': null,
    'ended': null,
    'ratechange': null,
    'durationchange': null,
    'volumechange': null,
    /*custom events handlers*/
    'fullscreen': null,
    'playBtnClickHandler': null,
    'pauseBtnClickHandler': null,
    /*add for flash*/
    /*triggered when flash load finished*/
    'init': function() {
      var index, option;
      option = ET.School.UI.Common.VideoPlayer.Settings;
      index = navigator.appName.indexOf("Microsoft");
      option.video_element = index !== -1 ? window[option.video_id] : document[option.video_id];
    }
  };
  ET.School.UI.Common.VideoPlayer.Settings = {
    /*native*/
    width: '100%',
    height: '100%',
    src: '',
    poster: '',
    preload: null,
    autoplay: null,
    mediaGroup: null,
    loop: null,
    muted: null,
    controls: null,
    /*user defined*/
    consistHTML5: false,
    supportsFullScreen: false,
    isFullScreen: false,
    container: 'body',
    container_element: null,
    video_id: '',
    video_class: '',
    video_element: null,
    current_status: 'Nothing',
    /*help for video control selector*/
    fullScreenSelector: '',
    playBtnSelector: '',
    pauseBtnSelector: '',
    /*end help for video control selector*/
    type: 'application/octet-stream',
    codecs: '',
    /*this arguments will used to detect whether the browser consist html5 automatically*/
    autoDetect: false,
    flashPlayerUrl: "EFVideoPlayerCore.swf",
    useFlash: false,
    flashs: {
      'src': '',
      'autoplay': 'autoplay',
      'loop': 'loop'
    },
    flashVersion: '10.0.0',
    xiSwfUrlStr: 'playerProductInstall.swf',
    flash_params: {
      quality: "high",
      wmode: "transparent",
      allowfullscreen: false,
      allowscriptaccess: true,
      flash_attributes: {
        id: '',
        name: ''
      }
    },
    /*do something once video 
    player is created*/
    flash_callback: function(param) {
      console.log('success');
    }
  };
  ET.School.UI.Common.VideoPlayer.Models = {
    mediaState: ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'],
    netWorkstate: ['NETWORK_EMPTY', 'NETWORK_IDLE', 'NETWORK_LOADING', 'NETWORK_NO_SOURCE'],
    mediaProperties: ['videoWidth', 'videoHeight', 'readyState', 'autobuffer', 'error', 'networkState', 'currentTime', 'duration', 'paused', 'seeking', 'ended', 'autoplay', 'loop', 'controls', 'volume', 'muted', 'startTime', 'buffered', 'defaultPlaybackRate', 'playbackRate', 'played', 'seekable']
  };
  ET.School.UI.Common.VideoPlayer.create = function(option) {
    var _fix_selector, _handlers, _settings;
    _settings = ET.School.UI.Common.VideoPlayer.Settings;
    _fix_selector = ET.School.UI.Common.VideoPlayer.Behaviors._fixSelector;
    _handlers = ET.School.UI.Common.VideoPlayer.Handlers;
    _settings = $j.extend(_settings, option);
    _handlers = $j.extend(_handlers, _settings.handler);
    _settings.video_id = _settings.video_id;
    _settings.video_class = _settings.video_class;
    _settings.container = _fix_selector('id', _settings.container);
    _settings.container_element = $j(_settings.container);
    _settings.consistHTML5 = ET.School.UI.Common.VideoPlayer.Behaviors._detect();
    _settings.useFlash = _settings.autoDetect ? _settings.consistHTML5 : _settings.useFlash;
    if (_settings.useFlash) {
      ET.School.UI.Common.VideoPlayer._loadFlashVersion(_settings);
    } else {
      ET.School.UI.Common.VideoPlayer._loadvideo(_settings);
      _settings.video_element = $j(_fix_selector('id', _settings.video_id))[0];
    }
    ET.School.UI.Common.VideoPlayer.Behaviors._init(_settings);
  };
  ET.School.UI.Common.VideoPlayer.Behaviors._init = function(option) {
    option.supportsFullScreen = ET.School.UI.Common.VideoPlayer.Behaviors._supportsFullScreen();
    ET.School.UI.Common.VideoPlayer.Behaviors._registerCustomEvent(option);
    if (!option.useFlash) {
      ET.School.UI.Common.VideoPlayer.Behaviors._compatibleFlashAndHTML5(option);
    }
  };
  ET.School.UI.Common.VideoPlayer.Behaviors._compatibleFlashAndHTML5 = function(option) {
    var _video_element;
    _video_element = option.video_element;
    _video_element.getCurrentTime || (_video_element.getCurrentTime = function() {
      if (this.currentTime) {
        return this.currentTime;
      } else {
        return 0;
      }
    });
    _video_element.getCurrentState || (_video_element.getCurrentState = function() {
      switch (option.current_status) {
        case 'timeupdate':
          return 'playing';
        case 'pause':
          return 'paused';
        case 'loadedmetadata':
          return 'loaded';
        case 'waiting':
          return 'waiting';
        default:
          return option.current_status;
      }
    });
    _video_element.getReadyState || (_video_element.getReadyState = function() {
      if (this.readyState < 2) {
        return 0;
      } else {
        return 1;
      }
    });
    _video_element.getDuration || (_video_element.getDuration = function() {
      return this.duration;
    });
    /*
         * @param start_time is float number
         */
    _video_element.playTo || (_video_element.playTo = function(start_time) {
      if (start_time > this.duration || start_time < 0) {
        ;
      } else {
        return this.currentTime = start_time;
      }
    });
  };
  ET.School.UI.Common.VideoPlayer.Behaviors._registerCustomEvent = function(option) {
    /*html5*/    ET.School.UI.Common.VideoPlayer.Events._registerFullScreen();
    ET.School.UI.Common.VideoPlayer.Events._registerPlay(option);
    return ET.School.UI.Common.VideoPlayer.Events._registerPause(option);
    /*flash*/
  };
  /*@formatter:on*/
  ET.School.UI.Common.VideoPlayer.Events._registerPlay = function(option) {
    if (option.playBtnSelector !== '') {
      $j(option.playBtnSelector).bind('click', ET.School.UI.Common.VideoPlayer.Handlers.playBtnClickHandler);
    }
  };
  ET.School.UI.Common.VideoPlayer.Events._registerPause = function(option) {
    if (option.pauseBtnSelector !== '') {
      $j(option.pauseBtnSelector).bind('click', ET.School.UI.Common.VideoPlayer.Handlers.pauseBtnClickHandler);
    }
  };
  ET.School.UI.Common.VideoPlayer.Events._registerFullScreen = function() {
    var _settings;
    _settings = ET.School.UI.Common.VideoPlayer.Settings;
    $j(_settings.fullScreenSelector).bind('click', ET.School.UI.Common.VideoPlayer.Handlers.fullscreen);
    ET.School.UI.Common.VideoPlayer.Handlers._fullscreen();
  };
  ET.School.UI.Common.VideoPlayer.Handlers._fullscreen = function() {
    var _settings;
    _settings = ET.School.UI.Common.VideoPlayer.Settings;
    $j(_settings.fullScreenSelector).bind('click', __bind(function(event) {
      if (_settings.container_element.hasClass('vp_full_screen') !== true) {
        if (_settings.supportsFullScreen) {
          return ET.School.UI.Common.VideoPlayer.Behaviors._html5EnterNativeFullScreen(_settings);
        } else {
          return ET.School.UI.Common.VideoPlayer.Behaviors._enterFullWindow(_settings);
        }
      } else {
        return ET.School.UI.Common.VideoPlayer.Behaviors._exitFullWindow(_settings);
      }
    }, this));
  };
  ET.School.UI.Common.VideoPlayer.Behaviors._html5EnterNativeFullScreen = function(settings) {
    try {
      settings.video_element.webkitEnterFullScreen();
    } catch (e) {
      /*todo:tell user it's not ready to fullscreen because it's not load*/
      if (e.code === 11) {}
      /* ok now!*/
    }
  };
  ET.School.UI.Common.VideoPlayer.Behaviors._enterFullWindow = function(settings) {
    settings.isFullScreen = true;
    settings.container_element.addClass('vp_full_screen');
    document.documentElement.style.overflow = 'hidden';
    ET.School.UI.Common.VideoPlayer.Behaviors._positionBox(settings);
  };
  ET.School.UI.Common.VideoPlayer.Behaviors._exitFullWindow = function(settings) {
    settings.isFullScreen = false;
    if (!settings.supportsFullScreen) {
      settings.container_element.removeClass('vp_full_screen');
      ET.School.UI.Common.VideoPlayer.Behaviors._positionBox(settings);
    }
  };
  ET.School.UI.Common.VideoPlayer.Behaviors._positionBox = function(settings) {
    /* Set width based on fullscreen or not.*/    if (settings.isFullScreen) {
      settings.container_element.css({
        width: 'auto',
        height: 'auto'
      });
      $j(settings.video_element).css({
        width: '100%',
        height: '100%'
      });
    } else {
      $j(settings.video_element).css({
        width: settings.width,
        height: settings.height
      });
      settings.container_element.css({
        width: settings.video_element.offsetWidth,
        height: settings.video_element.offsetHeight
      });
    }
  };
  ET.School.UI.Common.VideoPlayer.Behaviors._fixSelector = function(pre, selector) {
    var tmp;
    tmp = $j.trim(selector).charAt(0).match(/^[#|.|\[|:]/g);
    if (tmp) {
      selector;
    } else {
      switch (pre) {
        case 'id':
          return '#' + selector;
        case 'class':
          return '.' + selector;
        default:
          return '#' + selector;
      }
    }
  };
  ET.School.UI.Common.VideoPlayer.Behaviors._supportsFullScreen = function() {
    var _setting;
    _setting = ET.School.UI.Common.VideoPlayer.Settings;
    /* Seems to be broken in Chromium/Chrome*/
    if (_setting.video_element && _setting.video_element.webkitEnterFullScreen && typeof _setting.video_element.webkitEnterFullScreen === '') {
      if (!navigator.userAgent.match("Chrome") && !navigator.userAgent.match("Mac OS X 10.5")) {
        true;
      }
    }
    false;
  };
  ET.School.UI.Common.VideoPlayer.Behaviors._detect = function() {
    var bool, elem, h264;
    elem = document.createElement('video');
    bool = false;
    /* IE9 Running on Windows Server SKU can cause an exception to be thrown, bug*/
    /* #224*/
    try {
      if (bool = !!elem.canPlayType) {
        bool = new Boolean(bool);
        bool.ogg = elem.canPlayType('video/ogg codecs="theora"');
        /* Workaround required for IE9, which doesn't report video support*/
        /* without audio codec specified.*/
        /*   bug 599718 @ msft connect*/
        h264 = 'video/mp4 codecs="avc1.42E01E';
        bool.h264 = elem.canPlayType(h264 + '"') || elem.canPlayType(h264 + ', mp4a.40.2"');
        bool.webm = elem.canPlayType('video/webm codecs="vp8, vorbis"');
      }
    } catch (e) {

    }
    return bool;
  };
  ET.School.UI.Common.VideoPlayer._loadFlashVersion = function(option) {
    var _handlers;
    option.flash_attributes.id = option.video_id;
    option.flash_attributes.name = option.video_id;
    option.flashs.src = option.src;
    option.flashs.autoplay = option.autoplay;
    option.flashs.loop = option.loop;
    _handlers = ET.School.UI.Common.VideoPlayer.Handlers;
    $j.each(_handlers, function(index, item) {
      if (_handlers[index]) {
        option.flashs['handler_' + index] = 'ET.School.UI.Common.VideoPlayer.Handlers.' + index;
      }
    });
    /* @formatter:off*/
    swfobject.embedSWF = option.flashPlayerUrl;
    option.video_id;
    option.width;
    option.height;
    option.flashVersion;
    option.xiSwfUrlStr;
    option.flashs;
    option.flash_params;
    option.flash_attributes;
    return option.flash_callback;
  };
  ET.School.UI.Common.VideoPlayer._loadvideo = function(option) {
    ET.School.UI.Common.loadTemplate($j(option.container), window.jTemplatePath + "_templates/video_player.tpl", option);
    ET.School.UI.Common.VideoPlayer._registerEvent();
  };
  ET.School.UI.Common.VideoPlayer._registerEvent = function() {
    var _fix_selector, _handlerWrraper, _handles, _settings, _video;
    _settings = ET.School.UI.Common.VideoPlayer.Settings;
    _handles = ET.School.UI.Common.VideoPlayer.Handlers;
    _fix_selector = ET.School.UI.Common.VideoPlayer.Behaviors._fixSelector;
    _video = $j(_fix_selector('id', _settings.video_id));
    _handlerWrraper = {};
    /* @formatter:on*/
    if (_video.length === 0) {
      return;
    }
    $j.each(_handles, function(index, item) {
      _handlerWrraper[index] = function() {
        _settings.current_status = index;
        if (item) {
          return item();
        }
      };
      return _video.bind(index, _handlerWrraper[index]);
    });
  };
}).call(this);
