from datetime import datetime
from typing import Any, Dict, List
from bson import ObjectId
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from db.client import get_db, get_collection
from .serializers import ListingSerializer, UserSerializer

def now(): return datetime.utcnow()
def to_str(x): return str(x) if x is not None else None

def get_user_by_email(email: str) -> Dict[str, Any] | None:
    """Lookup only. DO NOT create a user if missing."""
    if not email:
        return None
    return get_db()["users"].find_one({"email": email})



@api_view(['GET', 'POST'])
#@permission_classes([IsAuthenticated]) #FIXME
def listing(request):
    """
    GET /api/listings
      ?q=<search by title>
      ?filter=<category>

    Behavior:
      - If q or filter present -> search/browse.
      - If neither present -> require auth and return ONLY the caller's listings (dashboard).
    """
    if request.method == "GET":
        db = get_db()
        listings = get_collection("listings")

        q = request.query_params.get("q")
        filter_param = request.query_params.get("filter")

        query: Dict[str, Any] = {} #Building the query/filter that will be sent to MongoDB, filtering is not being done locally

        if q:
            # case-insensitive contains on title (no text index needed), this is building a regex mongo db filter
            query["title"] = {"$regex": q, "$options": "i"}

        if filter_param:
            # your 'filter' query param maps to the 'category' field in DB
            query["category"] = filter_param
        
        # dashboard behavior: if NO q and NO filter -> show only all but my listings
       
        # if authenticated, request.user will be set by auth class
        email  = getattr(request.user, "email", None) if getattr(request, "user", None) else None
        me = get_user_by_email(email) if email else None

        if not me and True == False:
            # logged our Or user not found -> return empty list
            return Response({"items":[], "next_cursor": None})
        # logged in -> show everything except my listings

            query["seller_id"] = {"$ne": me["_id"]}

        docs = list(listings.find(query).sort("created_at", -1))
        
        items: List[Dict[str, Any]] = []
        for d in docs:
            d["id"] = to_str(d.pop("_id"))
            d["seller_id"] = to_str(d.get("seller_id"))
            items.append(d)

        print("LISTINGS RESPONSE:", items)
        return Response({"items": items, "next_cursor": None})
    
    elif request.method == "POST":
        db = get_db()
        listings = get_collection("listings")

        ser = ListingSerializer(data=request.data)
        if not ser.is_valid():
            return Response({"errors": ser.errors}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        user_email = getattr(request.user, "email", None)
        if not user_email:
            return Response({"error": "GTFO"}, status=401)

        user = db["users"].find_one({"email": user_email})
        if not user:
            return Response({"error": "Who is u?"}, status=404)

        doc = {
            **ser.validated_data,
            "seller_id": user["_id"],
            "created_at": now(),
        }

        res = listings.insert_one(doc)
        created = listings.find_one({"_id": res.inserted_id})
        created["id"] = to_str(created.pop("_id"))
        created["seller_id"] = to_str(created["seller_id"])

        return Response(created, status=201)
'''
# @api_view(["POST"])
# #@permission_classes([IsAuthenticated])  # require login here FIXME
# def create_listing(request):
#     db = get_db()
#     listings = get_collection("listings")

#     ser = ListingSerializer(data=request.data)
#     if not ser.is_valid():
#         return Response({"errors": ser.errors}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

#     user_email = getattr(request.user, "email", None)
#     if not user_email:
#         return Response({"error": "GTFO"}, status=401)

#     user = db["users"].find_one({"email": user_email})
#     if not user:
#         return Response({"error": "Who is u?"}, status=404)

#     doc = {
#         **ser.validated_data,
#         "seller_id": user["_id"],
#         "created_at": now(),
#     }

#     res = listings.insert_one(doc)
#     created = listings.find_one({"_id": res.inserted_id})
#     created["id"] = to_str(created.pop("_id"))
#     created["seller_id"] = to_str(created["seller_id"])

#     return Response(created, status=201)
'''