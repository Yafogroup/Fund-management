from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import Memo
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired

class UpdateMemoAPI(MethodResource):

    @doc(
        description='Update Memo Endpoint.'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def post(self, auth, **kwargs):
        memo_uid = request.form.get('memo_uid')
        # Image file
        image_file = request.files.get('image')
        image_path = None

        if image_file:
            filename = secure_filename(image_file.filename)
            image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            image_file.save(image_path)
            image_path = filename

        memo = Memo.query.get(memo_uid)
        if not memo:
            return response_message(404, 'fail', 'Memo not found.')

        memo.title = request.form.get('title', memo.title)
        memo.content = request.form.get('content', memo.content)
        if image_path:
            memo.image = image_path

        db.session.commit()
        return response_message(200, 'success', 'Memo updated successfully.')
