define(function(require) {
    return function(type, tpl, data,cb) {
        var type = type || "jtemplate", $ = require('jquery');
        switch(type) {
            case "jtemplate":
                var $ = require('jquery'), jtem = 'js/helper/order!lib/jquery-jtemplates_uncompressed', tem = $.createTemplateURL(tpl);
                cb($.processTemplateToText(tem, data));
                break;
            case "mustache":
                var Mustache = require('js/lib/mustache');
                $.ajax({
                    url : tpl,
                    type:"GET",
                    dataType:"json",
                    complete:function(d){
                      cb(Mustache.to_html(d.responseText,data));
                    }
                });
                break;
            case "coffeekup":
                break;
            default:
                break;
        }
    };
});
