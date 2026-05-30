FROM python:3.11

WORKDIR /app

# системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# зависимости python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# код
COPY . .

CMD ["uvicorn", "my_fast_api:f_api", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]

