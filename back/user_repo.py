from sqlalchemy import select, delete
from postgres_table import User, LoginRequest, Ad, Favorite
from postgres_table import session_marker
from datetime import datetime, timedelta, UTC

async def get_user_by_tg_id(tg_id: int):

    async with session_marker() as session:

        result = await session.execute(
            select(User).where(
                User.telegram_id == tg_id
            )
        )

        return result.scalar_one_or_none()

async def create_user(tg_id: int,first_name: str, username: str | None = None):
    async with session_marker() as session:
        user = User(telegram_id=tg_id,first_name=first_name,username=username)
        session.add(user)
        await session.commit()
        return user


async def create_user_if_not_exists(tg_id: int, first_name: str,username: str | None = None,):
    user = await get_user_by_tg_id(tg_id)
    if user:
        return user

    return await create_user(
        tg_id=tg_id,
        first_name=first_name,
        username=username,
    )

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


async def confirm_login( token: str, telegram_id: int):
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

async def create_ad_db(owner_id: int, category: str, title: str, description: str, price: str, plz: str,):

    async with session_marker() as session:

        ad = Ad(
            owner_id=owner_id,
            category=category,
            title=title,
            description=description,
            price=price,
            plz=plz,
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

async def delete_ad_db(ad_id: int):

    async with session_marker() as session:

        result = await session.execute(
            select(Ad).where(
                Ad.id == ad_id
            )
        )

        ad = result.scalar_one_or_none()

        if not ad:
            return False

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

async def create_favorite(user_id: int, ad_id: int,):
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