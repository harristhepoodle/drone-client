var lastReading;
var droneIP;
var droneControlIterationsPerSecond;
if(typeof(droneControlIterationsPerSecond = process.argv[3]) == undefined)
	droneControlIterationsPerSecond = 60;
var clientOptions = {
	ip: droneIP
};
var errorCallback = function(error) {
	if (error) {
		console.log(error);	
	}

};
if(typeof process.argv[2] == 'undefined') {
	console.log('You have not specified the ip of the drone!');
	console.log('Using default ip of 192.168.1.1');
	droneIP = "192.168.1.1";
} else {
	droneIP = process.argv[2];
}
console.log("Starting server...");
console.log("..");
console.log("..");
console.log("...");
console.log("....");
console.log(".....");

//import modules

var arDrone = require('ar-drone');
console.log("\nImported arDrone");

var droneClient = arDrone.createClient(clientOptions);
console.log("\nImported droneClient");

var droneOptions_navData = {
	key: 'general:navdata_demo',
	value: 'FALSE',
	timeout: 1000
};
droneClient.config(droneOptions_navData, errorCallback);

var express = require('express');
console.log("\nImported express");

var app = express();
console.log("\nImported App");

app.use(express.static('public'))

var http = require('http').Server(app);

var io = require('socket.io')(http);

require('dronestream').listen(http, clientOptions);
console.log("Connect to camera feed from Drone");
var fileSystem = require('fs');
//check that modules are imported
console.log("........................");
console.log("All modules imported successfully");

function Connection(socketToUse, uniqueID) {
	this.socket = socketToUse;
	this.id = uniqueID;
}
var openConnections = [];
var uniqueSocketID = 0;

var instructionStack = [];

http.listen(8185, function() {
	console.log("Successfully connected and listening to port 8185.")
});
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});
console.log("\nGot files from public")

//connecting to server

io.on('connect', function(socket) {

	var thisSocketID = uniqueSocketID++;
	openConnections.push(new Connection(socket, thisSocketID));
	console.log("Someone connected to the server! Added their ID as: " + uniqueSocketID);

	//disconnecting from server

	socket.on('disconnect', function() {
		console.log(" Someone has disconnected from the server with a ID of: " + thisSocketID);
		openConnections = openConnections.filter(function(element) {
			if(element.id !== thisSocketID)
				return element;
		});
		console.log("There are now: " + openConnections.length + " Connection(s)");

	});
	//instructions
	socket.on('drone-instruction', function(instructionPackage) {
		console.log("Someone issued the instruction: " + instructionPackage);
		var droneInstruction = JSON.parse(instructionPackage);
		instructionStack.push(droneInstruction);
	});
});
droneClient.on('navdata', function(navdata) {
	if(navdata.demo !== undefined) {
		fileSystem.writeFile('readings.json', JSON.stringify(navdata, 'null', 4), errorCallback);
		var data =  {
			batteryPercentage: navdata.demo.batteryPercentage,
			altitude: navdata.demo.altitude,
			rotation: {
				pitch: navdata.demo.rotation.pitch,
				yaw: navdata.demo.rotation.yaw,
				roll: navdata.demo.rotation.roll
			},
			velocity: {
				x: navdata.demo.velocity.x,
				y: navdata.demo.velocity.y,
				z: navdata.demo.velocity.z
			}//,
			//flystate: navdata.demo.flystate,
		};
		openConnections.forEach(function(element) {
			element.socket.emit('drone-info', JSON.stringify(data));
		});
		lastReading = data;
	}
});

var setPoint = {
	translation: {
		x: 0,
		y: 0,
		z: 0
	}
};
var errorControllerConstant = {
	p: 0.1
};

var timeMiliPerIteration = (1 / droneControlIterationsPerSecond) * 1000;

function droneControl() {
	while(instructionStack.length > 0) {
		var droneInstruction = instructionStack.pop();
	switch(droneInstruction.instruction) {
			
			//manual controls

			case 'FORWARDS':
			setPoint.translation.x += 0.5;
			break;

			case 'BACKWARDS':
			setPoint.translation.x -= 0.5;
			break;

			case 'RIGHT':
			setPoint.translation.y += 0.5;
			break;

			case 'LEFT':
			setPoint.translation.y -= 0.5;
			break;

			case 'UP':
			setPoint.translation.z += 0.5;
			break;

			case 'DOWN':
			setPoint.translation.z -= 0.5;
			break;

			case 'ROTATE_RIGHT':
			droneClient.counterClockwise(0);
			droneClient.clockwise(0.5);
			break;

			case 'ROTATE_LEFT':
			droneClient.clockwise(0);
			droneClient.counterClockwise(0.5);
			break;


			//automated controls

			

			case 'RESET':
			droneClient.disableEmergency();
			break;

			case 'LAUNCH':
			droneClient.takeoff();
			//console.log("go");
			setPoint.translation.z = 2;
			break;

			case 'LAND':
			droneClient.stop();
			setPoint.translation.z = 0;
			droneClient.land();
			break;

			case 'HOVER':
			droneClient.stop();
			break;

			//automated animations

			case 'FRONTFLIP':
			droneClient.animate('flipAhead', 2000);
			break;

			case 'ANIMATE_SQUARE':
			droneClient.takeoff();
			droneClient.after(2000, function() {
				this.left(0.1);
			}).after(1000, function() {
				this.left(0);
				this.front(0.1);
			}).after(1000, function() {
				this.front(0);
				this.right(0.1);
			}).after(1000, function() {
				this.right(0);
				this.back(0.1);
			}).after (1000, function() {
				this.back(0);
				this.stop();
			}).after(2000, function() {
				this.land();
			});
			break;
			case 'ANIMATE_TRIANGLE':
			droneClient.takeoff();
			droneClient.after(2000, function() {
				this.right(0.2);
			}).after(1000, function() {
				this.right(0);
				this.front(0.1);
				this.left(0.1);
			}).after(1000, function() {
				this.front(0);
				this.left(0);
				this.back(0.1);
				this.left(0.1);
			}).after(1000, function() {
				this.back(0);
				this.left(0);
				this.stop();
			}).after(2000, function() {
				this.land();
			});

			/*case 'ANIMATE_DANCE':
			droneClient.takeoff();
			droneClient.after(5000, function(){
				this.
			})*/
			case 'LED_BLINK_RED_AND_GREEN':
			droneClient.animateLeds('blinkGreenRed', 5, 10);
			break;

			case 'BARREL_ROLL_LEFT':
			droneClient.animate('flipLeft', 2000);
			break;

			case 'BARREL_ROLL_LEFT':
			droneClient.animate('flipRight', 2000);
			break;

			case 'BACKFLIP':
			droneClient.animate('flipBehind', 2000);
			break;

			case 'WAVE':
			droneClient.animate('wave', 2000);
			break;
		}
	}

	if(typeof lastReading !== 'undefined'){
		position.z = lastReading.altitude;
		position.x += lastReading.velocity.x * timeMiliPerIteration/1000;
		position.y += lastReading.velocity.y * timeMiliPerIteration/1000;
		var error = {
			x: setPoint.translation.x - position.x,
			y: setPoint.translation.y - position.y,
			z: setPoint.translation.z - position.z

		}
		var pControl =  {
			z: error.z * errorControllerConstant.p,
			y: error.y * errorControllerConstant.p,
			x: error.x * errorControllerConstant.p
		};

		if(pControl.z >= 0 ) {
			//console.log("velocity is " + lastReading.velocity.y);
			//console.log(error.z);
			droneClient.down(0);
			droneClient.up(pControl.z);
		} else {
			droneClient.up(0);
			droneClient.down(pControl.z);
		} 
		if(pControl.x >= 0) {
			droneClient.back(0);
			droneClient.forward(pControl.x);
		} else {
			droneClient.forward(0);
			droneClient.back(-pControl.x);
		}
		if(pControl.y >= 0) {
			droneClient.left(0);
			droneClient.right(pControl.y);
		} else {
			droneClient.right(0);
			droneClient.left(-pControl.y);
		}



	}
};
setInterval(droneControl, timeMiliPerIteration);
