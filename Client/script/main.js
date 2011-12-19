require(['jquery','js/widget/epaper','js/helper/order!lib/jquery-jtemplates_uncompressed','lib/jquery-ui'],function($p){
	$p.epaper.init({epaper_wrapper:'#container',src: "imgs/eg_epaper.jpg"});
});
define(function(require) {
  var lamp=require("js/nls/lamp");
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
require(["js/helper/text!http://cns-812:8111/et_refac/client/package.json?callback=define"],
    function (data) {
        //The dta object will be the API response for the
        //JSONP data call.
        console.log(data);
    }
);