
define(function (require) {
    var subscribe = function (channel, fn) {
        var channels = this.channels;
        if (!channels[channel])
            channels[channel] = [];
        channels[channel].push({
            context: this,
            callback: fn
        });
        return this;
    }, publish = function (channel) {
        var channels = this.channels;
        if (!channels[channel])
            return false;
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, l = channels[channel].length; i < l; i++) {
            var subscription = channels[channel][i];
            subscription.callback.apply(subscription.context, args);
        }
        return this;
    }, dispose = function () {
        this.channels = {};
    }, unsubscribe = function (channel) {
        var channels = this.channels;
        if (!channels[channel]) {
            return;
        }
        delete channels[channel];
        return this;
    };
    return {
        publish: publish,
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        dispose: dispose,
        installTo: function (obj) {
            obj.channels = {};
            obj.subscribe = subscribe;
            obj.publish = publish;
            obj.destory = dispose;
            obj.unsubscribe = unsubscribe;
        }
    };
});