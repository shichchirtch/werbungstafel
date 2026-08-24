from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware import Middleware
import logging
from pydantic import BaseModel

from user_repo import (create_user_if_not_exists, get_user_by_tg_id,
                       get_confirmed_login, create_login_token,
                       delete_login_request, create_ad_db, get_ads_by_category,
                       get_ad_by_id, delete_ad_db, get_ads_by_owner,
                       get_user_favorites, create_favorite, delete_favorite_db, check_favorite,
                       get_ad_photos, create_ad_photo, update_ad_db, delete_photo_db,
                       get_profile_db, get_ads_by_radius_db,
                       create_nachricht_db, get_nachrichten_db, get_ads_count_by_category,
                       get_chats_db, mark_messages_read_db, update_profile_and_get_user_db,
                       get_map_data_db, get_ads_by_place_db, toggle_user_ban,
                       get_user_profile_by_id, get_user_by_id, create_message_attachment,
                       get_last_user_ad, get_ad_statistics, register_ad_view_db,
                       register_ad_favorite_db, get_new_banners, werbung_top,
                       delete_ad_admin_db, mark_messages_as_read, get_unread_messages_db,
                       archive_ad_db, toggle_shadow_ban_db,
                       is_admin, get_shadow_banned_ads_db,
                       get_user_ads_db, get_public_user_profile_by_id,
                       toggle_user_block_db, get_user_block_status_db, should_notify_receiver,
                       )
import secrets
import string, math
from fastapi.staticfiles import StaticFiles
import os
from PIL import Image, ImageOps
from static_functions import (notify_receiver, notify_ad_changed, notify_ad_created,
                              notify_ad_deleted, notify_user_ban_changed)

from geopy.geocoders import Nominatim
from datetime import datetime, timedelta
from bot_instance import bot

geolocator = Nominatim(
    user_agent="werbungstafel"
)

ADMIN_ID = 6685637602


class ReportAd(BaseModel):
    ad_id: int
    reporter_id: int
    reason: str


class AdView(BaseModel):
    telegram_id: int


class AdCreate(BaseModel):
    telegram_id: int
    category: str
    title: str
    description: str
    price: str = ""
    plz: str
    anbieter: bool = True


class ShadowBanRequest(BaseModel):
    user_id: int


class Favorite(BaseModel):
    telegram_id: int
    ad_id: int


class AdUpdate(BaseModel):
    title: str
    description: str
    price: str
    plz: str
    anbieter: bool


class ProfileUpdate(BaseModel):
    telegram_id: int
    bio: str
    location: str


class CreateNachricht(BaseModel):
    ad_id: int
    sender_id: int
    receiver_id: int
    text: str


class ReadMessages(BaseModel):
    ad_id: int
    sender_id: int
    receiver_id: int


f_api = FastAPI(
    middleware=[
        Middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    ]
)

logger = logging.getLogger("fastapi")

f_api.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@f_api.get("/api/login")
async def browser_login():
    print("\nCREATE LOGIN")

    # token = str(uuid.uuid4())
    alphabet = string.ascii_uppercase + string.digits

    token = ''.join(
        secrets.choice(alphabet)
        for _ in range(6)
    )

    print("TOKEN =", token)
    await create_login_token(token)

    return {
        "token": token,
        "telegram_url":
            f"https://t.me/bedienung_bot?start={token}"
    }


@f_api.get("/api/login-status/{token}")
async def login_status(token: str):
    """авторизаия через обычный браузер"""
    login_request = await get_confirmed_login(token)

    if not login_request:
        return {
            "confirmed": False
        }

    user = await get_user_by_tg_id(
        login_request.telegram_id
    )

    if not user:
        return {
            "confirmed": False
        }
    if user.is_banned:
        return {
            "ok": False,
            "error": "Ihr Konto wurde gesperrt."
        }
    await delete_login_request(token)

    return {
        "confirmed": True,
        "telegram_id": user.telegram_id,
        "user_id": user.id,
        "first_name": user.first_name,
        "role": user.role,
        "lan": user.lan,

    }


@f_api.post("/api/auth/telegram")
async def auth_telegram(data: dict):
    """Авторизация через телефон или десктоп"""
    tg_id = data["telegram_id"]
    first_name = data["first_name"]
    username = data.get("username")
    lan = data.get("lan", "de")
    print('tg_id =', tg_id, 'first_name =', first_name, 'username =', username, 'lan=', lan)
    user = await create_user_if_not_exists(
        tg_id=tg_id,
        first_name=first_name,
        username=username,
        lan=lan
    )

    if isinstance(user, dict):
        return user

    return {
        "user_id": user.id,
        "telegram_id": user.telegram_id,
        "first_name": user.first_name,
        "role": user.role,
        "lan": user.lan
    }


####################       WERBUNG    ################################

@f_api.post("/api/ads")
async def create_ad(data: AdCreate):
    user = await get_user_by_tg_id(data.telegram_id)

    if not user:
        return {
            "ok": False,
            "error": "User not found"
        }

    if user.is_banned:
        return {
            "ok": False,
            "error": "Ihr Konto wurde gesperrt."
        }

    last_ad = await get_last_user_ad(user.id)

    if last_ad:

        delta = datetime.now() - last_ad.created_at

        if delta < timedelta(minutes=30):
            remaining = timedelta(minutes=30) - delta

            minutes = math.ceil(
                remaining.total_seconds() / 60
            )

            return {
                "ok": False,
                "error":
                    f"Du kannst erst in {minutes} Minuten "
                    f"eine neue Anzeige veröffentlichen."
            }

    # Ищем место по тому, что ввёл пользователь:
    # PLZ или название города
    try:
        location = geolocator.geocode(
            f"{data.plz.strip()}, Germany"
        )
    except Exception:
        return {
            "ok": False,
            "error": "Fehler beim Suchen des Ortes"
        }

    if location is None:
        return {
            "ok": False,
            "error": "Ort oder Postleitzahl wurde nicht gefunden"
        }

    # -----------------------------------------
    # PLZ / CITY
    # -----------------------------------------

    entered_place = data.plz.strip()

    if entered_place.isdigit() and len(entered_place) == 5:

        # Пользователь ввёл PLZ
        plz = entered_place

        # Для PLZ делаем reverse geocoding,
        # потому что результат обычного geocode может быть
        # объектом почтового индекса без названия города.

        try:

            reverse_location = geolocator.reverse(
                (location.latitude, location.longitude),
                exactly_one=True,
                language="de",
            )

        except Exception:

            reverse_location = None

        if reverse_location:

            address = reverse_location.raw.get("address", {})

            city = (
                    address.get("city")
                    or address.get("town")
                    or address.get("village")
                    or address.get("municipality")
                    or ""
            )

        else:

            city = ""
    else:

        # Пользователь ввёл название города
        plz = ""

        address = location.raw.get("address", {})

        city = (
                address.get("city")
                or address.get("town")
                or address.get("village")
                or address.get("municipality")
                or location.raw.get("name", entered_place)
        )

    osm_id = location.raw["osm_id"]

    latitude = round(location.latitude, 6)
    longitude = round(location.longitude, 6)

    # -----------------------------------------
    # CREATE AD
    # -----------------------------------------

    ad = await create_ad_db(
        owner_id=user.id,
        category=data.category,
        title=data.title,
        description=data.description,
        price=data.price,
        plz=plz,
        city=city,
        osm_id=osm_id,
        anbieter=data.anbieter,
        latitude=latitude,
        longitude=longitude,
    )

    await notify_ad_created(
        user.id,
        ad,
        user.lan
    )

    return {
        "ok": True,
        "ad_id": ad.id
    }


@f_api.get("/api/ads/{category}")
async def get_ads(category: str, place: str = "Deutschland", radius: str = "Alle", ):
    all_ads_count = await get_ads_count_by_category(category)

    if radius == "Alle":
        ads = await get_ads_by_category(category)

        return {
            "all_ads_count": all_ads_count,
            "ads": ads,
        }

    try:
        location = geolocator.geocode(f"{place}, Germany")
    except Exception:
        return {
            "all_ads_count": all_ads_count,
            "ads": [],
        }
    if location is None:
        return {
            "all_ads_count": all_ads_count,
            "ads": [],
        }
    else:
        ads = await get_ads_by_radius_db(
            category=category,
            center_lat=location.latitude,
            center_lon=location.longitude,
            radius=int(radius.replace(" km", "")),
        )

    return {
        "all_ads_count": all_ads_count,
        "ads": ads,
    }


@f_api.get("/api/ad/{ad_id}")
async def get_ad(ad_id: int):
    """Хэндлер возвращающий данные вербунга на фронт из постгреса"""
    ad, owner_name = await get_ad_by_id(ad_id)
    if not ad:
        return {"ok": False}
    photos = await get_ad_photos(ad.id)
    stats = await get_ad_statistics(ad.id)
    return {
        "id": ad.id,
        "ownerId": ad.owner_id,
        "category": ad.category,
        "title": ad.title,
        "description": ad.description,
        "price": ad.price,
        "plz": ad.plz,
        "city": ad.city,
        "pinned": ad.pinned,
        "anbieter": ad.anbieter,
        "ownerName": owner_name,
        "views": stats["views"],
        "favorites": stats["favorites"],
        "archived": ad.archived,
        "untouch": ad.untouch,
        "sh_banned": ad.sh_banned,
        "photos": [
            {
                "id": photo.id,
                "url": photo.photo_url,
            }
            for photo in photos
        ],
        "createdAt": (
            ad.created_at.isoformat()
            if ad.created_at
            else None
        )
    }


@f_api.get("/api/my-ads/{telegram_id}")
async def get_my_ads(telegram_id: int):
    user = await get_user_by_tg_id(telegram_id)

    if not user:
        return []

    return await get_ads_by_owner(user.id)


########################## MerkList ####################################

@f_api.post("/api/favorites")
async def add_favorite(data: Favorite):
    user = await get_user_by_tg_id(
        data.telegram_id
    )

    if not user:
        return {
            "ok": False,
            "error": "User not found"
        }

    success = await create_favorite(
        user_id=user.id,
        ad_id=data.ad_id)

    await register_ad_favorite_db(
        ad_id=data.ad_id,
        user_id=user.id,
        is_favorite=True,
    )

    if not success:
        return {
            "ok": False,
            "error": "Anzeige bereits gespeichert"
        }
    return {"ok": True}


@f_api.get("/api/favorites/{telegram_id}")
async def get_favorites(telegram_id: int):
    user = await get_user_by_tg_id(telegram_id)

    if not user:
        return []

    return await get_user_favorites(user.id)


@f_api.delete("/api/favorites")
async def delete_favorite(data: Favorite):
    user = await get_user_by_tg_id(
        data.telegram_id
    )

    if not user:
        return {
            "ok": False,
            "error": "User not found"
        }

    success = await delete_favorite_db(
        user_id=user.id,
        ad_id=data.ad_id,
    )
    await register_ad_favorite_db(
        ad_id=data.ad_id,
        user_id=user.id,
        is_favorite=False,
    )
    if not success:
        return {
            "ok": False,
            "error": "Favorite not found"}
    return {"ok": True}


@f_api.get("/api/favorites/{telegram_id}/{ad_id}")
async def is_favorite(telegram_id: int, ad_id: int):
    user = await get_user_by_tg_id(telegram_id)
    if not user:
        return {"isFavorite": False}

    check = await check_favorite(user_id=user.id, ad_id=ad_id, )

    return {"isFavorite": check}


######################### Загрузка фото ##############################
@f_api.post("/api/upload-photo")
async def upload_photos(ad_id: int = Form(...), photos: list[UploadFile] = File(...)):
    folder = f"uploads/{ad_id}"
    os.makedirs(folder, exist_ok=True)
    urls = []
    for i, photo in enumerate(photos, 1):

        filename = (
                os.path.splitext(photo.filename)[0]
                + ".jpg"
        )

        file_path = f"{folder}/{filename}"
        img = ImageOps.exif_transpose(
            Image.open(photo.file)
        )

        if img.width > 10000 or img.height > 10000:
            return {
                "ok": False,
                "error": "Bild ist zu groß"
            }

        if img.mode != "RGB":
            img = img.convert("RGB")

        img.thumbnail((1600, 1600))

        img.save(
            file_path,
            format="JPEG",
            quality=70,
            optimize=True,
            progressive=True
        )

        thumb = img.copy()

        thumb.thumbnail((300, 300))

        thumb_filename = (
                os.path.splitext(photo.filename)[0]
                + "_thumb.jpg"
        )

        thumb_path = f"{folder}/{thumb_filename}"

        thumb.save(
            thumb_path,
            format="JPEG",
            quality=65,
            optimize=True,
            progressive=True
        )

        photo_url = f"/uploads/{ad_id}/{filename}"
        thumb_url = f"/uploads/{ad_id}/{thumb_filename}"

        await create_ad_photo(
            ad_id=ad_id,
            photo_url=photo_url,
            thumb_url=thumb_url,
        )
        urls.append(photo_url)
    return {
        "ok": True,
        "photos": urls,
    }


############################### Удаление объявления ##############################
@f_api.delete("/api/ad/{ad_id}")
async def delete_ad(ad_id: int, data: dict):
    role = data.get("role")
    if role == "admin":
        ad = await delete_ad_admin_db(ad_id)
    else:

        ad = await delete_ad_db(ad_id)

    if not ad:
        return {
            "ok": False,
            "error": "Anzeige nicht gefunden"
        }

    await notify_ad_deleted(
        owner_id=ad.owner_id,
        ad=ad,
    )

    return {
        "ok": True
    }


################################ Редактирование объявления ###########################

@f_api.put("/api/ad/{ad_id}")
async def update_ad(ad_id: int, data: AdUpdate):
    ad = await update_ad_db(
        ad_id=ad_id,
        title=data.title,
        description=data.description,
        price=data.price,
        plz=data.plz,
        anbieter=data.anbieter,
    )

    if not ad:
        return {
            "ok": False,
            "error": "Anzeige nicht gefunden"
        }

    await notify_ad_changed(
        owner_id=ad.owner_id,
        ad=ad,
    )

    return {
        "ok": True
    }


@f_api.delete("/api/photo/{photo_id}")
async def delete_photo(photo_id: int):
    photo_url = await delete_photo_db(photo_id)

    if not photo_url:
        return {
            "ok": False,
            "error": "Foto nicht gefunden"
        }

    file_path = photo_url.lstrip("/")

    if os.path.exists(file_path):
        os.remove(file_path)

    return {
        "ok": True
    }


################################ Profile ###########################

@f_api.get("/api/profile/{telegram_id}")
async def get_profile(telegram_id: int, ):
    profile = await get_profile_db(telegram_id)
    if not profile:
        return {"ok": False,
                "error": "User not found"}
    return {"ok": True, **profile}


@f_api.put("/api/profile/{telegram_id}")
async def update_profile(telegram_id: int, data: ProfileUpdate):
    """Хэндлер Обновляет профиль"""
    user = await update_profile_and_get_user_db(
        telegram_id=telegram_id,
        bio=data.bio,
        location=data.location,
    )

    if not user:
        return {
            "ok": False,
            "error": "User not found",
        }

    return {
        "ok": True,
        "bio": user.description,
        "location": user.city,
        "latitude": user.latitude,
        "longitude": user.longitude,
    }


############################### Nachricht #########################################

@f_api.post("/api/messages")
async def create_nachricht(
    ad_id: int = Form(...),
    sender_id: int = Form(...),
    receiver_id: int = Form(...),
    text: str = Form(""),
    photos: list[UploadFile] = File(default=[]),
):

    sender = await get_user_by_id(sender_id)

    if not sender:
        return {
            "ok": False,
            "error": "Benutzer wurde nicht gefunden."
        }

    if sender.is_banned:
        return {
            "ok": False,
            "error": "Ihr Konto wurde gesperrt."
        }

    # --------------------------------
    # СОЗДАЁМ СООБЩЕНИЕ
    # --------------------------------

    nachricht = await create_nachricht_db(
        ad_id=ad_id,
        sender_id=sender_id,
        receiver_id=receiver_id,
        text=text,
    )

    # Административная блокировка
    if nachricht is None:
        return {
            "ok": False,
            "error": "Dieser Benutzer kann keine Nachrichten von Ihnen empfangen."
        }

    # --------------------------------
    # ВЛОЖЕНИЯ
    # --------------------------------

    folder = f"uploads/messages/{nachricht.id}"
    os.makedirs(folder, exist_ok=True)

    attachments = []

    for photo in photos:

        filename = (
            os.path.splitext(photo.filename or "photo")[0]
            + ".jpg"
        )

        file_path = f"{folder}/{filename}"

        img = ImageOps.exif_transpose(
            Image.open(photo.file)
        )

        if img.width > 10000 or img.height > 10000:
            return {
                "ok": False,
                "error": "Bild ist zu groß"
            }

        if img.mode != "RGB":
            img = img.convert("RGB")

        img.thumbnail((1600, 1600))

        img.save(
            file_path,
            format="JPEG",
            quality=70,
            optimize=True,
            progressive=True
        )

        file_url = (
            f"/uploads/messages/"
            f"{nachricht.id}/{filename}"
        )

        print(file_url)

        await create_message_attachment(
            message_id=nachricht.id,
            type="photo",
            file_url=file_url,
        )

        attachments.append({
            "type": "photo",
            "file_url": file_url,
        })

    # --------------------------------
    # TELEGRAM УВЕДОМЛЕНИЕ
    # --------------------------------

    should_notify = await should_notify_receiver(
        receiver_id=receiver_id,
        sender_id=sender_id,
    )

    if should_notify:
        await notify_receiver(receiver_id)

    # --------------------------------

    print("received ID =", receiver_id)
    print("=" * 60)
    print("MESSAGE ID =", nachricht.id)
    print("PHOTOS =", len(photos))


    return {
        "ok": True,
        "nachricht": {
            "id": nachricht.id,
            "ad_id": nachricht.ad_id,
            "sender_id": nachricht.sender_id,
            "receiver_id": nachricht.receiver_id,
            "text": nachricht.text,
            "created_at": nachricht.created_at.isoformat(),
            "is_read": nachricht.is_read,
            "attachments": attachments,
        }
    }

@f_api.get("/api/messages/{ad_id}/{sender_id}/{receiver_id}")
async def get_nachrichten(ad_id: int, sender_id: int, receiver_id: int):
    nachrichten = await get_nachrichten_db(
        ad_id=ad_id,
        sender_id=sender_id,
        receiver_id=receiver_id,
    )

    return {
        "ok": True,
        "nachrichten": nachrichten,
    }


@f_api.get("/api/chats/{user_id}")
async def get_chats(user_id: int, page: int = 1):
    chats, total_pages = await get_chats_db(user_id=user_id, page=page)

    return {
        "ok": True,
        "chats": chats,
        "page": page,
        "total_pages": total_pages,
    }


@f_api.put("/api/messages/read")
async def mark_messages_read(data: ReadMessages):
    count = await mark_messages_read_db(
        ad_id=data.ad_id,
        sender_id=data.sender_id,
        receiver_id=data.receiver_id,
    )

    return {
        "ok": True,
        "updated": count,
    }


################################# MAP ##################################

@f_api.get("/api/map")
async def get_map():
    data = await get_map_data_db()
    return data


@f_api.get("/api/place/{place}")
async def get_place_ads(place: str):
    ads = await get_ads_by_place_db(place)

    return ads


################################ B A N & T O P #####################################

@f_api.put("/api/users/{user_id}/ban")
async def ban_user(user_id: int):
    success, is_banned = await toggle_user_ban(user_id)

    if not success:
        return {
            "ok": False,
            "error": "Benutzer nicht gefunden"
        }

    await notify_user_ban_changed(
        user_id=user_id,
        is_banned=is_banned,
    )
    return {
        "ok": True,
        "is_banned": is_banned,
    }


@f_api.post("/api/ad/{ad_id}/pin")
async def toggle_ad_pin(ad_id: int, data: dict):
    user_id = data.get("user_id")

    if not user_id:
        return {
            "ok": False,
            "error": "Nicht autorisiert",
        }
    success, result = await werbung_top(user_id, ad_id)

    if not success:
        return {
            "ok": False,
            "error": result,
        }

    return {
        "ok": True,
        "pinned": result,
    }


############################## Профиль юзера

@f_api.get("/api/user-profile/{user_id}")
async def get_user_profile(user_id: int):
    profile = await get_user_profile_by_id(user_id)

    if not profile:
        return {
            "ok": False,
            "error": "Benutzer wurde nicht gefunden"
        }

    return {
        "ok": True,
        **profile
    }


############### Чужой профиль
@f_api.get("/api/public-user-profile/{user_id}")
async def get_public_user_profile(user_id: int):
    profile = await get_public_user_profile_by_id(user_id)

    if not profile:
        return {
            "ok": False,
            "error": "Benutzer wurde nicht gefunden"
        }

    return {
        "ok": True,
        **profile
    }


##################################### Melden ################################


@f_api.post("/api/report-ad")
async def report_ad(data: ReportAd):
    reporter = await get_user_by_id(data.reporter_id)

    if not reporter:
        return {
            "ok": False,
            "error": "Benutzer nicht gefunden."
        }

    ad, owner_name = await get_ad_by_id(data.ad_id)

    if not ad:
        return {
            "ok": False,
            "error": "Anzeige nicht gefunden."
        }

    link = f"https://werbungstafel.org/ad/{ad.id}"

    try:

        await bot.send_message(
            chat_id=-5574985398,
            text=(
                "🚨 <b>Neue Meldung</b>\n\n"
                f"<b>Grund:</b> {data.reason}\n\n"
                f"🆔 Anzeige #{ad.id}\n"
                f"📌 <b>{ad.title}</b>\n"
                f"👤 von {owner_name}\n"
                f"📍 {ad.plz}\n\n"
                f"<b>Gemeldet von:</b> {reporter.first_name}\n\n"
                f"🔗 {link}"
            ),
            parse_mode="HTML"
        )
    except Exception as e:
        print(e)
        return {
            "ok": False,
            "error": "Telegram Fehler"}
    return {
        "ok": True}


################################### Каунтер просмотров ####################################
class AdView(BaseModel):
    telegram_id: int


@f_api.post("/api/ad-view/{ad_id}")
async def register_ad_view(
        ad_id: int,
        data: AdView,
):
    user = await get_user_by_tg_id(
        data.telegram_id
    )
    if not user:
        return {"ok": False}

    await register_ad_view_db(
        ad_id=ad_id,
        user_id=user.id,
    )
    return {"ok": True}


############################################# BANNER #################################

@f_api.get("/api/banners")
async def get_banners():
    banners = await get_new_banners()

    return [
        {
            "position": banner.position,
            "imageUrl": banner.image_url,
            "targetUrl": banner.target_url,
        }
        for banner in banners
    ]


################################# Chat reads ###############################

@f_api.post("/api/messages/read")
async def mark_messages_read(data: dict):
    ad_id = data.get("ad_id")
    receiver_id = data.get("receiver_id")
    sender_id = data.get("sender_id")
    if not ad_id or not receiver_id or not sender_id:
        return {
            "ok": False,
            "error": "Fehlende Daten",
        }
    await mark_messages_as_read(ad_id=ad_id, receiver_id=receiver_id, sender_id=sender_id, )
    return {
        "ok": True
    }


################################# Возврат  непрочитанных сообщений во фронт #######################

@f_api.get("/api/messages/unread/{user_id}")
async def get_unread_messages(user_id: int):
    count = await get_unread_messages_db(user_id)
    return {
        "ok": True,
        "unread": count,
    }


#############################################Архивация объявления

@f_api.patch("/api/ad/{ad_id}/archive")
async def archive_ad(ad_id: int):
    ad = await archive_ad_db(ad_id)

    if not ad:
        return {
            "ok": False,
            "error": "Anzeige nicht gefunden"
        }

    return {
        "ok": True
    }


################################### Теневой бан
@f_api.patch("/api/ad/{ad_id}/shadow-ban")
async def toggle_shadow_ban(
        ad_id: int,
        data: ShadowBanRequest,
):
    if not await is_admin(data.user_id):
        return {
            "ok": False,
            "error": "Keine Berechtigung",
        }

    sh_banned = await toggle_shadow_ban_db(
        ad_id=ad_id,
    )

    if sh_banned is None:
        return {
            "ok": False,
            "error": "Anzeige nicht gefunden",
        }

    return {
        "ok": True,
        "sh_banned": sh_banned,
    }


############################################# Admin Sh_BAN
@f_api.get("/api/admin/shadow-banned")
async def get_shadow_banned_ads(user_id: int):
    if not await is_admin(user_id):
        return {
            "ok": False,
            "error": "Keine Berechtigung",
        }

    ads = await get_shadow_banned_ads_db()

    return {
        "ok": True,
        "ads": ads,
    }


################################################Хэндлер собирающий вербунги юзера

@f_api.get("/api/user/{user_id}/ads")
async def get_user_ads(user_id: int):
    ads = await get_user_ads_db(
        user_id=user_id
    )

    return {
        "ok": True,
        "ads": ads,
    }


###################################### Пользовательски блок переписки
@f_api.get("/api/user-block/{blocked_id}")
async def get_user_block_status(
    blocked_id: int,
    blocker_id: int,
):
    blocked = await get_user_block_status_db(
        blocker_id=blocker_id,
        blocked_id=blocked_id,
    )

    return {
        "ok": True,
        "blocked": blocked,
    }


@f_api.patch("/api/user-block/{blocked_id}")
async def toggle_user_block(blocked_id: int, blocker_id: int,):
    if blocker_id == blocked_id:
        return {
            "ok": False,
            "error": "Sie können sich nicht selbst blockieren."
        }

    blocked = await toggle_user_block_db(
        blocker_id=blocker_id,
        blocked_id=blocked_id,
    )

    return {
        "ok": True,
        "blocked": blocked,
    }
