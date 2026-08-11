from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup
from aiogram import Router, F
from user_repo import confirm_login
from lexicon import *


cb_router = Router()


@cb_router.callback_query(F.data.startswith("login:"))
async def login_callback(callback: CallbackQuery,):
    token = callback.data.split(":")[1]
    tg_id = callback.from_user.id
    lan  = callback.from_user.language_code

    success = await confirm_login(
        token=token,
        telegram_id=tg_id
    )
    if not success:
        await callback.answer(
            ungultig_link[lan],
            show_alert=True,
        )
        return

    await callback.message.edit_text( bestatigt[lan]  )
