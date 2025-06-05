from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import TokenType
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired

class TokenTypeList(MethodResource):

    @doc(
        description='Token Type List Endpoint.'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def post(self, auth, **kwargs):
        search = request.json['search']

        query = TokenType.query

        if search:
            query = query.filter(
                TokenType.name.ilike(f"%{search}%")
            )
       
        types = query.order_by(TokenType.name).all()
        return response_message(200, 'success', '', {"token_type_list": [token_type.to_dict() for token_type in types]})