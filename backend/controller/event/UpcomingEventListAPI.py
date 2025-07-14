from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import Event
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired
from datetime import datetime, timedelta

class UpcomingEventListAPI(MethodResource):

    @doc(
        description='Upcoming Event List Endpoint.'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def post(self, auth, **kwargs):
        event_list = Event.query.filter(Event.happen_time >= datetime.now()).filter(Event.happen_time <= (datetime.now() + timedelta(days=3))).all()
        return response_message(200, 'success', '', {"event_list": [event.to_dict() for event in event_list]})