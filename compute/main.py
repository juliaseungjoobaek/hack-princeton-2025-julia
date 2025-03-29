from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import os
import random
from datetime import datetime
import aiofiles
import base64
from fastapi import UploadFile, File
from PIL import Image
from sign_langauge_predictor import SignLanguagePredictor
import io
import cv2
import numpy as np

app = FastAPI()


predictor = SignLanguagePredictor('./model.p') # hardcoded for now


@app.post("/classify")
async def classify_character(image: UploadFile = File(...)):
    # Read the contents of the uploaded file
    contents = await image.read()
    
    # Create a PIL Image from the bytes
    img = Image.open(io.BytesIO(contents))
    
    frame = np.array(img.convert('RGB'))
    prediction, _ = predictor.predict(frame)
    print('predicted character', prediction)
    return {"character": prediction}


@app.get("/")
async def root():
    return {"message": "Video streaming server is running"}
