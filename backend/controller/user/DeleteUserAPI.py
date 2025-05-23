from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import User
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired

class DeleteUserAPI(MethodResource):

    @doc(
        description='Delete User Endpoint.'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def delete(self, auth, user_uid, **kwargs):
        user = User.query.get_or_404(user_uid)
        db.session.delete(user)
        db.session.commit()
        return response_message(200, 'success', 'User deleted successfully.')
