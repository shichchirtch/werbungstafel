from aiogram_dialog import Dialog, Window, ShowMode
from aiogram_dialog.widgets.text import Const, Format
from aiogram_dialog.widgets.kbd import Button, Row, Next, Cancel, Start
from aiogram_dialog.widgets.input import MessageInput
from aiogram.types import CallbackQuery, Message, User
from aiogram_dialog import DialogManager
from bot_instance import ADMIN, bot, BANNER
from aiogram.types import ContentType
from aiogram.exceptions import TelegramForbiddenError
from static_functions import check_len_note, get_translate
from pathlib import Path
from aiogram.types import FSInputFile
import os
from static_functions import get_users_count, get_ads_today_count, get_all_users
from postgres_table import session_marker, Banner
import asyncio
from sqlalchemy import select
from user_repo import deactivate_banner

message_queue = asyncio.Queue()


async def queue_sender_message(
    chat_id: int,
    content: str,
):
    """
    Добавляет текстовое сообщение в очередь.
    """

    await message_queue.put(
        {
            "chat_id": chat_id,
            "content": content,
        }
    )

async def message_sender_worker():
    """
    Постоянно отправляет сообщения из очереди
    с ограничением скорости Telegram.
    """

    while True:

        message = await message_queue.get()

        try:

            await bot.send_message(
                chat_id=message["chat_id"],
                text=message["content"],
            )

        except Exception as e:

            print(
                f"Queue send error: {e}"
            )

        finally:

            message_queue.task_done()

        # ~12.5 сообщений/сек.
        await asyncio.sleep(0.08)


admin_id = 6685637602


async def message_text_acc(message: Message, widget: MessageInput, dialog_manager: DialogManager) -> None:
    '''Функция посылаем мне сообщения юзеров'''
    name = message.from_user.first_name
    user_name = message.from_user.username
    user_id = message.from_user.id
    note = check_len_note(message.text)
    note = f'{note}\n\n\n von {name}  {user_name} \n\ntg Id = {user_id}'
    await bot.send_message(admin_id, note)
    await asyncio.sleep(1)
    lan = dialog_manager.dialog_data['lan']
    await message.answer(text='test')  # wurde_gesendet[lan])
    await asyncio.sleep(1)
    dialog_manager.show_mode = ShowMode.DELETE_AND_SEND
    await dialog_manager.done()


async def accepet_admin_message(msg: Message, widget: MessageInput, dialog_manager: DialogManager, *args, **kwargs):
    dialog_manager.dialog_data['admin_msg'] = msg.text
    await dialog_manager.next()


async def get_users(redis) -> list[int]:
    user_ids = await redis.smembers("users:all")
    return [int(uid) for uid in user_ids]


async def wie_viel_schon_gestarted(callback: CallbackQuery, widget: Button, dialog_manager: DialogManager, *args, **kwargs):
    count = await get_users_count()
    count_werbungs = await get_ads_today_count()
    await callback.message.answer(
        f"📦 Сегодня опубликовано объявлений: {count_werbungs}\n\n"
        f"👥 Пользователей в базе: {count}")
    await dialog_manager.done()




async def downloads_users_db(callback, button, manager):
    file_path = Path("data/telegram_users.json")

    print("PWD =", os.getcwd())
    # print("FILE =", USERS_FILE)
    # print("EXISTS =", USERS_FILE.exists())
    print('file_path = ', file_path.exists())
    if not file_path.exists():
        await callback.message.answer(
            "❌ Файл telegram_users.json не найден."
        )

        return

    await callback.message.answer_document(
        document=FSInputFile(file_path),
        caption="📦 Резервная база пользователей",
    )


async def sending_msg(cb: CallbackQuery, widget: Button, dialog_manager: DialogManager, *args, **kwargs):
    text_from_admin = dialog_manager.dialog_data['admin_msg']
    count = 0
    if text_from_admin.startswith('one'):
        prefix, us_id, text_msg = text_from_admin.split('$')  # one$12345678$admin_text
        user_id = int(us_id)
        try:
            await cb.bot.send_message(chat_id=user_id, text=text_msg)
            await cb.message.answer('Message is sent !')

        except Exception as e:
            await cb.message.answer(f'Msg is not sent due to {e}')
        await dialog_manager.done()
    else:
        users_list = await  get_all_users()
        temp_dict = {}
        for user in users_list:
            lan = user.lan
            try:
                translated_text = await get_translate(text_from_admin, lan, temp_dict)
                await queue_sender_message(
                    chat_id=user.telegram_id,
                    content=translated_text,
                )
                count += 1
            except TelegramForbiddenError:
                pass
            except Exception as ex:
                print(f'Admin sending exception happend  {ex}')
            await asyncio.sleep(0.2)  # Жду 0.2 секунды
        await cb.message.answer(f'Mailing done\n\nTotal messages sent : {count}')
        await dialog_manager.done()


admin_dialog = Dialog(
    Window(
        Const('Возможные дейсвтия'),
        Button(Const('Сколько'),
               id='wieviele',
               on_click=wie_viel_schon_gestarted,
               ),

        Next(
            text=Const('Отправить сообщение юзерам'),
            id='send_msg'),
        Button(
            text=Const('Загрузить файл БД юзеров'),
            id='zagruz_db',
            on_click=downloads_users_db,
        ),

        Start(
            text=Const('Установить Баннер'),
            id='ustanovit_banner',
        state=BANNER.banner_first
        ),

        state=ADMIN.first
    ),

    Window(  # Принимает текст сообщения и записывает его в словарь data
        Const(text='введите текст сообщения'),
        Cancel(
            text=Const('◀️'),
            id='admin_out_1',
        ),
        MessageInput(
            func=accepet_admin_message,
            content_types=ContentType.TEXT,
        ),
        state=ADMIN.accept_msg
    ),
    Window(  # Отправляет сообщение юзерам
        Const('Отправить сообщуху'),
        Row(Cancel(
            text=Const('◀️'),
            id='admin_out_2',
        ),
            Button(
                text=Const('Начать рассылку'),
                id='send_msg_fin',
                on_click=sending_msg)),
        state=ADMIN.admin_send_msg)
)



async def banner_top(callback: CallbackQuery, widget: Button, dialog_manager: DialogManager, *args, **kwargs):
    dialog_manager.dialog_data["position"] = "top"
    await dialog_manager.next()
async def banner_bottom(callback: CallbackQuery, widget: Button, dialog_manager: DialogManager, *args, **kwargs):
    dialog_manager.dialog_data["position"] = "bottom"
    await dialog_manager.next()
async def accept_banner_photo(message: Message, widget: MessageInput, dialog_manager: DialogManager, *args, **kwargs):
    photo = message.photo[-1]
    file = await message.bot.get_file(photo.file_id)
    filename = f"banner_{message.from_user.id}_{photo.file_id}.jpg"
    folder = "uploads/banners"
    os.makedirs(folder, exist_ok=True)

    file_path = f"{folder}/{filename}"

    await message.bot.download_file(file.file_path,destination=file_path)

    photo_url = f"/uploads/banners/{filename}"

    dialog_manager.dialog_data["image_url"] = photo_url

    await dialog_manager.next()

async def accept_banner_link(message: Message, widget: MessageInput, dialog_manager: DialogManager, *args, **kwargs,):
    link = message.text.strip()
    if not link.startswith(("http://", "https://")):
        await message.answer(
            "❌ Bitte senden Sie eine gültige URL."
        )
        return
    dialog_manager.dialog_data["target_url"] = link
    await dialog_manager.next()


async def save_banner(
    callback: CallbackQuery,
    widget: Button,
    dialog_manager: DialogManager,
    *args,
    **kwargs,
):
    position = dialog_manager.dialog_data["position"]
    image_url = dialog_manager.dialog_data["image_url"]
    target_url = dialog_manager.dialog_data["target_url"]

    async with session_marker() as session:

        # Деактивируем старый баннер этой позиции
        result = await session.execute(
            select(Banner)
            .where(
                Banner.position == position,
                Banner.active == True,
            )
        )

        old_banners = result.scalars().all()

        for old_banner in old_banners:
            old_banner.active = False

        # Создаём новый
        banner = Banner(
            position=position,
            image_url=image_url,
            target_url=target_url,
            active=True,
        )

        session.add(banner)

        await session.commit()

    await callback.message.answer(
        "✅ Banner erfolgreich installiert."
    )

    await dialog_manager.done()



async def delete_banner_top(
    cb: CallbackQuery,
    widget: Button,
    dialog_manager: DialogManager,
    *args,
    **kwargs,
):
    deleted = await deactivate_banner("top")

    if deleted:
        await cb.message.answer("Oberer Banner wurde entfernt.")
    else:
        await cb.message.answer("Kein aktiver oberer Banner vorhanden.")

    await dialog_manager.switch_to(BANNER.banner_first)

async def delete_banner_bottom(
    cb: CallbackQuery,
    widget: Button,
    dialog_manager: DialogManager,
    *args,
    **kwargs,
):
    deleted = await deactivate_banner("bottom")

    if deleted:
        await cb.message.answer("Unterer Banner wurde entfernt.")
    else:
        await cb.message.answer("Kein aktiver unterer Banner vorhanden.")

    await dialog_manager.switch_to(BANNER.banner_first)

async def wrong_banner_message(
    message: Message,
    widget: MessageInput,
    dialog_manager: DialogManager,
    *args,
    **kwargs,
):
    await message.answer(
        "❌ Bitte senden Sie ein Bild."
    )


banner_dialog = Dialog(

    # =========================
    # 1. Выбор позиции
    # =========================

    Window(
        Const('Управление баннерами'),

        Row(
            Button(
                Const('📤 Верхний'),
                id='banner_top',
                on_click=banner_top,
            ),
            Button(
                Const('📤 Нижний'),
                id='banner_bottom',
                on_click=banner_bottom,
            ),
        ),

        Row(
            Button(
                Const('🗑 Удалить верхний'),
                id='delete_banner_top',
                on_click=delete_banner_top,
            ),
            Button(
                Const('🗑 Удалить нижний'),
                id='delete_banner_bottom',
                on_click=delete_banner_bottom,
            ),
        ),

        Cancel(Const('◀️'), id='banner_cancel'),
        state=BANNER.banner_first,
    ),

    # =========================
    # 2. Получаем фотографию
    # =========================

    Window(
        Const('Отправьте фотографию баннера'),

        MessageInput(
            func=accept_banner_photo,
            content_types=ContentType.PHOTO,
        ),

        MessageInput(
            func=wrong_banner_message,
            content_types=ContentType.ANY,
        ),

        Cancel(
            Const('◀️'),
            id='banner_cancel_2',
        ),

        state=BANNER.banner_photo,
    ),

    # =========================
    # 3. Получаем ссылку
    # =========================

    Window(
        Const('Теперь отправьте ссылку, куда должен вести баннер.'),

        MessageInput(
            func=accept_banner_link,
            content_types=ContentType.TEXT,
        ),

        Cancel(
            Const('◀️'),
            id='banner_cancel_3',
        ),

        state=BANNER.banner_link,
    ),

    # =========================
    # 4. Подтверждение
    # =========================

    Window(
        Const('Баннер готов к публикации.'),

        Row(
            Button(
                Const('✅ Установить'),
                id='banner_save',
                on_click=save_banner,
            ),

            Cancel(
                Const('❌ Отмена'),
                id='banner_cancel_4',
            ),
        ),

        state=BANNER.banner_confirm,
    ),
)
