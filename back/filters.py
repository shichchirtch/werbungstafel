from aiogram.types import Message
from aiogram.filters import BaseFilter
# from bot_instance import redis_db




# class PRE_START(BaseFilter):
#     async def __call__(self, message: Message):
#         user_id = message.from_user.id
#         check_user = await get_user(redis_db, user_id)
#         if check_user:
#             return True
#         return False

class TEXT_FILTER(BaseFilter):
    async def __call__(self, message: Message):
        print('TEXT_FILTER works')
        if message.text.startswith('s'):
            return True
        return False


class IS_ADMIN(BaseFilter):
    async def __call__(self, message: Message):
        if message.from_user.id == 6685637602:
            return True
        return False









