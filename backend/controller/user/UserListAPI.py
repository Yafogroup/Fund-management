from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import User
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired

class UserListAPI(MethodResource):

    @doc(
        description='User List Endpoint.'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def post(self, auth, **kwargs):
        offset = int(request.json["offset"])
        limit = int(request.json["limit"])
        search = request.json['search']

        query = User.query

        if search:
            query = query.filter(
                User.email.ilike(f"%{search}%") & (User.is_delete == 0)
            )
       
        users = query.order_by(User.is_admin.desc(), User.registered_on.desc()).offset(offset).limit(limit).all()
        return response_message(200, 'success', '', {"user_list": [user.to_dict() for user in users]})