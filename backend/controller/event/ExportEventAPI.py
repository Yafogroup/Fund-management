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

class ExportEventAPI(MethodResource):

    @doc(
        description='Export Event Data Endpoint.'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def post(self, auth, **kwargs):
        events = Event.query.all()
        save_data = [{
            "uid": event.uid,
            "title": event.title,
            "content": event.content,
            "image": event.image,
            "created_at": event.created_at.strftime("%m/%d/%Y, %H:%M:%S"),
            "happent_time": event.happent_time.strftime("%m/%d/%Y, %H:%M:%S"),
            "user_uid": event.user_uid,
        } for event in events]
        file_name = "events_" + datetime.now().strftime("%m-%d-%Y") + ".json"
        path = os.path.join(current_app.config['UPLOAD_FOLDER'], file_name)

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(save_data, f, ensure_ascii=False, indent=4)
        
        result = url_for('static', filename=f'uploads/{file_name}', _external=True)
        
        return response_message(200, 'success', 'Event exported successfully.', {"file_path": result, "file_name": file_name})
