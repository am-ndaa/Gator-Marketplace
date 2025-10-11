from datetime import datetime
from bson import ObjectId
import json

from django.test import TestCase
from rest_framework.test import APIClient

from backend.db.client import get_db, get_collection


class ListingsIntegrationTests(TestCase):
	"""Integration-style tests for the listings endpoints.

	These tests talk to the real MongoDB configured via MONGO_URI/MONGO_DB.
	They create and tear down documents in collections used by the app so they
	are safe to run repeatedly (they clean up after themselves).

	Notes:
	- Make sure environment variable MONGO_URI is set in your environment or
	  in a .env file under the repo root so `backend.db.client.get_db()` can
	  connect.
	- Tests use the DRF `APIClient` and `force_authenticate` with a tiny
	  dummy user object that carries an `email` attribute (your real auth
	  stack may differ; adjust as needed).
	"""

	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		cls.db = get_db()
		# use the module-level helper imported from backend.db.client
		cls.users = get_collection("users")
		cls.listings = get_collection("listings")
		cls.test_marker = {"_test_run": str(ObjectId())}  # unique marker to find our docs

	def setUp(self):
		# API client used to call the views
		self.client = APIClient()

		# Create a test user document in MongoDB. We store its ObjectId so
		# we can assert seller_id usage and clean it up later.
		self.user_doc = {
			**self.test_marker,
			"email": "test_user@example.com",
			"first_name": "Test",
			"last_name": "User",
			"profile_picture_url": "http://example.com/avatar.png",
			"joined_at": datetime.utcnow(),
		}
		res = self.users.insert_one(self.user_doc)
		self.user_id = res.inserted_id

	def tearDown(self):
		# Clean up listings and user docs we created (matching the unique marker)
		self.listings.delete_many(self.test_marker)
		self.users.delete_many(self.test_marker)

	def _force_authenticate_with_email(self, email: str):
		"""Helper: create tiny dummy user object and force-authenticate the client.

		DRF's force_authenticate attaches the object you pass to request.user.
		The views in this project only read the `email` attribute, so a
		minimal object with that attribute is sufficient for tests.
		"""
		class DummyUser:
			pass

		u = DummyUser()
		u.email = email
		self.client.force_authenticate(user=u)

	def test_db_ping_and_simple_crud(self):
		"""Sanity check that we can talk to MongoDB using get_db()."""
		# Ping the server
		pong = self.db.command("ping")
		self.assertIn("ok", pong)

		# Insert a simple document into a temp collection and read it back
		temp = self.db["test_collection"]
		marker = {**self.test_marker, "hello": "world"}
		r = temp.insert_one(marker)
		found = temp.find_one({"_id": r.inserted_id})
		self.assertIsNotNone(found)
		self.assertEqual(found["hello"], "world")

		# cleanup
		temp.delete_one({"_id": r.inserted_id})

	def test_get_listings_search_and_filter(self):
		"""Insert two listings and verify search and filter behavior."""
		# Insert two listings with different titles and categories.
		doc1 = {
			**self.test_marker,
			"title": "Red Bike",
			"price": 50.0,
			"description": "A nice red bike",
			"category": "dorm",
			"image_url": "http://example.com/bike.png",
			"seller_id": self.user_id,
			"status": "active",
			"created_at": datetime.utcnow(),
			"updated_at": datetime.utcnow(),
		}
		doc2 = {
			**self.test_marker,
			"title": "Blue Jacket",
			"price": 30.0,
			"description": "Warm jacket",
			"category": "clothing",
			"image_url": "http://example.com/jacket.png",
			"seller_id": self.user_id,
			"status": "active",
			"created_at": datetime.utcnow(),
			"updated_at": datetime.utcnow(),
		}
		self.listings.insert_one(doc1)
		self.listings.insert_one(doc2)

		# 1) Search by q (title contains "Red")
		resp = self.client.get("/api/listings", {"q": "Red"})
		self.assertEqual(resp.status_code, 200)
		body = resp.json()
		items = body.get("items", [])
		# Expect at least one item with title containing Red
		titles = [it.get("title") for it in items]
		self.assertTrue(any("Red" in (t or "") for t in titles))

		# 2) Filter by category "clothing"
		resp2 = self.client.get("/api/listings", {"filter": "clothing"})
		self.assertEqual(resp2.status_code, 200)
		items2 = resp2.json().get("items", [])
		categories = [it.get("category") for it in items2]
		self.assertTrue(any(c == "clothing" for c in categories))

	def test_create_listing_authenticated(self):
		"""Test the POST /api/listings flow which requires authentication.

		Steps:
		- Insert a user doc (already done in setUp)
		- Force-authenticate APIClient with that user's email
		- Post a valid listing payload
		- Verify response 201 and returned seller_id matches user_id
		"""
		# Authenticate the client so views see request.user.email
		self._force_authenticate_with_email(self.user_doc["email"])

		payload = {
			"title": "Green Lamp",
			"price": 12.5,
			"description": "Desk lamp",
			"category": "dorm",
			"image_url": "http://example.com/lamp.png",
		}

		resp = self.client.post("/api/listings", data=json.dumps(payload), content_type="application/json")
		# Expect created
		self.assertEqual(resp.status_code, 201)
		created = resp.json()
		# returned seller_id should be a string equal to the inserted user's _id
		self.assertIn("seller_id", created)
		self.assertEqual(created["seller_id"], str(self.user_id))

