from typing import List

from schemas import DetectionOut
from vision import det_predictor
from fastapi import APIRouter, File, UploadFile, status

from doctr.io import decode_img_as_tensor

router = APIRouter()


@router.post(
    "/",
    response_model=List[DetectionOut],
    status_code=status.HTTP_200_OK,
    summary="Perform text detection",
)
async def text_detection(file: UploadFile = File(...)):
    """Runs docTR text detection model to analyze the input image"""
    img = decode_img_as_tensor(file.file.read())
    boxes = det_predictor([img])[0]
    return [DetectionOut(box=box.tolist()) for box in boxes[:, :-1]]
