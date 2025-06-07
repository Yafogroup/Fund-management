from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import Memo
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired

class MemoListAPI(MethodResource):

    @doc(
        description='Memo List Endpoint.'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def post(self, auth, **kwargs):
        offset = int(request.json["offset"])
        limit = int(request.json["limit"])
        search = request.json['search']
        start_date = request.json["start_date"]
        end_date = request.json["end_date"]

        
        query = Memo.query

        if search:
            query = query.filter(
                Memo.title.ilike(f"%{search}%") | Memo.content.ilike(f"%{search}%")
            )
        if start_date:
            query = query.filter(Memo.created_at >= start_date)
        if end_date:
            query = query.filter(Memo.created_at <= end_date)

        total_count = query.count()

        memos = query.order_by(Memo.created_at.desc()).offset(offset).limit(limit).all()
        return response_message(200, 'success', '', {"memo_list": [memo.to_dict() for memo in memos], "page_count": total_count / limit})