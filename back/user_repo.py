from sqlalchemy import select, delete
from postgres_table import User, Session
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


async def create_session(session_id: str, user_id: int):
    print(
        f"CREATE SESSION "
        f"user_id={user_id} "
        f"session_id={session_id}"
    )
    async with session_marker() as session:
        new_session = Session(session_id=session_id, user_id=user_id)
        session.add(new_session)
        await session.commit()
        print("SESSION COMMIT OK")


async def get_user_by_session(session_id: str):
    print("SEARCH SESSION =", session_id)
    async with session_marker() as session:
        query = await session.execute(
            select(User)
            .join(Session, Session.user_id == User.id)
            .where(Session.session_id == session_id)
        )

        user = query.scalar_one_or_none()

        print("USER FOUND =", user)

        return user


async def delete_session(session_id: str):
    async with session_marker() as session:
        await session.execute(delete(Session)
            .where(Session.session_id == session_id) )
        await session.commit()


async def delete_all_user_sessions(user_id: int):

    async with session_marker() as session:

        print(f"DELETE ALL SESSIONS FOR USER {user_id}")

        await session.execute(
            delete(Session)
            .where(Session.user_id == user_id)
        )

        await session.commit()