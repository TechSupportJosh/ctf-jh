FROM python:3.9

COPY ./requirements.txt requirements.txt

RUN pip install -r requirements.txt

RUN mkdir /app && mkdir /app/static
WORKDIR /app
COPY ./app ./app

CMD ["/bin/sh", "-c", "uvicorn app.main:app --host=0.0.0.0 --root-path=/intakectf/api"]