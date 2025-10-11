from dotenv import load_dotenv, find_dotenv
from backend.db.client import get_db

from uuid import uuid4

load_dotenv(find_dotenv())  # read .env file, if it exists, LOAD THEN FIND

def main():
    db = get_db()

    # 1. Ping the server
    try:
        db.command("ping")
        print("✅ Ping successful — connected to MongoDB!")
    except Exception as e:
        print("❌ Ping failed:", e)
        return

    # 2. Insert a test document into a temp collection
    test_coll = db["test_collection"]
    marker_id = str(uuid4())
    test_doc = {"_test_id": marker_id, "hello": "world"}
    result = test_coll.insert_one(test_doc)
    print(f"✅ Inserted test document with _id: {result.inserted_id}")

    # 3. Read the document back
    found = test_coll.find_one({"_test_id": marker_id})
    if found:
        print("✅ Found test document:", found)
    else:
        print("❌ Failed to find inserted document.")
        return

    # 4. Delete the test document
    delete_result = test_coll.delete_one({"_test_id": marker_id})
    if delete_result.deleted_count == 1:
        print("✅ Successfully deleted test document.")
    else:
        print("❌ Failed to delete test document.")

    print("🎉 All MongoDB tests passed!")

if __name__ == "__main__":
    main()