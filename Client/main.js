
require(['js/widget/epaper'], function(epaper) {
    epaper.init({
        epaper_wrapper : '#epaper_container',
        src : "imgs/eg_epaper.jpg",
        engine : 'jtemplate'
    });
});
define(function(require) {
    var lamp = require("js/helper/nls/lamp");
    console.log(lamp.testMessage);
});
/*
 require(["some/module", "text!some/module.html!strip", "text!some/module.css"],
 function(module, html, css) {
 //the html variable will be the text
 //of the some/module.html file
 //the css variable will be the text
 //of the some/module.css file.
 }
 );
 */

/*
 * this type of code can not be optimized
 * 
require(["js/helper/text!package.json?callback=define"], function(data) {
    //The dta object will be the API response for the
    //JSONP data call.
    console.log(data);
});
*/