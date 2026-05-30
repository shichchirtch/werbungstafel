from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.fsm.storage.memory import StorageKey
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.redis import RedisStorage, Redis
from aiogram.fsm.storage.base import DefaultKeyBuilder
from config import settings


key_builder = DefaultKeyBuilder(with_destiny=True)


aiogram_redis = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    decode_responses=True,
)


redis_storage = RedisStorage(redis=aiogram_redis, key_builder=key_builder)

BOT_TOKEN =settings.BOT_TOKEN

bot = Bot(token=BOT_TOKEN,
              default=DefaultBotProperties(parse_mode=ParseMode.HTML))

bot_storage_key = StorageKey(bot_id=bot.id, user_id=bot.id, chat_id=bot.id)

dp = Dispatcher(storage=redis_storage)


class ROOT_WIND(StatesGroup):
    lan_select = State()
    do_nothing = State()

class ADMIN(StatesGroup):
    first = State()
    accept_msg= State()
    admin_send_msg = State()

class CREATE(StatesGroup):
    einstellen = State()
    ask_capture = State()
    enter_capture = State()
    finish = State()


class ZEIGEN(StatesGroup):
    clava = State()
    list_notes = State()
    schlist = State()

class ABOUT(StatesGroup):
    one = State()
    accepting = State()



