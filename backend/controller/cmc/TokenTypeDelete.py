from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import TokenType
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired

class TokenTypeDelete(MethodResource):

    @doc(
        description='Delete Token Type'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def delete(self, auth, uid, **kwargs):
        toke_type = TokenType.query.get_or_404(uid)
        db.session.delete(toke_type)
        db.session.commit()
        return response_message(200, 'success', 'Token Type deleted successfully.')
