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

class ImportMemoAPI(MethodResource):

    @doc(
        description='Import Memo Data Endpoint.'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def post(self, auth, **kwargs):
        
        # json file
        import_file = request.files.get('import_file')
        file_content = import_file.read()
        list = json.loads(file_content)

        user_uid = auth['user_uid']

        memo_list = Memo.query.all()

        for item in list:
            memo = Memo(
                title=item.get('title'),
                content=item.get('content'),
                image=item.get('image'),
                user_uid=item.get('user_uid'),
                created_at=datetime.strptime(item.get('created_at'), "%m/%d/%Y, %H:%M:%S") if item.get('created_at') else datetime.now()
            )
            if (memo in memo_list):
                continue
            db.session.add(memo)
        
        db.session.commit()

        return response_message(200, 'success', 'Memo imported successfully.')
