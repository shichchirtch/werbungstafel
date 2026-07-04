from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware import Middleware
import logging
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from user_repo import (create_user_if_not_exists, get_user_by_tg_id,
                       get_confirmed_login, create_login_token,
                       delete_login_request, create_ad_db, get_ads_by_category,
                       get_ad_by_id, delete_ad_db, get_ads_by_owner,
                       get_user_favorites, create_favorite, delete_favorite_db, check_favorite,
                       get_ad_photos, create_ad_photo, update_ad_db, delete_photo_db,
                       get_profile_db)
import secrets
import string
from lexicon import *
from fastapi.staticfiles import StaticFiles
import os
import shutil

ADMIN_ID = 6685637602


class ExpenseIn(BaseModel):
    user_id: int
    category: str
    title: Optional[str] = None
    price: float


class IncomeIn(BaseModel):
    user_id: int
    title: Optional[str] = None
    amount: float


class AdCreate(BaseModel):
    telegram_id: int
    category: str
    title: str
    description: str
    price: str = ""
    plz: str


class Favorite(BaseModel):
    telegram_id: int
    ad_id: int


class AdUpdate(BaseModel):
    title: str
    description: str
    price: str
    plz: str

class ProfileUpdate(BaseModel):
    telegram_id: int
    name: str
    bio: str
    location: str

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

    await delete_login_request(token)

    return {
        "confirmed": True,
        "telegram_id": user.telegram_id,
        "user_id": user.id,
        "first_name": user.first_name,
    }


@f_api.post("/api/auth/telegram")
async def auth_telegram(data: dict):
    tg_id = data["telegram_id"]
    first_name = data["first_name"]
    username = data.get("username")
    lan = data.get("lan", "de")
    print('tg_id =', tg_id, 'first_name =', first_name, 'username =', username)
    user = await create_user_if_not_exists(
        tg_id=tg_id,
        first_name=first_name,
        username=username,
        lan=lan
    )

    return {
        "user_id": user.id,
        "telegram_id": user.telegram_id,
        "first_name": user.first_name,
    }


####################       WERBUNG    ################################

@f_api.post("/api/ads")
async def create_ad(data: AdCreate):
    user = await get_user_by_tg_id(
        data.telegram_id
    )

    if not user:
        return {
            "ok": False,
            "error": "User not found"
        }

    ad = await create_ad_db(
        owner_id=user.id,
        category=data.category,
        title=data.title,
        description=data.description,
        price=data.price,
        plz=data.plz,
    )

    return {
        "ok": True,
        "ad_id": ad.id
    }


@f_api.get("/api/ads/{category}")
async def get_ads(category: str):
    ads = await get_ads_by_category(category)

    return ads


@f_api.get("/api/ad/{ad_id}")
async def get_ad(ad_id: int):
    """Хэндлер возвращающий данные вербунга на фронт из постгреса"""

    ad = await get_ad_by_id(ad_id)

    if not ad:
        return {"ok": False}

    photos = await get_ad_photos(ad.id)

    return {
        "id": ad.id,
        "ownerId": ad.owner_id,
        "category": ad.category,
        "title": ad.title,
        "description": ad.description,
        "price": ad.price,
        "plz": ad.plz,
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


@f_api.delete("/api/ad/{ad_id}")
async def delete_ad(ad_id: int):
    success = await delete_ad_db(ad_id)

    if not success:
        return {
            "ok": False,
            "error": "Anzeige nicht gefunden"
        }

    return {
        "ok": True
    }


@f_api.get("/api/my-ads/{telegram_id}")
async def get_my_ads(telegram_id: int):
    user = await get_user_by_tg_id(telegram_id)

    if not user:
        return []

    ads = await get_ads_by_owner(user.id)

    return [
        {
            "id": ad.id,
            "ownerId": ad.owner_id,
            "category": ad.category,
            "title": ad.title,
            "plz": ad.plz,
        }
        for ad in ads
    ]


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
        ad_id=data.ad_id,
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

    favorites = await get_user_favorites(user.id)

    return [
        {
            "id": ad.id,
            "ownerId": ad.owner_id,
            "category": ad.category,
            "title": ad.title,
            "plz": ad.plz,
        }
        for ad in favorites
    ]


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

    for photo in photos:
        file_path = (
            f"{folder}/{photo.filename}"
        )

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)

        photo_url = f"/uploads/{ad_id}/{photo.filename}"

        await create_ad_photo(
            ad_id=ad_id,
            photo_url=photo_url,
        )

        urls.append(photo_url)

    return {
        "ok": True,
        "photos": urls,
    }


################################## DELETE WERBUNG ###################################

@f_api.delete("/api/ad/{ad_id}")
async def delete_ad(ad_id: int):
    print(f"DELETE AD {ad_id}")
    success = await delete_ad_db(ad_id)

    if not success:
        return {
            "ok": False,
            "error": "Anzeige nicht gefunden"
        }

    return {
        "ok": True
    }

################################ Редактирование объявления ###########################
@f_api.put("/api/ad/{ad_id}")
async def update_ad(
        ad_id: int,
        data: AdUpdate,
):
    success = await update_ad_db(
        ad_id=ad_id,
        title=data.title,
        description=data.description,
        price=data.price,
        plz=data.plz,
    )
    if not success:
        return {
            "ok": False,
            "error": "Anzeige nicht gefunden"}
    return {"ok": True}


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

################################Profile###########################

@f_api.get("/api/profile/{telegram_id}")
async def get_profile(telegram_id: int,):
    profile = await get_profile_db(telegram_id)
    if not profile:
        return {"ok": False,
            "error": "User not found"}
    return {"ok": True,**profile}