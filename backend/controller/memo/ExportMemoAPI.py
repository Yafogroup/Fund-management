from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import Memo
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired
import json
from datetime import datetime
from flask import url_for

class ExportMemoAPI(MethodResource):

    @doc(
        description='Export Memo Data Endpoint.'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def post(self, auth, **kwargs):
        memos = Memo.query.all()
        save_data = [{
            "uid": memo.uid,
            "title": memo.title,
            "content": memo.content,
            "image": memo.image,
            "created_at": memo.created_at.strftime("%m/%d/%Y, %H:%M:%S"),
            "user_uid": memo.user_uid,
        } for memo in memos]
        file_name = "memos_" + datetime.now().strftime("%m-%d-%Y") + ".json"
        path = os.path.join(current_app.config['UPLOAD_FOLDER'], file_name)

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(save_data, f, ensure_ascii=False, indent=4)
        
        result = url_for('static', filename=f'uploads/{file_name}', _external=True)
        
        return response_message(200, 'success', 'Memo exported successfully.', {"file_path": result, "file_name": file_name})
