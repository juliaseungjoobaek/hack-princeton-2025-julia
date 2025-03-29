from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import os
from datetime import datetime
import aiofiles
import base64
from fastapi import UploadFile, File

app = FastAPI()


@app.post("/classify")
async def classify_character(image: UploadFile = File(...)):
    # TODO complete later...
    return {"character": "A"}


@app.get("/")
async def root():
    return {"message": "Video streaming server is running"}
