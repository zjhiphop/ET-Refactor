define(function(require) {
    return function(type,tpl,data) {
        var type = type || "jtemplate",t="js/helper/text!"+tpl;
        switch(type) {
            case "jtemplate":
                var $ = require('jquery'), jtem = 'js/helper/order!lib/jquery-jtemplates_uncompressed',
                tem=$.createTemplateURL(tpl);
                return $.processTemplateToText(tem,data);
                break;
            case "mustache":
                var Mustache = require('lib/mustache.js'), 
                tp =require("js/helper/text!tpl/mustache/epaper.tpl");
                return Mustache.to_html(tp, data).replace(/^\s*/mg, '');
                break;
            case "coffeekup":
                break;
            default:
                break;
        }
    };
});
