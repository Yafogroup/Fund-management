from datetime import datetime
from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Auth, RequestResponse, RequestPost
from model import User
from controller import bcrypt, db
from service.PriceChangeTracker import PriceChangeTracker
from flask import jsonify

tracker = PriceChangeTracker()
tracker.start_tracking()

class TokenRequestPost(RequestPost):
    fields_ = RequestPost.fields_
    interval = fields_.Int(required=True, description="Input Field for Time Interval")
    symbol = fields_.Str(required=False, description="Input Field for Symbol")
    min_change = fields_.Int(required=False, description="Input Field for Min Change")
    max_change = fields_.Int(required=False, description="Input Field for Max Change")


class TokenAPI(MethodResource):

    @doc(
        description='Token Endpoint.',
    )
    @use_kwargs(TokenRequestPost, location='json')
    @marshal_with(RequestResponse)
    def post(self, **kwargs):
        try:
            data = {}
            tokens = tracker.get_tokens(kwargs.get('min_change'), kwargs.get('max_change'))
            data = {
                'status': 'success',
                'data': tokens,
                'timestamp': datetime.now().strftime("%m/%d/%Y, %H:%M:%S")
            }

            return response_message(200, 'success', '', data)
        except Exception as e:
            return response_message(500, 'fail', f'Server Error. {e}')
