from sqlalchemy import select
from postgres_table import User
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
        user = User(
            telegram_id=tg_id,
            first_name=first_name,
            username=username,
        )
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