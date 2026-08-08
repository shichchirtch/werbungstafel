from aiogram_dialog import Dialog, Window, ShowMode
from bot_instance import ROOT_WIND, SEND, FSM_ST
from aiogram.types import User, ContentType, Message, CallbackQuery
from aiogram_dialog.widgets.kbd import Button, Row, Cancel, Radio, Next, Start
from aiogram_dialog.widgets.input import MessageInput
from aiogram_dialog.widgets.text import Const, Format
from aiogram_dialog import DialogManager
from static_functions import ( ru_stellen, de_stellen, tr_stellen,
                              uk_stellen,  check_len_note)
from user_repo import *

from lexicon import *


async def start_window_getter(dialog_manager: DialogManager, event_from_user: User, **kwargs):
    lan = event_from_user.language_code
    was_machen_dict  = {
        'ru':'Выберите язык Интерфейса',
        'uk':'Виберіть мову Інтерфейсу',
        'de':'Wählen Sie die Schnittstellensprache aus',
        'tr':'Arayüz dilini seçin'
    }
    return { 'begrusung': was_machen_dict[lan] }



root_dialog = Dialog(
    Window(
        Format("{begrusung}"),
        Row(
            Button(Const('Deutsch'),
                   id='de_lan',
                   on_click=de_stellen),
            Button(Const('Ukraine'),
                   id='ua_lan',
                   on_click=uk_stellen)),
        Row(
            Button(Const('Russish'),
                   id='ru_lan',
                   on_click=ru_stellen),
            Button(Const('Turkish'),
                   id='tr_lan',
                   on_click=tr_stellen),
        ),
        state=ROOT_WIND.lan_select,
        getter=start_window_getter,
    )

)


async def message_not_text_handler_login(message: Message, widget: MessageInput,
                                   dialog_manager: DialogManager) -> None:
    lan = message.from_user.language_code
    dialog_manager.show_mode = ShowMode.NO_UPDATE
    await message.answer("error")

async def message_text_handler_for_login_first(message: Message, widget: MessageInput,
                                        dialog_manager: DialogManager, *args, **kwargs) -> None:

    lan = message.from_user.language_code
    user_id = str(message.from_user.id)
    user_name = message.from_user.first_name
    await message.answer('ACCEPTED')
    await dialog_manager.done()

login_dialog = Dialog(
    Window(
        Const('Enter Login'),
        MessageInput(
            func=message_text_handler_for_login_first,
            content_types=ContentType.TEXT,
        ),
        MessageInput(
            func=message_not_text_handler_login,
            content_types=ContentType.ANY,
        ),
        Cancel(Const('◀️'),
               id='Cancel'),
        state=FSM_ST.accept_login,
    ))



async def message_text_handler_for_send_first(message: Message, widget: MessageInput,
                                        dialog_manager: DialogManager, *args, **kwargs) -> None:

    lan = message.from_user.language_code
    user_id = str(message.from_user.id)
    user_name = message.from_user.first_name
    join_text = f'User_id {user_id},\n\n user_name  {user_name} \n\nsend MESSAGE {message.text}'
    await message.bot.send_message(chat_id=-5568231732, text=join_text)
    await message.answer(danke[lan])
    await dialog_manager.done()



async def message_not_text_handler(message: Message, widget: MessageInput,
                                   dialog_manager: DialogManager) -> None:
    lan = dialog_manager.dialog_data['lan']
    dialog_manager.show_mode = ShowMode.NO_UPDATE
    await message.answer(error_enter_type[lan])

async def send_dialog_first_window_getter(dialog_manager: DialogManager, event_from_user: User, **kwargs):
    user_id = event_from_user.id
    user = await get_user(user_id)
    print('USER = ', user)
    lan = event_from_user.language_code
    dialog_manager.dialog_data['lan'] = lan
    text_foto_dict  = {
        'ru':'Отправьте мне текст сообщения',
        'uk':'Надішліть мені текст повідомлення',
        'de':'Schick mir eine Nachrichten',
        'tr':'Bana bir kısa mesaj gönder'
    }
    return { 'TextMessage': text_foto_dict[lan] }


send_dialog = Dialog(
    Window(
        Format('{TextMessage}'),
        MessageInput(
            func=message_text_handler_for_send_first,
            content_types=ContentType.TEXT,
        ),
        MessageInput(
            func=message_not_text_handler,
            content_types=ContentType.ANY,
        ),
        Cancel(Const('◀️'),
               id='Cancel_for_uniq_day'),
        state=SEND.send_first,
        getter=send_dialog_first_window_getter
    ))
