/*! Copyright (c) 2011 Epaper
* Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
* and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
* Thanks to: Brandon Aaron (http://brandonaaron.net)
* Thanks to: Metadata - jQuery plugin for parsing metadata from elements
* Thanks to: can3p (https://github.com/can3p/iviewer)
* Version: 1.0
*
* Requires: 1.4.1+
*/

/**
 * Sets the type of metadata to use. Metadata is encoded in JSON, and each
 * property
 * in the JSON will become a property of the element itself.
 *
 * There are three supported types of metadata storage:
 *
 *   attr:  Inside an attribute. The name parameter indicates *which* attribute.
 *
 *   class: Inside the class attribute, wrapped in curly braces: { }
 *
 *   elem:  Inside a child element (e.g. a script tag). The
 *          name parameter indicates *which* element.
 *
 * The metadata for an element is loaded the first time the element is accessed
 * via jQuery.
 *
 * As a result, you can define the metadata type, use $(expr) to load the
 * metadata into the elements
 * matched by expr, then redefine the metadata type and run another $(expr) for
 * other elements.
 *
 * @name $.metadata.setType
 *
 * @example <p id="one" class="some_class {item_id: 1, item_label: 'Label'}">This
 * is a p</p>
 * @before $.metadata.setType("class")
 * @after $("#one").metadata().item_id == 1; $("#one").metadata().item_label ==
 * "Label"
 * @desc Reads metadata from the class attribute
 *
 * @example <p id="one" class="some_class" data="{item_id: 1, item_label:
 * 'Label'}">This is a p</p>
 * @before $.metadata.setType("attr", "data")
 * @after $("#one").metadata().item_id == 1; $("#one").metadata().item_label ==
 * "Label"
 * @desc Reads metadata from a "data" attribute
 *
 * @example <p id="one" class="some_class"><script>{item_id: 1, item_label:
 * 'Label'}</script>This is a p</p>
 * @before $.metadata.setType("elem", "script")
 * @after $("#one").metadata().item_id == 1; $("#one").metadata().item_label ==
 * "Label"
 * @desc Reads metadata from a nested script element
 *
 * @param String type The encoding type
 * @param String name The name of the attribute to be used to get metadata
 * (optional)
 * @cat Plugins/Metadata
 * @descr Sets the type of encoding to be used when loading metadata for the
 * first time
 * @type undefined
 * @see metadata()
 */
define(function(require) {
    var $ = require("jquery"),
    j=require('js/helper/order!lib/jquery-jtemplates_uncompressed'),
    $ui=require('lib/jquery-ui'),
    engine=require('script/helper/tpl_engine.js');
    $.fn.epaper = function(o) {
        return this.each(function() {
            $(this).data('epaper', new $e(this, o));
            $(this).data('epaper').defaults.initMouseEvent();
        })
    }
    $.epaper = function(e, o) {
        var me = this;
        var opt = o || {};
        var meta = $e.meta($(e));
        /* object containing actual information about image
         *   @img_object.object - jquery img object
         *   @img_object.orig_{width|height} - original dimensions
         *   @img_object.display_{width|height} - actual dimensions
         */
        this.img_object = {};

        this.zoom_object = {};
        //object to show zoom status
        this.image_loaded = false;

        //drag variables
        this.dx = 0;
        this.dy = 0;
        this.dragged = false;

        this.defaults = $.extend({}, $e.defaults, meta ? $.extend({}, opt, meta) : opt);

        this.current_zoom = this.defaults.zoom;

        if(this.defaults.src === null) {
            return;
        }

        this.container = $(e);

        this.update_container_info();

        //init container
        this.container.css("overflow", "hidden");

        if(this.defaults.update_on_resize == true) {
            $(window).resize(function() {
                me.update_container_info();
            });
        }

        this.img_object.x = 0;
        this.img_object.y = 0;

        //init object
        this.img_object.object = $("<img>").css({
            position : "absolute",
            top : "0px",
            left : "0px"
        }).//this is needed, because chromium sets them auto otherwise
        //bind mouse events
        mousedown(function(e) {
            return me.drag_start(e);
        }).mousemove(function(e) {
            return me.drag(e)
        }).mouseup(function(e) {
            return me.drag_end(e)
        }).click(function(e) {
            return me.click(e)
        }).mouseleave(function(e) {
            return me.drag_end(e)
        }).mousewheel(function(ev, delta) {
            //this event is there instead of containing div, because
            //at opera it triggers many times on div
            var zoom = (delta > 0) ? 1 : -1;
            me.zoom_by(zoom);
            me.update_bar_pos();
            return false;
        });

        this.img_object.object.prependTo(me.container);
        this.loadImage(this.defaults.src);

        if(!this.defaults.ui_disabled) {
            this.createui();
        }

        if(this.defaults.initCallback) {
            this.defaults.initCallback.call(this);
        }
    }
    $e = $.epaper;
    $e.fn = $e.prototype = {
        version : '1.1'
    };
    $e.extend = $e.fn.extend = $.extend;
    $e.defaults = {
        /**
         * image src
         **/
        src : '',
        /**
         * basic theme
         **/
        theme : '',
        /**
         * meta data type
         **/
        metaType : 'attr',
        /**
         * meta data attribute name
         **/
        metaName : 'data',
        /**
         * meta data string content
         **/
        metaReg : /({.*})/,
        /**
         * meta data string cache name
         **/
        metaCache : 'metadata',
        /**
         * internal object
         **/
        selectors : {
            zoom_in : '.zoom_in',
            slider_handle : '.ui-slider-handle',
            slider_bar : '.indicator',
            zoom_out : '.zoom_out',
            epaper_container : '.epaper_container',
            epaper_corner : '.epaper_zoom_fit',
            epaper : '.epaper',
            close : '.alert_cls',
            epaper_drag_container : 'body'
        },
        epaper_wrapper : '#epaper',
        /**
         * start zoom value for image, not used now
         * may be equal to "fit" to fit image into container or scale in %
         **/
        zoom : "fit",
        /**
         * base value to scale image
         **/
        zoom_base : 100,
        /**
         * maximum zoom
         **/
        zoom_max : 200,
        /**
         * minimum zoom
         **/
        zoom_min : 25,
        /**
         * base of rate multiplier.
         * zoom is calculated by formula: zoom_base * zoom_delta^rate
         **/
        zoom_delta : 1.2,
        /**
         * if true plugin doesn't add its own controls
         **/
        ui_disabled : false,
        /**
         * if false, plugin doesn't bind resize event on window and this must
         * be handled manually
         **/
        update_on_resize : true,
        /**
         * event is triggered when zoom value is changed
         * @param int new zoom value
         * @return boolean if false zoom action is aborted
         **/
        onZoom : null,
        /**
         * callback is fired after plugin setup
         **/
        initCallback : null,
        /**
         * event is fired on drag begin
         * @param object coords mouse coordinates on the image
         * @return boolean if false is returned, drag action is aborted
         **/
        onStartDrag : null,
        /**
         * event is fired on drag action
         * @param object coords mouse coordinates on the image
         **/
        onDrag : null,
        /**
         * event is fired when mouse moves over image
         * @param object coords mouse coordinates on the image
         **/
        onMouseMove : null,
        /**
         * mouse click event
         * @param object coords mouse coordinates on the image
         **/
        onClick : null,
        /**
         * event is fired when image starts to load
         */
        onStartLoad : null,
        /**
         * event is fired, when image is loaded and initially positioned
         */
        onFinishLoad : null,
        /**
         * init internal events instead of client init
         */
        initMouseEvent : function() {
            var s = this.selectors;
            var obj = $(s.epaper_container).data('epaper');
            var container = $(s.epaper_container);
            var epaper = $(s.epaper);
            var dragging;
            /*
             zoom_in:'#zoom_in',
             slider_bar:'#indicator',
             zoom_out:'#zoom_out',
             epaper_container:'#epaper_container',
             epaper_corner:'.epaper_zoom_fit',
             epaper:'epaper'
             close:'alert_cls'
             */
            $(s.zoom_in).click(function() {
                obj.zoom_by(-1);
                obj.update_bar_pos();
            });
            $(s.zoom_out).click(function() {
                obj.zoom_by(1);
                obj.update_bar_pos();
            });
            $(s.close).click(function() {
                epaper.hide();
            });
            $(s.slider_bar).slider({
                range : "min",
                min : 0,
                max : 200,
                value : 100,
                animate : true,
                change : function(event, ui) {
                    var cur_value = $(s.slider_bar).slider("value");
                    if(cur_value <= 100) {
                        var rate = 75 * cur_value / 100 + 25;
                        obj.set_zoom(rate);
                    }
                    else {
                        var rate = cur_value;
                        obj.set_zoom(rate);
                    }
                }
            });
            $(s.epaper_container).height(epaper.height() - 57);
            epaper.draggable({
                containment : s.epaper_drag_container
            });
            $(s.epaper_corner).mousedown(function(e) {
                obj.isResizingEPaper = true;
                obj.resizeStartX = e.pageX;
                obj.resizeStartY = e.pageY;
                obj.orgContainerHeight = epaper.height();
                obj.orgEPaperHeight = epaper.height();
                obj.orgEPaperWidth = epaper.width();
                dragging = e.target || e.srcElement;
                epaper.draggable({
                    disabled : true
                });
            })
            $(window.document).mousemove(function(e) {
                if(obj.isResizingEPaper) {
                    epaper.height(e.pageY - obj.resizeStartY + obj.orgEPaperHeight);
                    container.height(e.pageY - obj.resizeStartY + obj.orgContainerHeight);
                    var moveX = e.pageX - obj.resizeStartX + obj.orgEPaperWidth;
                    if(moveX >= 100 && moveX <= 800) {
                        epaper.width(moveX);
                    }
                }
            }).mouseup(function() {
                obj.isResizingEPaper = false;
                orgContainerHeight = epaper.height();
                orgEPaperHeight = epaper.height();
                orgEPaperWidth = epaper.width();
                epaper.draggable({
                    disabled : false
                });
            });
        },
        isResizingEPaper : false,
        resizeStartX : 0,
        resizeStartY : 0,
        orgContainerHeight : 0,
        orgEPaperHeight : 0,
        orgEPaperWidth : 0
    }
    $e.settings = {
        mouseEventType : ['DOMMouseScroll', 'mousewheel'],
        mouseEventHandler : function(event) {
            var args = [].slice.call(arguments, 1), delta = 0, returnValue = true;
            event = $.event.fix(event || window.event);
            event.type = "mousewheel";
            if(event.wheelDelta)
                delta = event.wheelDelta / 120;
            if(event.detail)
                delta = -event.detail / 3;
            // Add events and delta to the front of the arguments
            args.unshift(event, delta);
            return $.event.handle.apply(this, args);
        }
    }
    var types = $e.settings.mouseEventType;
    var handler = $e.settings.mouseEventHandler;
    $.event.special.mousewheel = {
        setup : function() {
            if(this.addEventListener)
                for(var i = types.length; i; )
                this.addEventListener(types[--i], handler, false);
            else
                this.onmousewheel = handler;
        },
        teardown : function() {
            if(this.removeEventListener)
                for(var i = types.length; i; )
                this.removeEventListener(types[--i], handler, false);
            else
                this.onmousewheel = null;
        }
    };
    $e.fn.extend({
        meta : {
            defaults : {
                metaType : 'attr',
                metaName : 'data',
                metaReg : /({.*})/,
                metaCache : 'metadata'
            },
            setType : function() {
                this.defaults = $.extend(this.defaults, $e.defaults);
            },
            get : function(elem, opts) {
                var settings = $.extend({}, this.defaults, opts);
                // check for empty string in single property
                if(!settings.metaCache.length)
                    settings.metaCache = 'metadata';

                var data = $.data(elem, settings.metaCache);
                // returned cached data if it already exists
                if(data)
                    return data;
                data = "{}";

                if(settings.metaType == "class") {
                    var m = settings.metaReg.exec(elem.className);
                    if(m)
                        data = m[1];
                    console.log(m);
                }
                else
                if(settings.metaType == "elem") {
                    if(!elem.getElementsByTagName)
                        return;
                    var e = elem.getElementsByTagName(settings.metaName);
                    if(e.length)
                        data = $.trim(e[0].innerHTML);
                }
                else
                if(elem.getAttribute != undefined) {
                    var attr = elem.getAttribute(settings.metaName);
                    if(attr)
                        data = attr;
                }

                if(data.indexOf('{') < 0)
                    data = "{" + data + "}";
                data = eval("(" + data + ")");

                $.data(elem, settings.metaCache, data);
                return data;
            }
        },
        /*iviewer event start*/
        loadImage : function(src, replace_zoom) {
            this.current_zoom = this.defaults.zoom;
            this.image_loaded = false;
            var me = this;

            if(this.defaults.onStartLoad) {
                this.defaults.onStartLoad.call(this);
            }

            this.img_object.object.unbind('load').removeAttr("src").removeAttr("width").removeAttr("height").css({
                top : 0,
                left : 0
            }).load(function() {
                me.image_loaded = true;
                me.img_object.display_width = me.img_object.orig_width = this.width;
                me.img_object.display_height = me.img_object.orig_height = this.height;

                if(!me.container.hasClass("epaper_cursor")) {
                    me.container.addClass("epaper_cursor");
                }

                if(replace_zoom) {
                    me.set_zoom(replace_zoom);
                }
                else {
                    if(me.defaults.zoom == "fit") {
                        me.fit();
                    }
                    else {
                        me.set_zoom(me.defaults.zoom);
                    }
                }

                if(me.defaults.onFinishLoad) {
                    me.defaults.onFinishLoad.call(me);
                }

                //src attribute is after setting load event, or it won't work
            }).attr("src", src);
        },
        /**
         * fits image in the container
         **/
        page : function() {
            var aspect_ratio = this.img_object.orig_width / this.img_object.orig_height;
            var window_ratio = this.defaults.width / this.defaults.height;
            var choose_left = (aspect_ratio > window_ratio);
            var new_zoom = 0;

            if(choose_left) {
                new_zoom = this.defaults.width / this.img_object.orig_width * 100;
            }
            else {
                new_zoom = this.defaults.height / this.img_object.orig_height * 100;
            }

            this.set_zoom(new_zoom);
        },
        /**
         * fits image in the container
         **/
        fit : function() {
            //new_zoom = this.defaults.width / this.img_object.orig_width * 100;
            this.set_zoom(100);
            this.setCoords(0, 0);
        },
        /**
         * center image in container
         **/
        center : function() {
            this.setCoords(-Math.round((this.img_object.display_height - this.defaults.height) / 2), -Math.round((this.img_object.display_width - this.defaults.width) / 2));
        },
        /**
         *   move a point in container to the center of display area
         *   @param x a point in container
         *   @param y a point in container
         **/
        moveTo : function(x, y) {
            var dx = x - Math.round(this.defaults.width / 2);
            var dy = y - Math.round(this.defaults.height / 2);

            var new_x = this.img_object.x - this.dx;
            var new_y = this.img_object.y - this.dy;

            this.setCoords(new_x, new_y);
        },
        /**
         * set coordinates of upper left corner of image object
         **/
        setCoords : function(x, y) {
            //do nothing while image is being loaded
            if(!this.image_loaded) {
                return;
            }

            //check new coordinates to be correct (to be in rect)
            if(y > 0) {
                y = 0;
            }
            if(x > 0) {
                x = 0;
            }
            if(y + this.img_object.display_height < this.defaults.height) {
                y = this.defaults.height - this.img_object.display_height;
            }
            if(x + this.img_object.display_width < this.defaults.width) {
                x = this.defaults.width - this.img_object.display_width;
            }
            if(this.img_object.display_width <= this.defaults.width) {
                x = -(this.img_object.display_width - this.defaults.width) / 2;
            }
            if(this.img_object.display_height <= this.defaults.height) {
                y = -(this.img_object.display_height - this.defaults.height) / 2;
            }

            this.img_object.x = x;
            this.img_object.y = y;

            this.img_object.object.css("top", y + "px").css("left", x + "px");
        },
        /**
         * convert coordinates on the container to the coordinates on the image
         * (in original size)
         *
         * @return object with fields x,y according to coordinates or false
         * if initial coords are not inside image
         **/
        containerToImage : function(x, y) {
            if(x < this.img_object.x || y < this.img_object.y || x > this.img_object.x + this.img_object.display_width || y > this.img_object.y + this.img_object.display_height) {
                return false;
            }

            return {
                x : $e.descaleValue(x - this.img_object.x, this.current_zoom),
                y : $e.descaleValue(y - this.img_object.y, this.current_zoom)
            };
        },
        /**
         * convert coordinates on the image (in original size) to the coordinates
         * on the container
         *
         * @return object with fields x,y according to coordinates or false
         * if initial coords are not inside image
         **/
        imageToContainer : function(x, y) {
            if(x > this.img_object.orig_width || y > this.img_object.orig_height) {
                return false;
            }

            return {
                x : this.img_object.x + $e.scaleValue(x, this.current_zoom),
                y : this.img_object.y + $e.scaleValue(y, this.current_zoom)
            };
        },
        /**
         * get mouse coordinates on the image
         * @param e - object containing pageX and pageY fields, e.g. mouse event
         * object
         *
         * @return object with fields x,y according to coordinates or false
         * if initial coords are not inside image
         **/
        getMouseCoords : function(e) {
            var img_offset = this.img_object.object.offset();

            return {
                x : $e.descaleValue(e.pageX - img_offset.left, this.current_zoom),
                y : $e.descaleValue(e.pageY - img_offset.top, this.current_zoom)
            };
        },
        /**
         * set image scale to the new_zoom
         * @param new_zoom image scale in %
         **/
        set_zoom : function(new_zoom) {
            if(this.defaults.onZoom && this.defaults.onZoom.call(this, new_zoom) == false) {
                return;
            }

            //do nothing while image is being loaded
            if(!this.image_loaded) {
                return;
            }

            if(new_zoom < this.defaults.zoom_min) {
                new_zoom = this.defaults.zoom_min;
            }
            else
            if(new_zoom > this.defaults.zoom_max) {
                new_zoom = this.defaults.zoom_max;
            }

            /* we fake these values to make fit zoom properly work */
            if(this.current_zoom == "fit") {
                var old_x = Math.round(this.defaults.width / 2 + this.img_object.orig_width / 2);
                var old_y = Math.round(this.defaults.height / 2 + this.img_object.orig_height / 2);
                this.current_zoom = 100;
            }
            else {
                var old_x = -parseInt(this.img_object.object.css("left"), 10) + Math.round(this.defaults.width / 2);
                var old_y = -parseInt(this.img_object.object.css("top"), 10) + Math.round(this.defaults.height / 2);
            }

            var new_width = $e.scaleValue(this.img_object.orig_width, new_zoom);
            var new_height = $e.scaleValue(this.img_object.orig_height, new_zoom);
            var new_x = $e.scaleValue($e.descaleValue(old_x, this.current_zoom), new_zoom);
            var new_y = $e.scaleValue($e.descaleValue(old_y, this.current_zoom), new_zoom);
            new_x = this.defaults.width / 2 - new_x;
            new_y = this.defaults.height / 2 - new_y;

            this.img_object.object.attr("width", new_width).attr("height", new_height);
            this.img_object.display_width = new_width;
            this.img_object.display_height = new_height;

            this.setCoords(new_x, new_y);

            this.current_zoom = new_zoom;
            //this.update_status();
        },
        /**
         * changes zoom scale by delta
         * zoom is calculated by formula: zoom_base * zoom_delta^rate
         * @param Integer delta number to add to the current multiplier rate
         * number
         **/
        zoom_by : function(delta) {
            var closest_rate = this.find_closest_zoom_rate(this.current_zoom);

            var next_rate = closest_rate + delta;
            var next_zoom = this.defaults.zoom_base * Math.pow(this.defaults.zoom_delta, next_rate)
            if(delta > 0 && next_zoom < this.current_zoom) {
                next_zoom *= this.defaults.zoom_delta;
            }

            if(delta < 0 && next_zoom > this.current_zoom) {
                next_zoom /= this.defaults.zoom_delta;
            }

            this.set_zoom(next_zoom);
        },
        /**
         * finds closest multiplier rate for value
         * basing on zoom_base and zoom_delta values from settings
         * @param Number value zoom value to examine
         **/
        find_closest_zoom_rate : function(value) {
            if(value == this.defaults.zoom_base) {
                return 0;
            }

            function div(val1, val2) {
                return val1 / val2
            };

            function mul(val1, val2) {
                return val1 * val2
            };

            var func = (value > this.defaults.zoom_base) ? mul : div;
            var sgn = (value > this.defaults.zoom_base) ? 1 : -1;

            var mltplr = this.defaults.zoom_delta;
            var rate = 1;

            while(Math.abs(func(this.defaults.zoom_base, Math.pow(mltplr, rate)) - value) > Math.abs(func(this.defaults.zoom_base, Math.pow(mltplr, rate + 1)) - value)) {
                rate++;
            }

            return sgn * rate;
        },
        update_container_info : function() {
            this.defaults.height = this.container.height();
            this.defaults.width = this.container.width();
        },
        /**
         *   callback for handling mousdown event to start dragging image
         **/
        drag_start : function(e) {
            // Zhiming
            if(this.defaults.onStartDrag && this.defaults.onStartDrag.call(this, this.getMouseCoords(e)) == false) {
                return false;
            }

            /* start drag event*/
            this.dragged = true;
            this.container.addClass("epaper_drag_cursor");

            this.dx = e.pageX - this.img_object.x;
            this.dy = e.pageY - this.img_object.y;
            return false;
        },
        /**
         *   callback for handling mousmove event to drag image
         **/
        drag : function(e) {
            this.defaults.onMouseMove && this.defaults.onMouseMove.call(this, this.getMouseCoords(e));

            if(this.dragged) {
                this.defaults.onDrag && this.defaults.onDrag.call(this, this.getMouseCoords(e));

                var ltop = e.pageY - this.dy;
                var lleft = e.pageX - this.dx;

                this.setCoords(lleft, ltop);
                return false;
            }
        },
        /**
         *   callback for handling stop drag
         **/
        drag_end : function(e) {
            this.container.removeClass("epaper_drag_cursor");
            this.dragged = false;
        },
        click : function(e) {
            this.defaults.onClick && this.defaults.onClick.call(this, this.getMouseCoords(e));
        },
        /**
         *   create zoom buttons info box
         **/
        createui : function() {
            var me = this;

            $("<div>").addClass("epaper_zoom_in").addClass("epaper_common").addClass("epaper_button").mousedown(function() {
                me.zoom_by(1);
                return false;
            }).appendTo(this.container);

            $("<div>").addClass("epaper_zoom_out").addClass("epaper_common").addClass("epaper_button").mousedown(function() {
                me.zoom_by(-1);
                return false;
            }).appendTo(this.container);

            $("<div>").addClass("epaper_zoom_zero").addClass("epaper_common").addClass("epaper_button").mousedown(function() {
                me.set_zoom(100);
                return false;
            }).appendTo(this.container);

            $("<div>").addClass("epaper_zoom_fit").addClass("epaper_common").addClass("epaper_button").resize().appendTo(this.container);
        },
        update_bar_pos : function() {
            var s = this.defaults.selectors;
            var current_zoom = $(s.epaper_container).data('epaper').current_zoom;
            if(current_zoom <= 100) {
                cur_value = (current_zoom - 25) * 100 / 75;
                $(s.slider_bar).slider("value", cur_value)
            }
            else {
                cur_value = current_zoom;
                $(s.slider_bar).slider("value", cur_value);
            }
        }
        /*iviewer event end*/
    });
    $e.extend({
        meta : function(elems, opts) {
            return $e.fn.meta.get(elems[0], opts);
        },
        scaleValue : function(value, toZoom) {
            return value * toZoom / 100;
        },
        descaleValue : function(value, fromZoom) {
            return value * 100 / fromZoom;
        },
        init : function(o) {
            var opt = $.extend({}, this.defaults, o),
            HTML=engine(opt.engine?opt.engine:opt.engine="jtemplate",'tpl/'+opt.engine+'/epaper.tpl',opt);
            $(opt.epaper_wrapper).html(HTML);
            $(opt.selectors.epaper_container).epaper();
        }
    });
    $.fn.extend({
        mousewheel : function(fn) {
            return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
        },
        unmousewheel : function(fn) {
            return this.unbind("mousewheel", fn);
        }
    });
    return $.epaper;
});
