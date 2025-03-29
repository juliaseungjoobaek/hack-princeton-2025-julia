import asyncio
import websockets

async def connect():
    uri = "ws://localhost:8000"  # Replace with your actual server IP
    async with websockets.connect(uri) as websocket:
        message = "Hello, Server!"
        print(f"Sending: {message}")
        await websocket.send(message)

        response = await websocket.recv()
        print(f"Received: {response}")

asyncio.run(connect())
