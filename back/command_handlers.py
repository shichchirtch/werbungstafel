from aiogram import Router, F
from filters import KODE_FILTER, IS_ADMIN
from aiogram.types import Message, InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.filters import CommandStart, Command, CommandObject, StateFilter
from aiogram.fsm.context import FSMContext
from bot_instance import FSM_ST, ADMIN, ROOT_WIND, SEND
from aiogram_dialog import  DialogManager, StartMode
import asyncio
from lexicon import *
from user_repo import *
from static_functions import load_user_avatar


ch_router = Router()


@ch_router.message(CommandStart(deep_link=True))
async def command_start_process(message: Message, command: CommandObject,
                                dialog_manager: DialogManager, state: FSMContext
):
    os.makedirs("uploads/avatar", exist_ok=True)
    user_id = message.from_user.id
    first_name = message.from_user.first_name
    user_lan = message.from_user.language_code
    user_name = message.from_user.username
    token = command.args
    print(first_name, user_id,'\n\ntoken = ', token, 'LAN = ', user_lan)

    await create_user_if_not_exists(
        tg_id=user_id,
        first_name=first_name,
        lan=user_lan,
        username=user_name,
    )
    await dialog_manager.start(
        state=ROOT_WIND.lan_select,
        mode=StartMode.RESET_STACK
    )

    await load_user_avatar(message)

    login_button = InlineKeyboardButton(
        text="🔑 Login",
        callback_data=f"login:{token}"
    )

    start_keyboard = InlineKeyboardMarkup(
        inline_keyboard=[[login_button]])

    await message.answer(text=f'👋\n\n<b>{start_dict[user_lan]}, {message.from_user.first_name}!</b>\n'
                              f'{start_zwei[user_lan]}',
                         reply_markup=start_keyboard)


@ch_router.message(CommandStart(), F.text == "/start")
async def start_common(message: Message, dialog_manager: DialogManager, state: FSMContext):
    await load_user_avatar(message)
    lan = message.from_user.language_code
    await message.answer(start_drei[lan])
    await dialog_manager.start(
        state=ROOT_WIND.lan_select,
        mode=StartMode.RESET_STACK
    )


@ch_router.message(Command('login'))
async def command_login(message: Message, state: FSMContext):
    print("ENTER /LOGIN")
    await load_user_avatar(message)
    lan = message.from_user.language_code
    await state.set_state(FSM_ST.accept_login)
    await message.answer(captura_code[lan])


@ch_router.message(StateFilter(FSM_ST.accept_login), KODE_FILTER())
async def accept_login(message: Message, state: FSMContext):
    print("ACCEPT LOGIN")
    print("TEXT =", message.text)
    user_id = int(message.from_user.id)
    us_lan = message.from_user.language_code

    token = message.text.strip().upper()

    if len(token) != 6 or not token.isalnum():
        await message.answer(wrong_code[us_lan])
        await state.clear()
        return

    await create_user_if_not_exists(
        tg_id=message.from_user.id,
        first_name=message.from_user.first_name,
        username=message.from_user.username,
        lan=us_lan
    )

    success = await confirm_login(
        token=token.upper(),
        telegram_id=user_id
    )

    if not success:
        await message.answer(
            code_dict[us_lan]
        )
        await state.clear()
        return
    print("CONFIRM LOGIN START")
    print("TOKEN =", token)

    await state.clear()

    await message.answer(
        autorization_erfolg[us_lan]
    )



@ch_router.message(Command('help'))
async def command_help(message: Message, dialog_manager: DialogManager):
    lan =message.from_user.language_code
    await message.answer(text=help_msg[lan])


@ch_router.message(Command('send_message'))
async def swyz_with_dev(message: Message, dialog_manager: DialogManager):
    lan = message.from_user.language_code
    await message.answer(senden[lan])
    await dialog_manager.reset_stack()
    await dialog_manager.start(state=SEND.send_first)


@ch_router.message(Command('admin'), IS_ADMIN())
async def admin_enter(message: Message, dialog_manager: DialogManager):
    await dialog_manager.start(state=ADMIN.first)

trash_router = Router()
@trash_router.message()
async def message_trasher(message: Message, dialog_manager: DialogManager):
    lan = message.from_user.language_code
    otwet = await message.answer(trasher[lan])
    await asyncio.sleep(2)
    await message.delete()
    await otwet.delete()
