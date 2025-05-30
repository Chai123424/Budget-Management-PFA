from pymongo import MongoClient
import certifi

uri = "mongodb+srv://ksaidi:KCS1234@cluster0.tiyoz6j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(uri, serverSelectionTimeoutMS=5000, connectTimeoutMS=10000)
print(client.admin.command('ping'))
