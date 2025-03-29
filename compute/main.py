from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import os
from datetime import datetime
import aiofiles
import base64
from fastapi import UploadFile, File
from PIL import Image
import io

app = FastAPI()


@app.post("/classify")
async def classify_character(image: UploadFile = File(...)):
    # Read the contents of the uploaded file
    contents = await image.read()
    
    # Create a PIL Image from the bytes
    img = Image.open(io.BytesIO(contents))
    
    # Now you can work with the PIL Image object
    # TODO: Add your classification logic here
    
    return {"character": "A"}


@app.get("/")
async def root():
    return {"message": "Video streaming server is running"}
