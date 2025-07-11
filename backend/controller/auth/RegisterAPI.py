from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost
from model import User
from controller import db


class RegisterRequest(RequestPost):
    fields_ = RequestPost.fields_
    email = fields_.Str(required=True, description="Input Field for Email")
    password = fields_.Str(required=True, description="Input Field for Password")


class RegisterAPI(MethodResource):

    @doc(
        description='Register Endpoint.'
    )
    @use_kwargs(RegisterRequest, location='json')
    @marshal_with(RequestResponse)
    def post(self, **kwargs):
        user = User.query.filter_by(email=kwargs.get('email')).first()
        if not user:
            try:
                user = Serializers(kwargs).ValidatingRegister()
                db.session.add(user)
                db.session.commit()
                return response_message(201, 'success', 'Successfully registered.')
            except Exception as e:
                return response_message(401, 'fail', str(e))
        else:
            return response_message(202, 'already_exists', 'User already exists. Please Log in.')
