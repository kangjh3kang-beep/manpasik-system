from fastapi import FastAPI
import os

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "Manpasik System is Running!"}


@app.post("/analyze")
def analyze_data(data: dict):
    return {"risk_level": "Normal", "score": 98.5}








