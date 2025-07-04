from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import Event
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired

class AddEventAPI(MethodResource):

    @doc(
        description='Create Event Endpoint.'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def post(self, auth, **kwargs):
        title = request.form.get('title')
        content = request.form.get('content')
        happen_time = request.form.get('happen_time')

        # Image file
        image_file = request.files.get('image')
        image_path = None

        if image_file:
            filename = secure_filename(image_file.filename)
            image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            image_file.save(image_path)
            image_path = filename

        # Get the user ID from the token
        user_uid = auth['user_uid']

        new_event = Event(
            title=title,
            content=content,
            image=image_path,
            happen_time=happen_time,
            user_uid=user_uid
        )
        db.session.add(new_event)
        db.session.commit()
        return response_message(200, 'success', 'Event created successfully.')