from aiogram.types import Message
from aiogram.filters import BaseFilter




class KODE_FILTER(BaseFilter):
    async def __call__(self, message: Message):
        if not message.text:
            return False
        if message.text in ['/admin', '/send_message', '/help']:
            return False
        return True

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









