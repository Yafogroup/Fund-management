from flask import request
from flask_apispec import MethodResource, marshal_with, use_kwargs, doc
from helper import response_message, RequestResponse, RequestPost
from middleware import TokenRequired
from model import TokenType
from controller import db

class TokenTypeAdd(MethodResource):
    @marshal_with(RequestResponse)
    @TokenRequired
    def post(self, auth, **kwargs):
        try:
            uid = int(request.form.get('uid'))
            name = request.form.get('name')

            if uid == 0:
                token_type = TokenType(name=name)
            else:
                token_type = TokenType.query.filter_by(uid=uid).first()
                if not token_type:
                    return response_message(404, 'fail', 'Token Type not found')
                token_type.name = name
            
            db.session.add(token_type)
            db.session.commit()
            return response_message(200, 'success', 'Save Token Type')
        except Exception as e:
            return response_message(200, 'fail', str(e))