from flask import request
from flask_apispec import MethodResource, marshal_with, use_kwargs, doc
from helper import response_message, RequestResponse, RequestPost
from middleware import TokenRequired
from model import User, UserToken
from controller import db

class UpdateUserTokenPost(RequestPost):
    fields_ = RequestPost.fields_
    token_ids = fields_.String(required=False, description="Input Field for Time Interval")


class UpdateUserToken(MethodResource):
    @doc(
        description='Update user selected tokens',
        params={
            'Authorization': {
                'description': 'Authorization HTTP header with JWT access token',
                'in': 'header',
                'type': 'string',
                'required': True
            }
        }
    )
    @marshal_with(RequestResponse)
    @use_kwargs(UpdateUserTokenPost, location='json')
    @TokenRequired
    def post(self, auth, **kwargs):
        try:
            user_token = UserToken.query.filter_by(user_uid=auth['user_uid']).first()
            if not user_token:
                user_token = UserToken(user_uid=auth['user_uid'], token_uid=kwargs['token_ids'])
            else:
                user_token.token_uid = kwargs['token_ids']
            db.session.add(user_token)
            db.session.commit()
            
            return response_message(200, 'success', 'Update User token')
        except Exception as e:
            return response_message(200, 'fail', str(e))