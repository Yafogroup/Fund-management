from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import Event
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired

class DeleteEventAPI(MethodResource):

    @doc(
        description='Delete Event Endpoint.'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def delete(self, auth, event_uid, **kwargs):
        event = Event.query.get_or_404(event_uid)
        db.session.delete(event)
        db.session.commit()
        return response_message(200, 'success', 'Event deleted successfully.')
