from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import Event
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired

class UpdateEventAPI(MethodResource):

    @doc(
        description='Update Event Endpoint.'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def post(self, auth, **kwargs):
        event_uid = request.form.get('event_uid')

        # Image file
        image_file = request.files.get('image')
        image_path = None

        if image_file:
            filename = secure_filename(image_file.filename)
            image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            image_file.save(image_path)
            image_path = filename

        event = Event.query.get(event_uid)
        if not event:
            return response_message(404, 'fail', 'Event not found.')

        event.title = request.form.get('title', event.title)
        event.content = request.form.get('content', event.content)
        event.happen_time = request.form.get('happen_time', event.happen_time)
        if image_path:
            event.image = image_path

        db.session.commit()
        return response_message(200, 'success', 'Event updated successfully.')
