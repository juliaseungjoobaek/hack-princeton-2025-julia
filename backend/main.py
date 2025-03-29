from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import os
from datetime import datetime
import aiofiles
import base64

app = FastAPI()

# Configure CORS to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow any origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a directory to store received frames
UPLOAD_DIR = "received_frames"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # Create a session directory for this connection
    session_dir = os.path.join(UPLOAD_DIR, datetime.now().strftime("%Y%m%d_%H%M%S"))
    os.makedirs(session_dir, exist_ok=True)
    
    frame_count = 0
    try:
        while True:
            # Receive the binary frame data
            frame_data = await websocket.receive_bytes()
            
            # Save the frame
            # not save just to save memory...
            # frame_filename = os.path.join(session_dir, f"frame_{frame_count:06d}.jpg")
            # async with aiofiles.open(frame_filename, 'wb') as f:
            #     await f.write(frame_data)
            
            frame_count += 1
            
            # Send the frame back to the client
            # Convert binary data to base64 string for sending via WebSocket
            base64_frame = base64.b64encode(frame_data).decode('utf-8')
            await websocket.send_json({
                "frame_number": frame_count,
                "frame_data": f"data:image/jpeg;base64,{base64_frame}"
            })
            print(f"Sent frame {frame_count}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await websocket.close()

@app.get("/")
async def root():
    return {"message": "Video streaming server is running"}
