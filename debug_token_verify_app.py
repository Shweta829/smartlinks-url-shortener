import jwt
from app import app

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc3ODA1OTMzNywianRpIjoiNWMyZGMwNTctYzQ2Yy00NDJkLTgyMGEtZGNkNjM5ZThjMTE5IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6OCwibmJmIjoxNzc4MDU5MzM3LCJjc3JmIjoiYTcyYTI3OTItMjk0Mi00ZjNkLTk2OTQtNmYwNmE4YTY3MzNlIiwiZXhwIjoxNzc4NjY0MTM3fQ.9wwjT7EhawOsn0KfSS0VsGkld-rUBluxR9d66O_h2Ek'
secret = app.config.get('JWT_SECRET_KEY')
print('secret repr', repr(secret))
try:
    decoded = jwt.decode(token, secret, algorithms=['HS256'])
    print('decoded', decoded)
except Exception as e:
    print('error', type(e).__name__, e)
