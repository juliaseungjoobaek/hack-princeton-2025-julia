export class CameraStream {
    private video: HTMLVideoElement;
    private serverFeed: HTMLImageElement;
    private subtitlesElement: HTMLDivElement;
    private predictionElement: HTMLDivElement;
    private stream: MediaStream | null = null;
    private socket: WebSocket | null = null;
    private canvas: HTMLCanvasElement;
    private streaming: boolean = false;
    private streamInterval: number | null = null;

    constructor(videoElement: HTMLVideoElement, serverFeedElement: HTMLImageElement) {
        this.video = videoElement;
        this.serverFeed = serverFeedElement;
        this.canvas = document.createElement('canvas');
        
        // Create and style subtitles element
        this.subtitlesElement = document.createElement('div');
        this.predictionElement = document.createElement('div');

        this.subtitlesElement.style.textAlign = 'center';
        this.subtitlesElement.style.padding = '10px';
        this.subtitlesElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.subtitlesElement.style.color = 'white';
        this.subtitlesElement.style.borderRadius = '4px';
        this.subtitlesElement.style.margin = '10px 0';

        this.predictionElement.style.textAlign = 'center';
        this.predictionElement.style.padding = '10px';
        this.predictionElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.predictionElement.style.color = 'white';
        this.predictionElement.style.borderRadius = '4px';
        this.predictionElement.style.margin = '10px 0';
        
        // Insert subtitles element after the server feed
        this.serverFeed.parentElement?.appendChild(this.subtitlesElement);
        this.serverFeed.parentElement?.appendChild(this.predictionElement);
    }

    async start() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });
            this.video.srcObject = this.stream;
            await this.video.play();
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw error;
        }
    }

    connectToServer(serverUrl: string) {
        try {
            this.socket = new WebSocket(serverUrl);
            
            this.socket.onopen = () => {
                console.log('Connected to server');
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.frame_data) {
                        console.log("received frame", data.frame_number);
                        this.serverFeed.src = data.frame_data;
                    }
                    if (data.subtitle) {
                        console.log("received subtitle", data.subtitle);
                        this.subtitlesElement.textContent = data.subtitle;
                    }
                    if (data.predicted) {
                        console.log(`received prediction ${data.predicted}`);
                        this.predictionElement.textContent = data.predicted;
                    }
                } catch (error) {
                    console.error('Error processing server message:', error);
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                throw error;
            };

            this.socket.onclose = (event) => {
                console.log('Disconnected from server:', event.reason);
                this.streaming = false;
                if (this.streamInterval) {
                    window.clearInterval(this.streamInterval);
                    this.streamInterval = null;
                }
            };

            setTimeout(() => {
                if (this.socket?.readyState !== WebSocket.OPEN) {
                    this.socket?.close();
                    throw new Error('Connection timeout');
                }
            }, 5000);

        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            throw error;
        }
    }

    startStreaming() {        
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            throw new Error('No connection to server');
        }

        this.streaming = true;
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        const context = this.canvas.getContext('2d');

        // Stream frames every 100ms (10 fps)
        this.streamInterval = window.setInterval(() => {
            if (!this.streaming) return;

            context?.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            // Convert to blob and send directly
            this.canvas.toBlob((blob) => {
                if (blob && this.socket && this.streaming) {
                    this.socket.send(blob);
                }
            }, 'image/jpeg', 0.7); // Adjust quality (0.7 = 70%) for performance
        }, 100);
    }

    stopStreaming() {
        this.streaming = false;
        if (this.streamInterval) {
            window.clearInterval(this.streamInterval);
            this.streamInterval = null;
        }
    }

    stop() {
        this.stopStreaming();
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.video.srcObject = null;
        this.subtitlesElement.textContent = '';
    }
} 