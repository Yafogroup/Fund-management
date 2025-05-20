from flask import request
from flask_apispec import MethodResource, marshal_with, use_kwargs, doc
from helper import response_message, Serializers, RequestResponse
from model import User
from middleware import TokenRequired
import os
from flask import current_app

class Upload(MethodResource):

    @marshal_with(RequestResponse)
    @TokenRequired
    def post(self):
        """
        Upload a file to the server.
        """
        args = request.args
        file = request.files['file']
        filename = file.filename

        if not filename:
            return response_message(400, 'fail', 'No file selected.')

        image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(image_path)
        return response_message(200, 'success', 'File uploaded successfully.', {'path': image_path})