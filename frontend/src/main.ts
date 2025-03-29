import './style.css';

import { CameraStream } from './camera'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container-center-vertical">
    <div class="container-center-horizontal">
      <div class="container" style="width: 70%;">
        <h1>Camera Stream</h1>
        <div class="streams-container">
          <div class="stream-box">
            <h3>Camera Feed</h3>
            <video id="camera-feed" autoplay playsinline></video>
          </div>
          <div class="stream-box">
            <h3>Server Feed</h3>
            <img id="server-feed" alt="Server feed"/>
          </div>
        </div>
        <div class="controls">
          <button id="startButton">Start Camera</button>
          <button id="stopButton">Stop Camera</button>
          <button id="startStreamButton">Start Streaming</button>
          <button id="stopStreamButton">Stop Streaming</button>
        </div>
        <div class="status">
          <p id="connectionStatus">Not connected</p>
        </div>
      </div>
    </div>
  </div>
`

const videoElement = document.querySelector<HTMLVideoElement>('#camera-feed')!
const serverFeedElement = document.querySelector<HTMLImageElement>('#server-feed')!
const startButton = document.querySelector<HTMLButtonElement>('#startButton')!
const stopButton = document.querySelector<HTMLButtonElement>('#stopButton')!
const startStreamButton = document.querySelector<HTMLButtonElement>('#startStreamButton')!
const stopStreamButton = document.querySelector<HTMLButtonElement>('#stopStreamButton')!
const connectionStatus = document.querySelector<HTMLParagraphElement>('#connectionStatus')!

const WEBSOCKET_URL = 'ws://localhost:8765/ws';
const cameraStream = new CameraStream(videoElement, serverFeedElement);

startButton.addEventListener('click', async () => {
    try {
        await cameraStream.start();
        startButton.disabled = true;
        stopButton.disabled = false;
        startStreamButton.disabled = false;
        
        // Connect to WebSocket server when camera starts
        try {
            cameraStream.connectToServer(WEBSOCKET_URL);
            connectionStatus.textContent = 'Connected to server';
        } catch (error) {
            console.error('Failed to connect to server:', error);
            connectionStatus.textContent = 'Failed to connect to server';
        }
    } catch (error) {
        alert('Failed to start camera. Please make sure you have granted camera permissions.');
    }
});

stopButton.addEventListener('click', () => {
    cameraStream.stop();
    startButton.disabled = false;
    stopButton.disabled = true;
    startStreamButton.disabled = true;
    stopStreamButton.disabled = true;
    connectionStatus.textContent = 'Not connected';
});

startStreamButton.addEventListener('click', () => {
    try {
        cameraStream.startStreaming();
        startStreamButton.disabled = true;
        stopStreamButton.disabled = false;
        connectionStatus.textContent = 'Streaming...';
    } catch (error) {
        alert('Failed to start streaming. Please check server connection.');
    }
});

stopStreamButton.addEventListener('click', () => {
    cameraStream.stopStreaming();
    startStreamButton.disabled = false;
    stopStreamButton.disabled = true;
    connectionStatus.textContent = 'Connected to server';
});

// Initial button states
stopButton.disabled = true;
startStreamButton.disabled = true;
stopStreamButton.disabled = true;
