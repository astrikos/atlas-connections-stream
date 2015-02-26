var StreamManager = function () {

    var socket;

    this.disconnect = function () {
        this.socket.disconnect()
    }

    this.setup = function (config, forceNew, callback) {
        var server = "http://atlas-stream.ripe.net";
        var that = this;
        var io_config = {path: "/stream/socket.io"};
        //Force new connection
        if (forceNew) {
            io_config.forceNew = true;
        }
        //Connect
        this.socket = io(server, io_config);
        //Send config
        this.socket.on('connect', function () {
            that.socket.emit("atlas_subscribe", config);
        });
        //Logging
        var log = ["Sent config for ", config.stream_type]
        if (config.prb) {
            log.push(" and prb: ");
            log.push(config.prb)
        }
        console.log(log.join(""));

        //Setup callback on messages
        this.socket.on('atlas_probestatus', callback);
    }
};
