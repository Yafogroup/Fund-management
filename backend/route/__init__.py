from apispec import APISpec
from apispec.ext.marshmallow import MarshmallowPlugin

from flask_apispec import FlaskApiSpec
from werkzeug.utils import redirect
from flask_restful import Api
from flask import send_from_directory

from helper import response_message

from controller import (
    app,
    RegisterAPI,
    LoginAPI,
    LogoutAPI,
    UpdateUserInformation,
    UpdatePassword,
    UpdateUsername,
    UserListAPI,
    DeleteUserAPI,
    GetHeroName,
    ValidateReferralCode,
    GetCurrentUser,
    GetUserByName,
    CheckReferralCode,
    RefreshJWTToken,
    TokenAPI,
    UpdateParamAPI,
    MemoListAPI,
    AddMemoAPI,
    UpdateMemoAPI,
    DeleteMemoAPI,
    UpdateUserToken,
    AddPortfolioAPI,
    ClosePortfolioAPI,
    TokenTypeAdd,
    TokenTypeDelete,
    TokenTypeList,
    PortfolioListAPI,
    PortfolioDelete
)

app.config.update({
    'APISPEC_SPEC': APISpec(
        title='Flask Authentication API',
        version='v1',
        plugins=[MarshmallowPlugin()],
        openapi_version='3.0.0'
    ),
    'APISPEC_SWAGGER_URL': '/docs/json',  # URI to access API Doc JSON
    'APISPEC_SWAGGER_UI_URL': '/docs'  # URI to access UI of API Doc
})


@app.route('/', methods=['GET', 'POST', 'PATCH'])
@app.route('/api', methods=['GET', 'POST', 'PATCH'])
def redirect_to_json_api():
    return redirect('/docs/json')


ENDPOINT = app.config.get('APP_PREFIX')

api = Api(app)
docs = FlaskApiSpec(app)

@app.errorhandler(404)
def resource_not_found(e):
    return response_message(404, 'error', 'Resource not found', str(e))


api.add_resource(RegisterAPI, f'{ENDPOINT}/auth/register', methods=['POST'])
docs.register(RegisterAPI)

api.add_resource(LoginAPI, f'{ENDPOINT}/auth/login', methods=['POST'])
docs.register(LoginAPI)

api.add_resource(LogoutAPI, f'{ENDPOINT}/auth/logout', methods=['POST'])
docs.register(LogoutAPI)

api.add_resource(GetCurrentUser, f'{ENDPOINT}/auth/user', methods=['GET'])
docs.register(GetCurrentUser)

api.add_resource(RefreshJWTToken, f'{ENDPOINT}/auth/refresh', methods=['GET'])
docs.register(RefreshJWTToken)

api.add_resource(UpdateUserInformation, f'{ENDPOINT}/auth/user/update', methods=['POST'])
docs.register(UpdateUserInformation)

api.add_resource(UpdatePassword, f'{ENDPOINT}/auth/user/password', methods=['PATCH'])
docs.register(UpdatePassword)

api.add_resource(UpdateUsername, f'{ENDPOINT}/auth/user/username', methods=['PATCH'])
docs.register(UpdateUsername)

api.add_resource(GetUserByName, f'{ENDPOINT}/user', methods=['GET'])
docs.register(GetUserByName)

api.add_resource(UserListAPI, f'{ENDPOINT}/user/list', methods=['POST'])
docs.register(UserListAPI)

api.add_resource(DeleteUserAPI, f'{ENDPOINT}/user/delete/<string:user_uid>', methods=['DELETE'])
docs.register(DeleteUserAPI)

api.add_resource(GetHeroName, f'{ENDPOINT}/hero', methods=['GET'])
docs.register(GetHeroName)

api.add_resource(CheckReferralCode, f'{ENDPOINT}/referral', methods=['POST', 'GET'])
docs.register(CheckReferralCode)

api.add_resource(ValidateReferralCode, f'{ENDPOINT}/referral/validate', methods=['POST', 'GET'])
docs.register(ValidateReferralCode)

api.add_resource(TokenAPI, f'{ENDPOINT}/token/list', methods=['POST'])
docs.register(TokenAPI)

api.add_resource(UpdateParamAPI, f'{ENDPOINT}/token/update_param', methods=['POST'])
docs.register(UpdateParamAPI)

api.add_resource(UpdateUserToken, f'{ENDPOINT}/token/update_user_token', methods=['POST'])
docs.register(UpdateUserToken)

api.add_resource(MemoListAPI, f'{ENDPOINT}/memo/list', methods=['POST'])
docs.register(TokenAPI)

api.add_resource(AddMemoAPI, f'{ENDPOINT}/memo/add', methods=['POST'])
docs.register(AddMemoAPI)

api.add_resource(UpdateMemoAPI, f'{ENDPOINT}/memo/edit', methods=['POST'])
docs.register(UpdateMemoAPI)

api.add_resource(DeleteMemoAPI, f'{ENDPOINT}/memo/delete/<int:memo_uid>', methods=['DELETE'])
docs.register(DeleteMemoAPI)

api.add_resource(AddPortfolioAPI, f'{ENDPOINT}/portfolio/add', methods=['POST'])
docs.register(AddPortfolioAPI)

api.add_resource(ClosePortfolioAPI, f'{ENDPOINT}/portfolio/close', methods=['POST'])
docs.register(ClosePortfolioAPI)

api.add_resource(PortfolioListAPI, f'{ENDPOINT}/portfolio/list', methods=['POST'])
docs.register(PortfolioListAPI)

api.add_resource(TokenTypeAdd, f'{ENDPOINT}/toke_type/save', methods=['POST'])
docs.register(TokenTypeAdd)

api.add_resource(TokenTypeDelete, f'{ENDPOINT}/toke_type/delete/<int:uid>', methods=['DELETE'])
docs.register(TokenTypeAdd)

api.add_resource(TokenTypeList, f'{ENDPOINT}/toke_type/list', methods=['POST'])
docs.register(TokenTypeList)

api.add_resource(PortfolioDelete, f'{ENDPOINT}/portfolio/delete/<int:uid>', methods=['DELETE'])
docs.register(PortfolioDelete)

