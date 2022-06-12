from typing import List

from schemas import OCROut
from vision import predictor
from fastapi import APIRouter, File, UploadFile, status

from doctr.io import decode_img_as_tensor

router = APIRouter()


@router.post("/", status_code=status.HTTP_200_OK, summary="Perform OCR")
async def perform_ocr(file: UploadFile = File(...)):
    """Runs docTR OCR model to analyze the input image"""
    img = decode_img_as_tensor(file.file.read())
    out = predictor([img])
    for i in range(len(out.pages[0].blocks)):
        for j in range(len(out.pages[0].blocks[i].lines)):
            print(i, j)
            print(out.pages[0].blocks[i].lines[j].words)

    try:
        nik = out.pages[0].blocks[2].lines[0].words[0].value
    except IndexError:
        nik = ""

    try:
        nama = " ".join(word.value for word in out.pages[0].blocks[2].lines[1].words)
    except IndexError:
        nama = ""

    try:
        ttl = "".join(word.value for word in out.pages[0].blocks[2].lines[2].words)
    except IndexError:
        ttl = ""

    try:
        jenis_kelamin = out.pages[0].blocks[2].lines[3].words[0].value
    except IndexError:
        jenis_kelamin = ""

    try:
        alamat = " ".join(word.value for word in out.pages[0].blocks[2].lines[4].words)
    except IndexError:
        alamat = ""

    try:
        rt_rw = " ".join(word.value for word in out.pages[0].blocks[2].lines[5].words)
    except IndexError:
        rt_rw = ""

    try:
        kel_desa = " ".join(
            word.value for word in out.pages[0].blocks[2].lines[6].words
        )
    except IndexError:
        kel_desa = ""

    try:
        kecamatan = " ".join(
            word.value for word in out.pages[0].blocks[2].lines[7].words
        )
    except IndexError:
        kecamatan = ""

    try:
        agama = " ".join(word.value for word in out.pages[0].blocks[2].lines[8].words)
    except IndexError:
        agama = ""

    try:
        status_perkawinan = " ".join(
            word.value for word in out.pages[0].blocks[2].lines[9].words
        )
    except IndexError:
        status_perkawinan = ""

    try:
        pekerjaan = " ".join(
            word.value for word in out.pages[0].blocks[2].lines[10].words
        )
    except IndexError:
        pekerjaan = ""

    res = {
        "nik": nik,
        "nama": nama,
        "ttl": ttl,
        "jenis_kelamin": jenis_kelamin,
        "alamat": alamat,
        "rt_rw": rt_rw,
        "kel_desa": kel_desa,
        "kecamatan": kecamatan,
        "agama": agama,
        "status_perkawinan": status_perkawinan,
        "pekerjaan": pekerjaan,
    }
    return res
