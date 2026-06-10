from aiogram_dialog import Dialog, Window, ShowMode
from bot_instance import ROOT_WIND
from aiogram.types import User, ContentType, Message, CallbackQuery
from aiogram_dialog.widgets.kbd import Button, Row, Cancel, Radio, Next, Start
from aiogram_dialog.widgets.input import MessageInput
from aiogram_dialog.widgets.text import Const, Format
from aiogram_dialog import DialogManager
from static_functions import ( ru_stellen, de_stellen, tr_stellen, form_capture, form_key_note,
                              uk_stellen, do_nothing, check_len_note)
from user_repo import *

from lexicon import *
import datetime
import asyncio

async def do_nothing_getter(dialog_manager: DialogManager, event_from_user: User, **kwargs):
    user_id = event_from_user.id
    user = await get_user( user_id)
    lan = user['lan']
    notiz = second_window_text[lan]
    return { 'notiz':notiz , 'Neue_Notiz_erstellen':Neue_Notiz_erstellen[lan],
             'Kuck_meine_Notizen':Kuck_meine_Notizen[lan]}

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
    ),

    Window(Format('{notiz}'),
        Button(Const('◀️'),
        id='second_window_root_dialog',
        on_click=do_nothing),
            # Start(
            #     text=Format('{Neue_Notiz_erstellen}'),
            #     id='kuck_start',
            #     state=CREATE.einstellen),
            # Start(
            #     text=Format('{Kuck_meine_Notizen}'),
            #     id='save_bd',
            #     state=ZEIGEN.clava),
        state=ROOT_WIND.do_nothing,
        getter=do_nothing_getter
    )
)
#
#
# async def message_text_handler(message: Message, widget: MessageInput, dialog_manager: DialogManager) -> None:
#     print('we into message_text_handler')
#     user_id = str(message.from_user.id)
#     note = check_len_note(message.text)
#     heute = datetime.datetime.now().strftime('%d.%m.%Y')
#     note = f'{note}\n\n {heute}'
#     lan = dialog_manager.dialog_data['lan']
#     dialog_manager.dialog_data['note'] = note
#     dialog_manager.dialog_data['foto_id'] = ''
#
#     notiz_key = form_key_note(note)
#
#     await redis_db.hset(
#         f"user:{user_id}:notes",
#         notiz_key,
#         json.dumps({
#             "text": note,
#             "foto_id": ''
#         })
#     )
#
#     await asyncio.sleep(1)
#
#     await message.answer(text=notiz_wurde_beifugen[lan])
#     await asyncio.sleep(1)
#     dialog_manager.show_mode = ShowMode.DELETE_AND_SEND
#     await message.delete()
#     await dialog_manager.switch_to(CREATE.finish)
#
#
# async def accepting_foto(message: Message, widget: MessageInput, dialog_manager: DialogManager):
#     foto_id = message.photo[-1].file_id
#     dialog_manager.dialog_data['foto_id'] = foto_id
#     heute = datetime.datetime.now().strftime('%d.%m.%Y %H:%M')
#     capture = f'Foto {heute}'
#     dialog_manager.dialog_data['capture'] = capture
#
#     await redis_db.hset(
#         f"user:{message.from_user.id}:notes",
#         capture,
#         json.dumps({
#             "text": capture,
#             "foto_id": foto_id
#         })
#     )
#     dialog_manager.show_mode = ShowMode.SEND
#     await dialog_manager.next()


async def message_not_foto_handler(message: Message, widget: MessageInput,
                                   dialog_manager: DialogManager) -> None:
    lan = dialog_manager.dialog_data['lan']
    dialog_manager.show_mode = ShowMode.NO_UPDATE
    await message.answer(error_enter_type[lan])

async def second_window_create_dialog_getter(dialog_manager: DialogManager, event_from_user: User, **kwargs):
    lan = dialog_manager.dialog_data['lan']
    return {'EingebenCaptura':EingebenCaptura[lan]}

async def third_window_create_dialog_getter(dialog_manager: DialogManager, event_from_user: User, **kwargs):
    lan = dialog_manager.dialog_data['lan']
    return {'Schiken_mir_Capture':Schiken_mir_Capture[lan]}


# async def peredumal_func(callback: CallbackQuery, widget: Button,
#                             dialog_manager: DialogManager, *args, **kwargs):
#     print('peredumal_funk works')
#     user_id = str(callback.from_user.id)
#     capture = dialog_manager.dialog_data['capture']
#     redis_key = f"user:{user_id}:notes"
#     await redis_db.hdel(redis_key, capture)
#     dialog_manager.show_mode = ShowMode.DELETE_AND_SEND
#     dialog_manager.dialog_data.clear()
#     await dialog_manager.done()
#
# async def set_foto_notiz_ohne_capture(cb: CallbackQuery, widget: Button, dialog_manager: DialogManager) -> None:
#     """Хэндлер формирует словарь с фото без подписи"""
#     lan = dialog_manager.dialog_data['lan']
#     await cb.message.answer(text=eingegeben[lan])
#     dialog_manager.show_mode = ShowMode.SEND
#     await dialog_manager.done()
#
# async def message_capture_handler(message: Message, widget: MessageInput, dialog_manager: DialogManager) -> None:
#     """Хэндлер устанавливает capture"""
#     user_id = str(message.from_user.id)
#     lan = dialog_manager.dialog_data['lan']
#     capture = form_capture(message.text)
#     foto_id = dialog_manager.dialog_data['foto_id']
#     old_capture = dialog_manager.dialog_data['capture']
#     redis_key = f"user:{user_id}:notes"
#     await redis_db.hdel(redis_key, old_capture)
#
#     heute = datetime.datetime.now().strftime('%d.%m.%Y')
#     capture = f'{capture}\n\n {heute}'
#     notiz_key = form_capture(capture)
#     print('nitiz_key =', notiz_key)
#     await redis_db.hset(
#         f"user:{user_id}:notes",
#         notiz_key,
#         json.dumps({
#             "text": notiz_key,
#             "foto_id": foto_id
#         })
#     )
#     notes_keys = await redis_db.hkeys(f"user:{user_id}:notes")
#     print("2 notes_keys =", notes_keys)
#
#     await message.answer(text=capture_wurde_instlliert[lan])
#     dialog_manager.show_mode = ShowMode.SEND
#     await message.delete()
#     await dialog_manager.next()
#
# async def message_not_text_handler_in_capture(message: Message, widget: MessageInput,
#                                               dialog_manager: DialogManager) -> None:
#     lan = dialog_manager.dialog_data['lan']
#     dialog_manager.show_mode = ShowMode.NO_UPDATE
#     await message.answer(captura_type_error[lan])
#
# async def last_wind_create_dialog_getter(dialog_manager: DialogManager, event_from_user: User, **kwargs):
#     lan = dialog_manager.dialog_data['lan']
#     return {'NotizAczeptiert': NotizAczeptiert[lan]}
#
#
# async def reset_funk(callback: CallbackQuery, widget: Button,
#                      dialog_manager: DialogManager, *args, **kwargs):
#     print('reset funk works')
#     dialog_manager.show_mode = ShowMode.DELETE_AND_SEND
#     dialog_manager.dialog_data.clear()
#
#
async def crate_dialog_first_window_getter(dialog_manager: DialogManager, event_from_user: User, **kwargs):
    user_id = event_from_user.id
    user = await get_user(user_id)
    lan = user['lan']
    dialog_manager.dialog_data['lan'] = lan
    text_foto_dict  = {
        'ru':'Отправьте мне текст или фотографию',
        'uk':'Надішліть мені текст або фотографію',
        'de':'Typen hier oder schick mir eine Foto',
        'tr':'Bana mesaj veya fotoğraf gönder.'
    }
    return { 'TextFoto': text_foto_dict[lan] }


# create_dialog = Dialog(
#     Window(
#         Format('{TextFoto}'),
#         MessageInput(
#             func=message_text_handler,
#             content_types=ContentType.TEXT,
#         ),
#         MessageInput(
#             func=accepting_foto,
#             content_types=ContentType.PHOTO,
#         ),
#         MessageInput(
#             func=message_not_foto_handler,
#             content_types=ContentType.ANY,
#         ),
#         Cancel(Const('◀️'),
#                id='Cancel_for_uniq_day'),
#         state=CREATE.einstellen,
#         getter=crate_dialog_first_window_getter
#     ),
#     Window(  # Окно предлагающее ввести capture
#         Format('{EingebenCaptura}'),  # Хотите сделать подпись по фотографией ?
#         Button(Const('◀️'),
#                id='return_to_basic',
#                on_click=peredumal_func),
#         Row(Next(Const('😃'),
#                  id='yes_capture'),
#             Button(Const('❌'),
#                    id='no_capture',
#                    on_click=set_foto_notiz_ohne_capture)),
#
#         state=CREATE.ask_capture,
#         getter=second_window_create_dialog_getter
#     ),
#
#     Window(  # Окно принимающее capture
#         Format('{Schiken_mir_Capture}'),  # Отправьте capture
#         MessageInput(
#             func=message_capture_handler,
#             content_types=ContentType.TEXT,
#         ),
#         MessageInput(
#             func=message_not_text_handler_in_capture,
#             content_types=ContentType.ANY,
#         ),
#         Cancel(Const('◀️'),
#                id='Cancel_for_accepting_capture'),
#         state=CREATE.enter_capture,
#         getter=third_window_create_dialog_getter
#     ),
#     Window(  # окно возвращаюшее в предыдущий диалог
#         Format(text='{NotizAczeptiert}'),  # Напоминание принято
#         Cancel(text=Format(text='▶️'),  #
#                id='see_stelle_button',
#                on_click=reset_funk),
#         state=CREATE.finish,
#         getter=last_wind_create_dialog_getter
#     ))
