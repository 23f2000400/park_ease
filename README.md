text
# How to Run the Code

## 1. Clone the Repository
git clone https://github.com/23f2000400/parking_app
cd mad2project



## 2. Set Up Virtual Environment
python3 -m venv venv
source venv/bin/activate



## 3. Install Dependencies
pip install -r requirements.txt



## 4. Set Up Redis (for Celery)
Make sure Redis is installed. Start the server:
redis-server



## 5. Run Flask Server
In a new terminal (with virtual environment activated):
python app.py



## 6. Start Celery Worker
In another terminal (also with the virtual environment activated):
celery -A app.celery worker --loglevel=info



## 7. Open in Browser
Go to:
http://127.0.0.1:5000



---
