# drone client
# Web based client for controlling ar drone 2.0
Please be aware that the client is new and is not completley perfect.
# Getting started:
First you need to install node.js and also npm, visit <a href="https://nodejs.org/en/">this</a> website for more info.
Before you start controlling the drone, please install the node modules as the client depends on them to control the drone, here are the files you need to install:<br>
Install the files by opening a command window a the location of the main directory, and typing npm install, then the following modules:<br>
express<br>
ar-drone<br>
fs<br>
dronestream <br>
http <br>
socket.io <br>

Then navigate to the public folder, open a command window and type 'node server.js' to star the server<br><br>

# Controlling the drone
There are two ways you can control the drone, the first way is to control the drone using the buttons on screen, as well as the menu at the top for extra movements like flips or dance moves.<br>
The other option is to use the keypad. w = go up, s = go down a = rotate left (anticlockwise), d = rotate right (clockwise), i,k,j,l = forwards, backwards, left, right. Other buttons are labelled at the nav bar. All visual controls, which are on the screen, or in a sub menu in the nav bar are labbeled with their appropriate characters. Here is what the client looks like (as of 12th August 2016)
<br>
<img src="https://github.com/harristhepoodle/drone-client/blob/master/Untitled.png"></img>
<br>
The grey/black rectangle is where the drone video stream will be. The readings in the bottom left corner will be replaced with the actual readings when you have connected to the drones wifi and started the server.
<br>
<strong>Original client created by harristhepoodle</strong>
