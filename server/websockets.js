const WebSocket = require('ws');


exports.listen = function (server, app) {
    const wss = new WebSocket.Server({server: server});

    console.info('WebSocket server started...');

    app.activeSockets = [];

    wss.on("connection", function (ws) {

        app.activeSockets.push(ws);

        console.log(`New websocket pushed, active socket count: ${app.activeSockets.length}`);

        ws.on('message', msg => {
            console.log(msg);
        });
        ws.on('close', connection => {
            console.log('closing connection');
            app.activeSockets.splice(app.activeSockets.indexOf(ws), 1);
        });
    });
};