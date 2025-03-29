import asyncio
import websockets

async def handler(websocket):
    async for message in websocket:
        print(f"Received: {message}")
        await websocket.send(f"Echo: {message}")

async def main():
    server = await websockets.serve(handler, "0.0.0.0", 8000)
    print("WebSocket server running on ws://0.0.0.0:8000")
    await server.wait_closed()

asyncio.run(main())
