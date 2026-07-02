from sqlalchemy import Integer, BigInteger, String, ARRAY, ForeignKey, DateTime
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from config import settings
from datetime import datetime, UTC

engine = create_async_engine(settings.DATABASE_URL, echo=True)

session_marker = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

metadata = Base.metadata

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer,primary_key=True,autoincrement=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger,unique=True,nullable=False)
    username: Mapped[str] = mapped_column(String(100),nullable=True)
    first_name: Mapped[str] = mapped_column(String(100),nullable=False)
    avatar: Mapped[str] = mapped_column(String(500),default="")
    description: Mapped[str] = mapped_column(String(2000),default="")
    city: Mapped[str] = mapped_column(String(200),default="")
    role: Mapped[str] = mapped_column(String(20),default="user")
    paid: Mapped[bool] = mapped_column(default=False)
    lan: Mapped[str] = mapped_column(String(20), default="de")
    first_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), default= lambda : datetime.now(UTC))



class Ad(Base):

    __tablename__ = "ads"

    id: Mapped[int] = mapped_column(Integer,primary_key=True,autoincrement=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    category: Mapped[str] = mapped_column(String(100) )
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(String(5000))
    price: Mapped[str] = mapped_column(String(100),default="")
    plz: Mapped[str] = mapped_column(String(10))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default= lambda : datetime.now(UTC))


class LoginRequest(Base):
    __tablename__ = "login_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    token: Mapped[str] = mapped_column(String(100),unique=True,index=True)
    telegram_id: Mapped[int | None] = mapped_column(BigInteger,nullable=True)
    confirmed: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default= lambda : datetime.now(UTC))



class AdPhoto(Base):

    __tablename__ = "ad_photos"

    id: Mapped[int] = mapped_column(Integer,primary_key=True)
    ad_id: Mapped[int] = mapped_column(ForeignKey("ads.id"))
    photo_url: Mapped[str] = mapped_column(String(500))


class Favorite(Base):
    __tablename__ = "favorites"

    id: Mapped[int] = mapped_column(Integer,primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    ad_id: Mapped[int] = mapped_column(ForeignKey("ads.id"))


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer,primary_key=True )
    ad_id: Mapped[int] = mapped_column(ForeignKey("ads.id"))
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    receiver_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    text: Mapped[str] = mapped_column(String(3900))
    is_read: Mapped[bool] = mapped_column(default=False)


async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

