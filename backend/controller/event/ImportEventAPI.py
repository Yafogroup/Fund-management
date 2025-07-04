from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import Event
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired
import json
from datetime import datetime
from flask import url_for

class ImportEventAPI(MethodResource):

    @doc(
        description='Import Event Data Endpoint.'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def post(self, auth, **kwargs):
        
        # json file
        import_file = request.files.get('import_file')
        file_content = import_file.read()
        list = json.loads(file_content)

        user_uid = auth['user_uid']

        event_list = Event.query.all()

        for item in list:
            event = Event(
                title=item.get('title'),
                content=item.get('content'),
                image=item.get('image'),
                user_uid=item.get('user_uid'),
                created_at=datetime.strptime(item.get('created_at'), "%m/%d/%Y, %H:%M:%S") if item.get('created_at') else datetime.now(),
                happent_time=datetime.strptime(item.get('happent_time'), "%m/%d/%Y, %H:%M:%S") if item.get('happent_time') else ""
            )
            if (event in event_list):
                continue
            db.session.add(event)
        
        db.session.commit()

        return response_message(200, 'success', 'Event imported successfully.')
