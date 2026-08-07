import translators
from bot_instance import ROOT_WIND, bot
from aiogram_dialog.widgets.kbd import Button
from user_repo import *
from aiogram.types import CallbackQuery, Message
from aiogram_dialog import DialogManager
from aiogram_dialog import ShowMode
from pathlib import Path
from geopy.distance import geodesic





async def ru_stellen(callback: CallbackQuery, widget: Button, dialog_manager: DialogManager, *args, **kwargs):
    user_id = callback.from_user.id
    user = await get_user(user_id)
    if not user:
        await callback.message.answer("Ошибка: пользователь не найден")
        return

    ok = await update_user_language(
        telegram_id=callback.from_user.id,
        language="ru",
    )

    if not ok:
        await callback.message.answer(
            "Ошибка: пользователь не найден"
        )
        return
    await callback.message.answer('В качестве языка интерфейса выбран <b>русский</b> язык')
    dialog_manager.show_mode = ShowMode.SEND
    await dialog_manager.done()


async def uk_stellen(callback: CallbackQuery, widget: Button, dialog_manager: DialogManager, *args, **kwargs):
    user_id = callback.from_user.id
    user = await get_user( user_id)
    if not user:
        await callback.message.answer("Ошибка: пользователь не найден")
        return

    ok = await update_user_language(
        telegram_id=callback.from_user.id,
        language="uk",
    )

    if not ok:
        await callback.message.answer(
            "Ошибка: пользователь не найден"
        )
        return
    await callback.message.answer('В якості мови інтерфейсу обрано <b>українську</b> мову')
    dialog_manager.show_mode = ShowMode.SEND
    await dialog_manager.done()

async def de_stellen(
    callback: CallbackQuery,
    widget: Button,
    dialog_manager: DialogManager,
    *args,
    **kwargs,
):
    ok = await update_user_language(
        telegram_id=callback.from_user.id,
        language="de",
    )

    if not ok:
        await callback.message.answer(
            "Ошибка: пользователь не найден"
        )
        return

    await callback.message.answer(
        "Als Benutzerschnittstellensprache wurde <b>Deutsch</b> ausgewählt."
    )

    dialog_manager.show_mode = ShowMode.SEND
    await dialog_manager.done()


async def tr_stellen(callback: CallbackQuery, widget: Button, dialog_manager: DialogManager, *args, **kwargs):
    user_id = callback.from_user.id
    user = await get_user( user_id)
    if not user:
        await callback.message.answer("Ошибка: пользователь не найден")
        return

    ok = await update_user_language(
        telegram_id=callback.from_user.id,
        language="tr",
    )

    if not ok:
        await callback.message.answer(
            "Ошибка: пользователь не найден"
        )
        return
    await callback.message.answer('Arayüz dili olarak <b>Türkçe</b> seçilmiştir.')
    dialog_manager.show_mode = ShowMode.SEND
    await dialog_manager.done()



def check_len_note(note):
    if len(note) > 4000:
        return note[:4000]
    return note



async def get_translate(slovo:str, lan:str, temp_dict:dict)->str:

    if lan != 'ru':
        try:
            if lan not in temp_dict:
                res = translators.translate_text(query_text=slovo, from_language='ru', to_language=lan, translator='google')
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
    print("LOAD AVATAR = ", message.from_user.id)
    user_id = message.from_user.id

    photos = await message.bot.get_user_profile_photos(
        user_id,
        limit=1,
    )
    print("TOTAL FOTO =", photos.total_count)

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
    print("AVATAR SAVED")



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


async def get_users_count():
    async with session_marker() as session:
        users =  await session.scalar(select(func.count()).select_from(User))
        return users





async def get_ads_today_count():
    async with session_marker() as session:
        now = datetime.now()
        start = now.replace(hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )
        end = start + timedelta(days=1)
        return await session.scalar(
            select(func.count())
            .select_from(Ad)
            .where(
                Ad.created_at >= start,
                Ad.created_at < end,
            )
        )


async def get_users_for_daily_report():

    async with session_marker() as session:

        result = await session.execute(
            select(User)
        )

        users = result.scalars().all()

        return [
            {
                "telegram_id": user.telegram_id,
                "latitude": user.latitude,
                "longitude": user.longitude,
                "lan": user.lan,
            }
            for user in users
        ]


async def get_new_ads_global():
    since = datetime.now() - timedelta(days=1)
    async with session_marker() as session:
        result = await session.execute(
            select(Ad)
            .where(
                Ad.created_at >= since
            )
        )
        return result.scalars().all()


async def get_new_ads_in_radius(center_lat: float,center_lon: float,radius: int):
    since = datetime.now() - timedelta(days=1)
    async with session_marker() as session:
        result = await session.execute(
            select(Ad)
            .where(
                Ad.created_at >= since
            )
        )
        ads = result.scalars().all()
        filtered_ads = []
        for ad in ads:
            distance = geodesic(
                (center_lat, center_lon),
                (ad.latitude, ad.longitude),
            ).km

            if distance > radius:
                continue

            filtered_ads.append(ad)

        return filtered_ads



def build_daily_report_text(
    ads: list[Ad],
    lan: str,
) -> str:

    count = len(ads)

    texts = {
        "de": {
            "title": "📦 Neue Anzeigen des Tages",
            "empty": "Heute wurden keine neuen Anzeigen veröffentlicht.",
            "summary": f"Heute wurden {count} neue Anzeigen veröffentlicht.",
            "more": "\n\n👉 Werbungstafel öffnen",
        },
        "ru": {
            "title": "📦 Новые объявления за сегодня",
            "empty": "Сегодня новых объявлений не появилось.",
            "summary": f"Сегодня опубликовано {count} новых объявлений.",
            "more": "\n\n👉 Открыть Werbungstafel",
        },
        "uk": {
            "title": "📦 Нові оголошення за сьогодні",
            "empty": "Сьогодні нових оголошень не було.",
            "summary": f"Сьогодні опубліковано {count} нових оголошень.",
            "more": "\n\n👉 Відкрити Werbungstafel",
        },
        "tr": {
            "title": "📦 Bugünün yeni ilanları",
            "empty": "Bugün yeni ilan yayınlanmadı.",
            "summary": f"Bugün {count} yeni ilan yayınlandı.",
            "more": "\n\n👉 Werbungstafel'i aç",
        },
    }

    t = texts.get(lan, texts["de"])

    if count == 0:
        return f"{t['title']}\n\n{t['empty']}"

    msg = [
        t["title"],
        "",
        t["summary"],
        "",
    ]

    for ad in ads[:3]:

        line = f"• {ad.title}"

        if ad.plz:
            line += f" ({ad.plz})"

        msg.append(line)

    if count > 3:
        msg.append("")
        msg.append(f"... und {count - 3} weitere Anzeigen.")

    msg.append(t["more"])

    return "\n".join(msg)


async def get_all_users():
    async with session_marker() as session:

        result = await session.execute(
            select(User)
            .where(User.is_banned == False)
        )

        return result.scalars().all()