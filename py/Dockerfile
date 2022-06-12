FROM python:bullseye

WORKDIR /code

COPY requirements.txt requirements.txt

RUN apt-get update && apt-get install -y python3-opencv
RUN pip3 install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
