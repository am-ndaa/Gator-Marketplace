'''
This file contains the database client setup and connection logic. (Manages and initializes the database connection.)
--> Door to the database client setup and connection logic.
 It hides all connection details so other files never have to worry about how the database works.
'''

import os
from dotenv import load_dotenv, find_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

_client = None
_db = None

load_dotenv(find_dotenv())  # read .env file, if it exists, LOAD THEN FIND

def get_db():
    # Returns reference to the database, initializing connection if needed.
    global _client, _db
    if _db is not None:
        return _db
    mongo_uri = os.getenv("MONGO_URI")
    db_name = os.getenv("MONGO_DB", "gator_marketplace")
    try:
        _client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        # Test connection immediately
        _client.admin.command('ping')
        _db = _client[db_name]
        print(f"✅ Connected to MongoDB: {db_name}")
        return _db
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        raise

def get_collection(name: str):
    """Shortcut to get a collection from the DB."""
    return get_db()[name]

def ping():
    """Check connection health by pinging the database."""
    return get_db().command("ping")

if __name__ == "__main__":
    print(ping())