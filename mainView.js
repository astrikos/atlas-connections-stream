var PageView = function () {

    var paused = false;

    var greenIcon = L.icon({
        iconUrl: 'https://api.tiles.mapbox.com/v3/marker/pin-s-marker+00FF00.png'
    });

    var redIcon = L.icon({
        iconUrl: 'https://api.tiles.mapbox.com/v3/marker/pin-s-marker+FF0000.png'
    });

    var map;

    function createMap() {
        this.map = L.map('map').setView([51.505, -0.09], 5);
        var popup = L.popup();

        // add an OpenStreetMap tile layer
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }

    function pauseStream() {
        paused = !paused;
        document.getElementById("pause").innerHTML = paused ? "Start" : "Pause";
        document.getElementById("pause").active = paused
    }

    this.onMessage = function (message) {
        message = JSON.parse(message)
        if (!paused) {
            updateTable(message);
            if (probesLocation.hasOwnProperty(message.prb_id)) {
                displayNewPosition(probesLocation[message.prb_id][0], probesLocation[message.prb_id][1], "Probe ID: " + message.prb_id, message.event)
            }

        }
    }

    function displayNewPosition(lat, lng, body, event) {
        if (typeof marker != 'undefined') {
            this.map.removeLayer(marker);  // delete previous marker
        }
        var icon = event == "C" ? greenIcon : redIcon;
        marker = L.marker([lat, lng], {icon: icon}).addTo(this.map).bindPopup(body).openPopup();  // add new marker
        this.map.setView([lat, lng], 3);
    }

    function updateTable(message) {
        var connections = document.getElementById("connections-table");
        var rowCount = connections.rows.length;
        if (rowCount >= 30) {
            connections.deleteRow(rowCount - 1);
        }
        var row = connections.insertRow(0);
        if (message.event == "C") {
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
        var day = moment.unix(message.timestamp)

        var statusChangedAt = day.format('MMMM Do, h:mm:ss a');
        status = message.event == "C" ? "Connected to " : "Disconnected from ";

        cell1.innerHTML = status + message.controller_name + " at " + statusChangedAt;
    }

    this.init = function () {
        createMap()

        $('#pause').click(pauseStream)

        $('form').submit(function () {
            streamManager.disconnect();
            var prbID = $("#prbID").val()
            streamManager.setup({ stream_type: "connection", prb: prbID }, true, this.onMessage);
            return false;
        });
    }
}
