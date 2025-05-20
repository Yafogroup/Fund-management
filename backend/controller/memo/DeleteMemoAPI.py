from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import Memo
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired

class DeleteMemoAPI(MethodResource):

    @doc(
        description='Delete Memo Endpoint.'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def delete(self, auth, memo_uid, **kwargs):
        memo = Memo.query.get_or_404(memo_uid)
        db.session.delete(memo)
        db.session.commit()
        return response_message(200, 'success', 'Memo deleted successfully.')
