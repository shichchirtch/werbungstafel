from aiogram_dialog import Dialog, Window, ShowMode
from aiogram_dialog.widgets.text import Const, Format
from aiogram_dialog.widgets.kbd import Button, Row, Next, Cancel
from aiogram_dialog.widgets.input import MessageInput
from aiogram.types import CallbackQuery, Message, User
from aiogram_dialog import DialogManager
from bot_instance import ADMIN, bot, ABOUT
from aiogram.types import ContentType
from aiogram.exceptions import TelegramForbiddenError
from static_functions import check_len_note, get_translate
from pathlib import Path
from aiogram.types import FSInputFile
import os
from static_functions import get_users_count, get_ads_today_count, get_all_users

import asyncio

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
            lan = user['lan']
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

