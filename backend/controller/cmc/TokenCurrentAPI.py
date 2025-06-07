from datetime import datetime
from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Auth, RequestResponse, RequestPost
from model import User
from controller import bcrypt, db
from flask import jsonify
from flask import current_app

class TokenCurrentAPI(MethodResource):

    @doc(
        description='Token Endpoint.',
    )
    @marshal_with(RequestResponse)
    def post(self, **kwargs):
        try:
            data = {}
            tokens = current_app.tracker.get_filtered_tokens()
            data = {
                'status': 'success',
                'data': tokens,
                'timestamp': datetime.now().strftime("%m/%d/%Y, %H:%M:%S")
            }

            return response_message(200, 'success', '', data)
        except Exception as e:
            return response_message(500, 'fail', f'Server Error. {e}')
    