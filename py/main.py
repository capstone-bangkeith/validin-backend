from fastapi import FastAPI
from py.routes import detection, ocr, recognition

app = FastAPI(title="Validin Backend Snek")


@app.get("/")
async def read_root():
    return {"Hello": "World"}


# @app.post("/ocr/")
# async def ocr(ktp: UploadFile, token: str = Form(None)):
#     return {"filename": ktp.filename, "token": token}

app.include_router(recognition.router, prefix="/recognition", tags=["recognition"])
app.include_router(detection.router, prefix="/detection", tags=["detection"])
app.include_router(ocr.router, prefix="/ocr", tags=["ocr"])
