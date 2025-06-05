from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import Portfolio
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired

class PortfolioDelete(MethodResource):

    @doc(
        description='Portfolio Delete Endpoint'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def delete(self, auth, uid, **kwargs):
        portf = Portfolio.query.get_or_404(uid)
        db.session.delete(portf)
        db.session.commit()
        return response_message(200, 'success', 'Portfolio Type deleted successfully.')
