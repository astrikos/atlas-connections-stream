var PageView = function (streamManager) {

    var paused = false;

    //var greenIcon = L.icon({
    //    "iconAnchor": [15, 15],
    //    iconUrl: 'https://api.tiles.mapbox.com/v3/marker/circle-s-marker+00FF00.png'
    //});
    //
    //var redIcon = L.icon({
    //    "iconAnchor": [8, 15],
    //    iconUrl: 'https://api.tiles.mapbox.com/v3/marker/circle-s-marker+FF0000.png'
    //});

    var map;

    var markers = [];

    var that = this;

    function createMap() {
        map = L.map('map').setView([0, 0], 2);
        var popup = L.popup();

        // add an OpenStreetMap tile layer
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }

    function pauseStream() {
        paused = !paused;
        document.getElementById("pause").innerHTML = paused ? "Start" : "Pause";
        document.getElementById("pause").active = paused;
    }

    this.onMessage = function (message) {
        if (!paused) {
            updateTable(message);
            if (probesLocation.hasOwnProperty(message.prb_id)) {
                displayNewPosition(probesLocation[message.prb_id][0], probesLocation[message.prb_id][1], "Probe ID: " + message.prb_id, message.event);
            }

        }
    };

    function displayNewPosition(lat, lng, body, event) {
        //var icon = event == "connect" ? greenIcon : redIcon;
        var marker;

        marker = L.circleMarker([lat, lng], {
            radius: 4,
            opacity: 1,
            fillOpacity: 1,
            color: (event == "connect") ? "#2FB000" : "#CF0000"
        });
        marker = marker.addTo(map).bindPopup(body).openPopup();  // add new marker
        markers.push(marker);
    }

    function clearMap() {
        var marker = markers.pop();
        while (marker) {
            map.removeLayer(marker);
            marker = markers.pop();
        }
    }

    function updateTable(message) {
        var connections = document.getElementById("connections-table");
        var rowCount = connections.rows.length;
        if (rowCount >= 30) {
            connections.deleteRow(rowCount - 1);
        }
        var row = connections.insertRow(0);
        if (message.event == "connect") {
            row.setAttribute("class", "success");
        }
        else {
            row.setAttribute("class", "danger");
        }

        var cell0 = row.insertCell(0);
        cell0.setAttribute("width", "15%");
        cell0.innerHTML = '<a href="https://atlas.ripe.net/probes/' + message.prb_id + '/" target="_blank">' + message.prb_id + '</a>';

        var cell1 = row.insertCell(1);
        cell1.setAttribute("width", "50%");
        var day = moment.unix(message.timestamp);

        var statusChangedAt = day.format('MMMM Do, h:mm:ss a');
        var status = message.event == "connect" ? "Connected to " : "Disconnected from ";

        cell1.innerHTML = status + message.controller_name + " at " + statusChangedAt;
    }

    this.init = function () {
        createMap();

        $('#pause').click(pauseStream);
        $('#clear-map').click(clearMap);

        $('form').submit(function () {
            clearMap();
            var config = { stream_type: "probestatus" };
            var prbID = $("#prbID").val();
            var asn = $("#asn").val();
            if (prbID) {
                config.prb = prbID;
            }

            if (asn) {
                config.equalsTo = {asn: asn};
            }

            streamManager.setup(config, true, that.onMessage);
            return false;
        });
    };
};
