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
    if lan not in ('ru', 'uk', 'tr', 'de'):
        lan = 'ru'

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


@cb_router.callback_query(F.data == "help_video")
async def help_video(callback: CallbackQuery):
    lan = callback.from_user.language_code
    if lan not in ('ru', 'uk', 'tr', 'de'):
        lan = 'ru'
    await callback.message.delete()
    await callback.message.answer_video(
        video= 'BAACAgIAAxkBAAIGKmqh3IzVhUaA9tIsz3y8ThpPFjLdAALerAAC_VsQSeBE1DsBedoNPQQ', #video_movie,
        caption=opisanie_rolika[lan]
    )
    await callback.answer()
