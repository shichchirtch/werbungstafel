from aiogram.types import Message
from aiogram.filters import BaseFilter




class KODE_FILTER(BaseFilter):
    async def __call__(self, message: Message):
        if not message.text:
            return False
        token = message.text.strip().upper()

        if len(token) == 6 and token.isalnum():
            return True
        await message.answer('❌ Wrong Code\n\n/login again')
        return False

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









