from datetime import datetime
from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Auth, RequestResponse, RequestPost
from model import User
from controller import bcrypt, db
from flask import jsonify, current_app

class UpdateRequestPost(RequestPost):
    fields_ = RequestPost.fields_
    interval = fields_.Int(required=False, description="Input Field for Time Interval")
    min_change = fields_.Float(required=False, description="Input Field for Min Change")
    max_change = fields_.Float(required=False, description="Input Field for Max Change")


class UpdateParamAPI(MethodResource):

    @doc(
        description='Update Parmas Endpoint.',
    )
    @use_kwargs(UpdateRequestPost, location='json')
    @marshal_with(RequestResponse)
    def post(self, **kwargs):
        try:
            data = {}
            current_app.tracker.update_param(kwargs['interval'], kwargs['min_change'], kwargs['max_change'])
            return response_message(200, 'success', '', data)
        except Exception as e:
            return response_message(500, 'fail', f'Server Error. {e}')
    