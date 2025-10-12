'''
The serializers.py file is where you define the structure, format, and rules for the data your API works 
with. It acts as a blueprint that ensures any data coming into your backend from a request is valid, complete, 
and in the correct type before it’s saved to the database. At the same time, it shapes the data coming out of 
the database into a clean and predictable format before sending it back to the client. In short, serializers.py 
helps maintain consistency, reliability, and clarity in how data flows through your application.

'''

from rest_framework import serializers
from .fields import ObjectIdStrField

class ListingSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=80)
    price = serializers.FloatField(min_value=0.0)
    description = serializers.CharField(required=False, allow_blank=True)
    category = serializers.ChoiceField(choices=["dorm", "school supplies", "clothing", "textbooks", "electronics"])
    image_url = serializers.URLField()
    seller_id = ObjectIdStrField(required=False, read_only=True) # backend sets this
    created_at = serializers.DateTimeField(required=False, read_only=True) # backend sets this 

class UserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=30, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=30, required=False, allow_blank=True)
    profile_picture_url = serializers.URLField(required=True)
    joined_at = serializers.DateTimeField(required=False, read_only=True) # backend sets this