from sqlalchemy import select, delete
from postgres_table import User, LoginRequest
from postgres_table import session_marker

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


async def confirm_login(
    token: str,
    telegram_id: int
):
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