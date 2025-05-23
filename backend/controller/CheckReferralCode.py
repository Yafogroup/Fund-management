from flask import request
from flask_apispec import MethodResource, marshal_with, use_kwargs, doc
from helper import response_message, RequestResponse, RequestPost
from middleware import TokenRequired
from model import User


class CheckReferralCode(MethodResource):
    @doc(
        description='Check Referral Code',
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
    @TokenRequired
    def post(self, auth, **kwargs):
        user = User.query.filter_by(uid=auth['user_uid']).first()
        if user.is_admin == 1:
            return response_message(200, 'success', 'Valid referral code.')
        return response_message(200, 'fail', 'Invalid referral code.')