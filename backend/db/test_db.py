import os
import sys
import uuid
from backend.db.client import get_db


def main():
    # Helpful debug info for users
    mongo_uri = os.getenv('MONGO_URI')
    db_name = os.getenv('MONGO_DB', 'gator_marketplace')
    print(f"Using MONGO_URI={'(not set)' if not mongo_uri else mongo_uri}")
    print(f"Using MONGO_DB={db_name}")

    try:
        db = get_db()
    except Exception as e:
        print("Failed to connect to MongoDB:", e)
        sys.exit(2)

    try:
        # list collections (safe op)
        cols = list(db.list_collection_names())
        print("Collections in DB:", cols)

        # round-trip insert/read to a test collection
        test_coll = db.get_collection('test_connection')
        test_id = str(uuid.uuid4())
        doc = {"_id": test_id, "status": "ok"}
        test_coll.insert_one(doc)
        found = test_coll.find_one({"_id": test_id})
        if not found:
            print("Inserted document not found — something is wrong")
            sys.exit(3)
        print("Round-trip insert/read succeeded:", found)

        # cleanup
        test_coll.delete_one({"_id": test_id})

    except Exception as e:
        print("Error during DB operations:", e)
        sys.exit(4)

    print("MongoDB connection test passed")


if __name__ == '__main__':
    main()
