from sqlalchemy import select, delete, func, and_, or_, update
from postgres_table import User, LoginRequest, Ad, Favorite, AdPhoto, Nachricht
from postgres_table import session_marker
from datetime import datetime, timedelta, UTC
import shutil
import os
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
geolocator = Nominatim(
    user_agent="werbungstafel"
)


async def get_user_by_tg_id(tg_id: int):
    async with session_marker() as session:
        result = await session.execute(
            select(User).where(
                User.telegram_id == tg_id
            )
        )

        return result.scalar_one_or_none()


async def get_user_by_id(user_id: int):
    async with session_marker() as session:
        result = await session.execute(
            select(User).where(User.id == user_id)
        )

        return result.scalar_one_or_none()


async def create_user(tg_id: int, first_name: str,
                      username, lan: str) -> User:
    async with session_marker() as session:
        user = User(telegram_id=tg_id, first_name=first_name, lan=lan, username=username, )
        session.add(user)
        await session.commit()
        return user


async def create_user_if_not_exists(tg_id: int, first_name: str, lan: str,
                                    username, ) -> User:
    user = await get_user_by_tg_id(tg_id)
    if user:
        return user

    return await create_user(
        tg_id=tg_id,
        first_name=first_name,
        lan=lan,
        username=username)


async def update_avatar_db(
        telegram_id: int,
        avatar: str,
) -> bool:
    async with session_marker() as session:
        result = await session.execute(

            select(User).where(
                User.telegram_id == telegram_id
            )

        )

        user = result.scalar_one_or_none()

        if not user:
            return False

        user.avatar = avatar

        await session.commit()

        return True


async def get_user(user_id: int):
    async with session_marker() as session:
        result = await session.execute(
            select(User).where(
                User.telegram_id == user_id)
        )
        return result.scalar_one_or_none()


async def create_login_token(token: str):
    async with session_marker() as session:
        login = LoginRequest(
            token=token)
        session.add(login)
        await session.commit()


async def confirm_login(token: str, telegram_id: int):
    async with session_marker() as session:

        # Ищем в таблице login_requests
        # запись с этим токеном
        stmt = select(LoginRequest).where(
            LoginRequest.token == token
        )

        result = await session.execute(stmt)

        # Получаем найденную запись
        login_request = result.scalar_one_or_none()
        print('LOGIN REQUEST = ', login_request)

        # Если токен не найден —
        if not login_request:
            return False
        if datetime.now(UTC) - login_request.created_at > timedelta(minutes=2):
            await session.delete(login_request)
            await session.commit()
            return False

        # Связываем этот токен
        # с Telegram-пользователем
        login_request.telegram_id = telegram_id

        # Помечаем вход как подтверждённый
        login_request.confirmed = True

        # Сохраняем изменения в БД
        await session.commit()

        return True


async def get_confirmed_login(token: str):
    async with session_marker() as session:

        stmt = select(LoginRequest).where(
            LoginRequest.token == token
        )

        result = await session.execute(stmt)

        login_request = result.scalar_one_or_none()

        if not login_request:
            print("LOGIN REQUEST NOT FOUND")

            return None

        if not login_request.confirmed:
            print("LOGIN NOT CONFIRMED")

            return None

        return login_request


async def delete_login_request(token: str):
    async with session_marker() as session:
        stmt = delete(LoginRequest).where(
            LoginRequest.token == token
        )

        await session.execute(stmt)

        await session.commit()

        print("LOGIN REQUEST DELETED =", token)


async def create_ad_db(owner_id: int, category: str, title: str,
                       description: str, price: str, plz: str, anbieter: bool, latitude: float,
    longitude: float,):
    async with session_marker() as session:
        ad = Ad(
            owner_id=owner_id,
            category=category,
            title=title,
            description=description,
            price=price,
            plz=plz,
            anbieter=anbieter,
            latitude=latitude,
            longitude=longitude,
        )
        session.add(ad)
        await session.commit()
        await session.refresh(ad)
        return ad


async def get_ads_by_category(category: str):
    async with session_marker() as session:
        stmt = (
            select(Ad)
            .where(
                Ad.category == category
            )
            .order_by(
                Ad.id.desc()
            )
        )

        result = await session.execute(stmt)

        ads = result.scalars().all()

        return [
            {
                "id": ad.id,
                "ownerId": ad.owner_id,
                "category": ad.category,
                "title": ad.title,
                "plz": ad.plz,
                "description": ad.description,
                "price": ad.price,
                "photos": [],
                "createdAt": ad.created_at.isoformat(),
                "anbieter": ad.anbieter
            }
            for ad in ads
        ]


async def get_ad_by_id(ad_id: int):
    async with session_marker() as session:
        result = await session.execute(
            select(Ad).where(
                Ad.id == ad_id)
        )
        return result.scalar_one_or_none()


async def delete_ad_favorites(session, ad_id: int, ):
    await session.execute(
        delete(Favorite).where(Favorite.ad_id == ad_id))


async def delete_ad_photos(session, ad_id: int, ):
    await session.execute(delete(AdPhoto).where(AdPhoto.ad_id == ad_id))


async def delete_upload_folder(ad_id: int):
    folder = f"uploads/{ad_id}"
    if os.path.exists(folder):
        shutil.rmtree(folder)


async def delete_ad_db(ad_id: int):
    async with session_marker() as session:
        result = await session.execute(
            select(Ad).where(Ad.id == ad_id)
        )
        ad = result.scalar_one_or_none()

        if not ad:
            return False
        print(f"DELETE FAVORITES {ad_id}")
        await delete_ad_favorites(session, ad_id)

        await delete_ad_photos(session, ad_id)

        await delete_upload_folder(ad_id)

        await session.delete(ad)

        await session.commit()

        return True


async def get_ads_by_owner(owner_id: int):
    async with session_marker() as session:
        result = await session.execute(
            select(Ad)
            .where(Ad.owner_id == owner_id)
            .order_by(Ad.id.desc())
        )

        return result.scalars().all()


async def get_user_favorites(user_id: int):
    async with session_marker() as session:
        result = await session.execute(

            select(Ad)
            .join(
                Favorite,
                Favorite.ad_id == Ad.id
            )
            .where(
                Favorite.user_id == user_id
            )
            .order_by(
                Ad.id.desc()
            )

        )

        return result.scalars().all()


async def create_favorite(user_id: int, ad_id: int, ):
    async with session_marker() as session:
        result = await session.execute(
            select(Favorite).where(
                Favorite.user_id == user_id,
                Favorite.ad_id == ad_id,
            )
        )

        favorite = result.scalar_one_or_none()

        if favorite:
            return False

        favorite = Favorite(
            user_id=user_id,
            ad_id=ad_id,
        )

        session.add(favorite)

        await session.commit()

        return True


async def delete_favorite_db(
        user_id: int,
        ad_id: int,
):
    async with session_marker() as session:
        result = await session.execute(

            select(Favorite).where(
                Favorite.user_id == user_id,
                Favorite.ad_id == ad_id,
            )

        )

        favorite = result.scalar_one_or_none()

        if not favorite:
            return False

        await session.delete(favorite)

        await session.commit()

        return True


async def check_favorite(
        user_id: int,
        ad_id: int,
):
    async with session_marker() as session:
        result = await session.execute(

            select(Favorite).where(
                Favorite.user_id == user_id,
                Favorite.ad_id == ad_id,
            )

        )

        favorite = result.scalar_one_or_none()

        return favorite is not None


async def create_ad_photo(
        ad_id: int,
        photo_url: str,
):
    async with session_marker() as session:
        photo = AdPhoto(
            ad_id=ad_id,
            photo_url=photo_url,
        )

        session.add(photo)

        await session.commit()


async def get_ad_photos(ad_id: int):
    async with session_marker() as session:
        result = await session.execute(

            select(AdPhoto).where(
                AdPhoto.ad_id == ad_id
            )

        )

        return result.scalars().all()


async def update_ad_db(ad_id: int, title: str, description: str, price: str, plz: str, anbieter: bool):
    async with session_marker() as session:
        ad = await session.get(Ad, ad_id, )

        if not ad:
            return False

        ad.title = title
        ad.description = description
        ad.price = price
        ad.plz = plz
        ad.anbieter = anbieter

        await session.commit()

        await session.refresh(ad)

        return True


async def delete_photo_db(photo_id: int):
    async with session_marker() as session:
        photo = await session.get(
            AdPhoto,
            photo_id,
        )

        if not photo:
            return None

        photo_url = photo.photo_url

        await session.delete(photo)

        await session.commit()

        return photo_url  # возращает строку с адресом для удаления по os.remove


############################Profil###################


async def get_profile_db(telegram_id: int):
    async with session_marker() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == telegram_id))

        user = result.scalar_one_or_none()
        if not user:
            return None

        ads_count = await session.scalar(
            select(func.count())

            .select_from(Ad)

            .where(
                Ad.owner_id == user.id
            )
        )

        favorites_count = await session.scalar(

            select(func.count())

            .select_from(Favorite)

            .where(
                Favorite.user_id == user.id
            )

        )

        return {
            "name": user.first_name,
            "bio": user.description,
            "location": user.city,
            "avatar": user.avatar,
            "ads_count": ads_count,
            "favorites_count": favorites_count,
            "latitude": user.latitude,
            "longitude": user.longitude,
            "first_start": user.first_start.strftime("%d.%m.%Y"),
        }


async def update_profile_db(
    telegram_id: int,
    bio: str,
    location: str,
) -> bool:

    async with session_marker() as session:

        result = await session.execute(
            select(User).where(
                User.telegram_id == telegram_id
            )
        )

        user = result.scalar_one_or_none()

        if not user:
            return False

        location_data = geolocator.geocode(
            f"{location}, Germany"
        )

        if location_data is None:
            return False

        user.description = bio
        user.city = location

        user.latitude = round(
            location_data.latitude,
            6,
        )

        user.longitude = round(
            location_data.longitude,
            6,
        )

        await session.commit()

        return True

async def update_profile_and_get_user_db(
    telegram_id: int,
    bio: str,
    location: str,
):

    async with session_marker() as session:

        result = await session.execute(
            select(User).where(
                User.telegram_id == telegram_id
            )
        )

        user = result.scalar_one_or_none()

        if not user:
            return None

        location_data = geolocator.geocode(
            f"{location}, Germany"
        )

        if location_data is None:
            return None

        user.description = bio
        user.city = location

        user.latitude = round(
            location_data.latitude,
            6,
        )

        user.longitude = round(
            location_data.longitude,
            6,
        )

        await session.commit()
        await session.refresh(user)

        return user
########################## Сообщения ###############################

async def create_nachricht_db(ad_id: int, sender_id: int, receiver_id: int, text: str):
    async with session_marker() as session:
        nachrict = Nachricht(
            ad_id=ad_id,
            sender_id=sender_id,
            receiver_id=receiver_id,
            text=text,
        )

        session.add(nachrict)

        await session.commit()

        await session.refresh(nachrict)

        return nachrict


async def get_nachrichten_db(
        ad_id: int,
        sender_id: int,
        receiver_id: int,
):
    async with session_marker() as session:
        result = await session.execute(

            select(Nachricht).where(

                Nachricht.ad_id == ad_id,

                or_(

                    and_(
                        Nachricht.sender_id == sender_id,
                        Nachricht.receiver_id == receiver_id,
                    ),

                    and_(
                        Nachricht.sender_id == receiver_id,
                        Nachricht.receiver_id == sender_id,
                    ),

                )

            ).order_by(
                Nachricht.created_at
            )
        )
        nachrichten = result.scalars().all()
        return [

            {
                "id": n.id,
                "sender_id": n.sender_id,
                "receiver_id": n.receiver_id,
                "text": n.text,
                "created_at": n.created_at.isoformat(),
                "is_read": n.is_read,
            }
            for n in nachrichten
        ]


async def get_chats_db(user_id: int):
    async with session_marker() as session:

        stmt = (
            select(Nachricht)
            .where(
                or_(
                    Nachricht.sender_id == user_id,
                    Nachricht.receiver_id == user_id,
                )
            )
            .order_by(
                Nachricht.created_at.desc()
            )
        )

        result = await session.execute(stmt)

        nachrichten = result.scalars().all()

        # Собираем id всех собеседников
        other_ids = set()

        # Количество непрочитанных сообщений
        unread = {}

        for msg in nachrichten:

            other_id = (
                msg.receiver_id
                if msg.sender_id == user_id
                else msg.sender_id
            )

            other_ids.add(other_id)

            key = (
                msg.ad_id,
                other_id,
            )

            if (
                    msg.receiver_id == user_id
                    and not msg.is_read
            ):
                unread[key] = unread.get(key, 0) + 1

        if not other_ids:
            return []

        # Одним запросом загружаем всех пользователей
        result = await session.execute(

            select(User).where(
                User.id.in_(other_ids)
            )

        )

        users = {
            user.id: user
            for user in result.scalars()
        }

        chats = {}

        for msg in nachrichten:

            other_id = (
                msg.receiver_id
                if msg.sender_id == user_id
                else msg.sender_id
            )

            key = (
                msg.ad_id,
                other_id,
            )

            # Уже добавили этот диалог
            if key in chats:
                continue

            other_user = users[other_id]

            chats[key] = {

                "ad_id": msg.ad_id,

                "user_id": other_user.id,

                "telegram_id": other_user.telegram_id,

                "name": other_user.first_name,

                "avatar": other_user.avatar,

                "last_message": msg.text,

                "created_at": msg.created_at.isoformat(),

                "is_read": msg.is_read,

                "unread": unread.get(key, 0),

            }

        return list(chats.values())


async def mark_messages_read_db(ad_id: int, sender_id: int, receiver_id: int):
    async with session_marker() as session:
        stmt = (
            update(Nachricht)
            .where(
                Nachricht.ad_id == ad_id,
                Nachricht.sender_id == sender_id,
                Nachricht.receiver_id == receiver_id,
                Nachricht.is_read == False,
            )

            .values(
                is_read=True
            )

        )

        result = await session.execute(stmt)

        await session.commit()

        return result.rowcount


async def get_ads_by_radius_db(
    category: str,
    center_lat: float,
    center_lon: float,
    radius: int,
):
    async with session_marker() as session:

        stmt = (
            select(Ad)
            .where(
                Ad.category == category
            )
            .order_by(
                Ad.id.desc()
            )
        )

        result = await session.execute(stmt)

        ads = result.scalars().all()

        filtered_ads = []

        for ad in ads:

            distance = geodesic(
                (center_lat, center_lon),
                (ad.latitude, ad.longitude),
            ).km

            if distance > radius:
                continue

            filtered_ads.append({

                "id": ad.id,

                "ownerId": ad.owner_id,

                "category": ad.category,

                "title": ad.title,

                "plz": ad.plz,

                "description": ad.description,

                "price": ad.price,

                "photos": [],

                "createdAt": ad.created_at.isoformat(),

                "anbieter": ad.anbieter,

                "distance": round(distance, 1),

            })

        return filtered_ads


async def get_ads_count_by_category(category: str):
    async with session_marker() as session:

        return await session.scalar(

            select(func.count())

            .select_from(Ad)

            .where(
                Ad.category == category
            )

        )



async def get_map_data_db():

    async with session_marker() as session:

        result = await session.execute(

            select(
                Ad.plz,
                Ad.latitude,
                Ad.longitude,
                func.count(Ad.id).label("count"),
            )

            .where(
                Ad.latitude.is_not(None),
                Ad.longitude.is_not(None),
            )

            .group_by(
                Ad.plz,
                Ad.latitude,
                Ad.longitude,
            )

            .order_by(
                func.count(Ad.id).desc()
            )

        )

        rows = result.all()

        return [

            {
                "place": row.plz,
                "latitude": row.latitude,
                "longitude": row.longitude,
                "count": row.count,
            }

            for row in rows

        ]