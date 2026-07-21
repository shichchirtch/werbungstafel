import translators

from bot_instance import ROOT_WIND, bot
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

async def notify_receiver(receiver_id: int):
        user = await get_user_by_id(receiver_id)
        print('user  = ', user)
        if not user:
            return
        try:
            await bot.send_message(
                chat_id=user.telegram_id,
                text=(
                    "📩 <b>Sie haben eine neue Nachricht.</b>\n\n"
                    "Öffnen Sie bitte Werbungstafel."
                ),
                parse_mode="HTML",
            )

        except Exception as e:

            print(e)

async def notify_ad_created(
    owner_id: int,
    ad: Ad,
):

    user = await get_user_by_id(owner_id)

    if not user:
        return

    try:

        await bot.send_message(

            chat_id=user.telegram_id,

            text=(

                "✅ <b>Ihre Anzeige wurde veröffentlicht!</b>\n\n"

                f"📌 <b>{ad.title}</b>\n"

                f"📍 {ad.plz}\n\n"

                "Und ist jetzt für andere Benutzer sichtbar.\n\nVielen Dank für Ihre Nutzung von Werbungstafel!"

            ),

            parse_mode="HTML",

        )

    except Exception as e:

        print(e)

async def notify_ad_deleted(owner_id: int,ad: Ad):

    user = await get_user_by_id(owner_id)

    if not user:
        return

    try:

        await bot.send_message(

            chat_id=user.telegram_id,

            text=(

                "✅ <b>Ihre Anzeige wurde entfernt!</b>\n\n"

                f"📌 <b>{ad.title}</b>\n"

                f"📍 {ad.plz}\n\n"

            ),

            parse_mode="HTML",

        )

    except Exception as e:

        print(e)

async def notify_ad_changed(owner_id: int, ad: Ad,):

    user = await get_user_by_id(owner_id)

    if not user:
        return

    try:

        await bot.send_message(

            chat_id=user.telegram_id,

            text=(

                "✅ <b>Ihre Anzeige wurde verändert!</b>\n\n"

                f"📌 <b>{ad.title}</b>\n"

                f"📍 {ad.plz}\n\n"
            ),

            parse_mode="HTML",
        )

    except Exception as e:

        print(e)

async def notify_user_ban_changed(
    user_id: int,
    is_banned: bool,
):

    user = await get_user_by_id(user_id)

    if not user:
        return

    try:

        if is_banned:

            text = (
                "🚫 <b>Ihr Konto wurde gesperrt.</b>\n\n"
                "Sie können keine Anzeigen mehr veröffentlichen "
                "und keine Nachrichten senden.\n\n"
                "Falls Sie Fragen haben, kontaktieren Sie bitte den Administrator."
            )

        else:

            text = (
                "✅ <b>Ihr Konto wurde entsperrt.</b>\n\n"
                "Sie können Werbungstafel jetzt wieder uneingeschränkt nutzen."
            )

        await bot.send_message(
            chat_id=user.telegram_id,
            text=text,
            parse_mode="HTML",
        )

    except Exception as e:

        print(e)