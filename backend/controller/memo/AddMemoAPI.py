from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import Memo
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired

class AddMemoAPI(MethodResource):

    @doc(
        description='Create Memo Endpoint.'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def post(self, auth, **kwargs):
        title = request.form.get('title')
        content = request.form.get('content')

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

        new_memo = Memo(
            title=title,
            content=content,
            image=image_path,
            user_uid=user_uid
        )
        db.session.add(new_memo)
        db.session.commit()
        return response_message(200, 'success', 'Memo created successfully.')