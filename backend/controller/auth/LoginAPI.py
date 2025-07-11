import datetime
from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Auth, RequestResponse, RequestPost
from model import User, UserToken, Event
from controller import bcrypt, db
from datetime import datetime, timedelta


class LoginRequestPost(RequestPost):
    fields_ = RequestPost.fields_
    email = fields_.Str(required=True, description="Input Field for email")
    password = fields_.Str(required=True, description="Input Field for Password")


class LoginAPI(MethodResource):

    @doc(
        description='Login Endpoint.',
    )
    @use_kwargs(LoginRequestPost, location='json')
    @marshal_with(RequestResponse)
    def post(self, **kwargs):
        try:
            user = User.query.filter_by(email=str(kwargs.get('email'))).first()
            if user and bcrypt.check_password_hash(str(user.password), str(kwargs.get('password'))):
                auth_token_data = {
                    'user_uid': str(user.uid),
                    'email': str(user.email)
                }
                auth_token = Auth(data=auth_token_data).EncodeAuthToken()
                if auth_token:
                    user.last_logged_in = datetime.now()
                    user.last_logged_out = None
                    db.session.commit()
                    if user.is_admin == 1:
                        role = "admin"
                    else:
                        role = "user"

                    user_token = UserToken.query.filter_by(user_uid=str(user.uid)).first()
                    event_list = Event.query.filter(Event.happen_time >= datetime.now()).filter(Event.happen_time <= (datetime.now() + timedelta(days=3))).all()

                    data = {
                        'auth_token': auth_token,
                        'role': role,
                        'user_token': user_token.token_uid if user_token else "",
                        'event_list': [event.to_dict() for event in event_list]
                    }
                    return response_message(200, 'success', 'Successfully logged in.', data)
            else:
                return response_message(200, 'fail', 'User does not exist or email or password not match.')
        except Exception as e:
            return response_message(200, 'fail', f'email or password not match. {e}')
