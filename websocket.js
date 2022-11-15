const WebSocketClient = require("websocket").client;

var client = new WebSocketClient();

// Handle connexion error

client.on("connectFailed", function (error) {
  console.log("Connect Error: " + error.toString());
});

// Establish connection

client.on("connect", function (connection) {
  console.log("Connection established!");

  // Initialize service score and final result variables

  var serviceScoreResult;
  var meanTimeResult;

  connection.on("message", function (data) {

    // Handle first output and retrieve service score from the first message

    if (data.utf8Data[0] === "F") {
      let messageString = data.utf8Data.toString();
      console.log(messageString);
      let serviceScore = messageString.split("== ");
      serviceScoreResult = serviceScore;
    }

    // Handle Second output and calculate meantime

    if (data.utf8Data[0] == "[") {
      const arr = JSON.parse(data.utf8Data.toString());
      const newList = arr.filter(
        (e) => e["service score"] == serviceScoreResult[1]
      );
      const listTime = [];
      for (let i in newList) {
        listTime.push(newList[i]["expected delivery time"]);
      }
      meanTimeResult = listTime.reduce((a, b) => a + b, 0) / listTime.length;

      // Send final result message

      connection.send(meanTimeResult);
    }
    console.log("received %s", data.utf8Data);
  });

  // Send message to get list

  connection.send("Give me the list");
});

//Connect to WebSocket

client.connect("ws://35.241.215.201:8000");
