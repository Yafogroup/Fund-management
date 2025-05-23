from flask_apispec import MethodResource, use_kwargs, marshal_with, doc
from helper import response_message, RequestResponse, RequestPost
from middleware import TokenRequired
from model import User, app
from controller import db, bcrypt
from flask import request


class UpdateUserInformation(MethodResource):

    @doc(
        description='Update User Information',
        params={
            'Authorization': {
                'description': 'Authorization HTTP header with JWT access token',
                'in': 'header',
                'type': 'string',
                'required': True
            }
        }
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def post(self, auth, **kwargs):
        user_uid = request.form.get('user_uid')
        email = request.form.get('email')
        pwd = request.form.get('pwd')
        try:
            user = User.query.filter_by(uid=user_uid).first()
            if user:
                user.email = email
                if pwd != "":
                    user.password = bcrypt.generate_password_hash(pwd, app.config.get('BCRYPT_LOG_ROUNDS')).decode('utf-8')
                db.session.commit()
                return response_message(200, 'success', 'Successfully updated data.')
            else:
                return response_message(404, 'fail', "User doesn't exist.")
        except Exception as e:
            return response_message(500, 'fail', f'Some error occurred. Please try again. {e}')
