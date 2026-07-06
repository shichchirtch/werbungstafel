import translators

from bot_instance import ROOT_WIND
from aiogram_dialog.widgets.kbd import Button
from user_repo import *
from aiogram.types import CallbackQuery, Message
from aiogram_dialog import DialogManager
from aiogram_dialog import ShowMode
# from requests.exceptions import HTTPError
from pathlib import Path





async def ru_stellen(callback: CallbackQuery, widget: Button, dialog_manager: DialogManager, *args, **kwargs):
    user_id = callback.from_user.id
    user = await get_user(user_id)
    if not user:
        await callback.message.answer("Ошибка: пользователь не найден")
        return

    user['lan'] = 'ru'
    # await update_user(user_id, user) # Обновляем базу
    print('user= ', user)
    await callback.message.answer('В качестве языка интерфейса выбран <b>русский</b> язык')
    dialog_manager.show_mode = ShowMode.SEND
    await dialog_manager.next()


async def uk_stellen(callback: CallbackQuery, widget: Button, dialog_manager: DialogManager, *args, **kwargs):
    user_id = callback.from_user.id
    user = await get_user( user_id)
    if not user:
        await callback.message.answer("Ошибка: пользователь не найден")
        return

    user['lan'] = 'uk'
    # await update_user(redis_db, user_id, user)
    await callback.message.answer('В якості мови інтерфейсу обрано <b>українську</b> мову')
    dialog_manager.show_mode = ShowMode.SEND
    await dialog_manager.next()

async def de_stellen(callback: CallbackQuery, widget: Button, dialog_manager: DialogManager, *args, **kwargs):
    user_id = callback.from_user.id
    user = await get_user(user_id)
    if not user:
        await callback.message.answer("Ошибка: пользователь не найден")
        return

    user['lan'] = 'de'
    # await update_user(redis_db, user_id, user)
    await callback.message.answer('Als Benutzerschnittstellensprache wurde <b>Deutsch</b> ausgewählt.')
    dialog_manager.show_mode = ShowMode.SEND
    await dialog_manager.next()


async def tr_stellen(callback: CallbackQuery, widget: Button, dialog_manager: DialogManager, *args, **kwargs):
    user_id = callback.from_user.id
    user = await get_user( user_id)
    if not user:
        await callback.message.answer("Ошибка: пользователь не найден")
        return

    user['lan'] = 'tr'
    # await update_user(redis_db, user_id, user)
    await callback.message.answer('Arayüz dili olarak <b>Türkçe</b> seçilmiştir.')
    dialog_manager.show_mode = ShowMode.SEND
    await dialog_manager.next()


async def do_nothing(callback: CallbackQuery, widget: Button, dialog_manager: DialogManager, *args, **kwargs):
    dialog_manager.show_mode = ShowMode.SEND
    await dialog_manager.switch_to(ROOT_WIND.lan_select)

def form_key_note(note):
    if len(note) > 20:
        return note[:16]
    else:
        return note

def check_len_note(note):
    if len(note) > 4000:
        return note[:4000]
    return note

def form_capture(capture):
    if len(capture) > 800:
        return capture[:800]
    return capture


async def get_translate(slovo:str, lan:str, temp_dict:dict)->str:

    if lan != 'ru':
        try:
            if lan not in temp_dict:
                res = translators.translate_text(query_text=slovo, from_language='ru', to_language=lan, translator='alibaba')
                temp_dict[lan]=res
            else:
                res = temp_dict[lan]
        except AttributeError:
                print('\n\n произошла ошибка AttributeError')
                res = 'Es ist ein Fehler aufgetreten, versuchen Sie bitte noch mal'
        # except HTTPError:
        #     print('Произошла ошибка HTTPError:\n\n')
        #     res = slovo
        except Exception as err:
            print(f'Other error occurred: {err}')
            res = slovo
    else:
        res = slovo
    return res


async def load_user_avatar(message: Message):
    user_id = message.from_user.id

    photos = await message.bot.get_user_profile_photos(
        user_id,
        limit=1,
    )

    avatar_dir = Path("uploads/avatar")
    avatar_dir.mkdir(parents=True, exist_ok=True)

    # Пользователь удалил аватарку в Telegram
    if photos.total_count == 0:

        path = avatar_dir / f"{user_id}.jpg"

        if path.exists():
            path.unlink()

        await update_avatar_db(
            telegram_id=user_id,
            avatar="",
        )

        return

    # Пользователь имеет аватарку
    file_id = photos.photos[0][-1].file_id

    await message.bot.download(
        file=file_id,
        destination=avatar_dir / f"{user_id}.jpg",
    )

    await update_avatar_db(
        telegram_id=user_id,
        avatar=f"/uploads/avatar/{user_id}.jpg",
    )