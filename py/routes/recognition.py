from py.schemas import RecognitionOut
from py.vision import reco_predictor
from fastapi import APIRouter, File, UploadFile, status

from doctr.io import decode_img_as_tensor

router = APIRouter()


@router.post(
    "/",
    response_model=RecognitionOut,
    status_code=status.HTTP_200_OK,
    summary="Perform text recognition",
)
async def text_recognition(file: UploadFile = File(...)):
    """Runs docTR text recognition model to analyze the input image"""
    img = decode_img_as_tensor(file.file.read())
    out = reco_predictor([img])
    print(out)
    return RecognitionOut(value=out[0][0])
