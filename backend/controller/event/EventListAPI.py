from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import Event
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired

class EventListAPI(MethodResource):

    @doc(
        description='Event List Endpoint.'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def post(self, auth, **kwargs):
        offset = int(request.json["offset"])
        limit = int(request.json["limit"])
        search = request.json['search']
        start_date = request.json["start_date"]
        end_date = request.json["end_date"]

        
        query = Event.query

        if search:
            query = query.filter(
                Event.title.ilike(f"%{search}%") | Event.content.ilike(f"%{search}%")
            )
        if start_date:
            query = query.filter(Event.happen_time >= start_date)
        if end_date:
            query = query.filter(Event.happen_time <= end_date)

        total_count = query.count()

        events = query.order_by(Event.happen_time.desc()).offset(offset).limit(limit).all()
        return response_message(200, 'success', '', {"event_list": [event.to_dict() for event in events], "page_count": total_count / limit})