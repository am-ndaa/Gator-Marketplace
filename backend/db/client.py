'''
This file contains the database client setup and connection logic. (Manages and initializes the database connection.)
--> Door to the database client setup and connection logic.
'''

import os
from dotenv import load_dotenv, find_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

_client = None
_db = None

load_dotenv(find_dotenv())  # read .env file, if it exists, LOAD THEN FIND

def get_db():
    global _client, _db
    if _db:
        return _db
    mongo_uri = os.getenv("MONGO_URI")
    db_name = os.environ.get("MONGO_DB", "gator_marketplace")
    _client = MongoClient(mongo_uri, server_api=ServerApi('1'))
    _db = _client[db_name]
    return _db

