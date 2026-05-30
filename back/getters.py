from aiogram.types import User
from aiogram_dialog import DialogManager
from lexicon import *
from user_repo import *
from my_fast_api import redis_db


async def get_lan(dialog_manager: DialogManager, event_from_user: User, **kwargs):
    user_id = event_from_user.id
    user = await get_user(redis_db, user_id)
    lan = user['lan']
    active_order = user['activ']
    return {'active_order':active_order}










