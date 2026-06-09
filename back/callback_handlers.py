from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup
from aiogram import Router, F
from user_repo import confirm_login


cb_router = Router()



@cb_router.callback_query(F.data.startswith("login:"))

async def login_callback(callback: CallbackQuery,):

    token = callback.data.split(":")[1]

    tg_id = callback.from_user.id

    await confirm_login(
        token=token,
        telegram_id=tg_id
    )

    await callback.answer(
        "Авторизация подтверждена!")