FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
WORKDIR /app
EXPOSE 8080

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libsndfile1 \
    && pip install --no-cache-dir flwr torch torchvision numpy pandas scikit-learn firebase-admin flask flask-cors werkzeug \
    && apt-get purge -y --auto-remove gcc \
    && rm -rf /var/lib/apt/lists/*

COPY server.py client.py /app/
COPY backend/ /app/backend/

CMD ["python", "server.py"]
