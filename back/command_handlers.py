from aiogram import Router, F

from filters import KODE_FILTER
from filters import IS_ADMIN
from aiogram.types import Message, InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.filters import CommandStart, Command, CommandObject, StateFilter
from aiogram.fsm.context import FSMContext
from bot_instance import FSM_ST
from aiogram_dialog import  DialogManager, StartMode
import os
from lexicon import *
from user_repo import *
from static_functions import load_user_avatar

ch_router = Router()


@ch_router.message(CommandStart(deep_link=True))
async def command_start_process(message: Message, command: CommandObject):
    os.makedirs("uploads/avatar", exist_ok=True)
    user_id = message.from_user.id
    first_name = message.from_user.first_name
    user_lan = message.from_user.language_code
    user_name = message.from_user.username
    token = command.args
    print(first_name, user_id,'\n\ntoken = ', token)

    await create_user_if_not_exists(
        tg_id=user_id,
        first_name=first_name,
        lan=user_lan,
        username=user_name,
    )


    await load_user_avatar(message)


    login_button = InlineKeyboardButton(
        text="🔑 Login",
        callback_data=f"login:{token}"
    )

    start_keyboard = InlineKeyboardMarkup(
        inline_keyboard=[[login_button]])

    await message.answer(text=f'👋\n\n<b>Hello, {message.from_user.first_name}!</b>\n'
                              'Das ist WerbungsTafel, um zu login kliclen Sie bitte auf den Taste',
                         reply_markup=start_keyboard)


@ch_router.message(CommandStart(), F.text == "/start")
async def start_common(message: Message):
    await load_user_avatar(message)
    await message.answer(
        "👋 Willkommen bei WerbungsTafel!\n\n"
        "Um sich auf der Website\n\n<a>https://werbungstafel.org/</a> \n\n anzumelden, "
        "klicken Sie dort auf "
        "\"Mit Telegram anmelden\"."
    )


@ch_router.message(Command('login'))
async def command_login(message: Message, state: FSMContext):
    print("ENTER /LOGIN")
    await load_user_avatar(message)
    await state.set_state(FSM_ST.accept_login)
    await message.answer('Отправьте мне код с экрана')


@ch_router.message(StateFilter(FSM_ST.accept_login), KODE_FILTER())
async def accept_login(message: Message, state: FSMContext):
    print("ACCEPT LOGIN")
    print("TEXT =", message.text)



    user_id = int(message.from_user.id)
    token = message.text
    us_lan = message.from_user.language_code

    await create_user_if_not_exists(
        tg_id=message.from_user.id,
        first_name=message.from_user.first_name,
        username=message.from_user.username,
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
        "✅ Авторизация прошла успешно.\n"
        "Можете вернуться в браузер."
    )



# @ch_router.message(Command('help'))
# async def command_help(message: Message, dialog_manager: DialogManager):
#     user = await get_user(message.from_user.id)
#     lan =user['lan']
#     await message.answer(text=help_msg[lan])
#     await dialog_manager.reset_stack()
#     await dialog_manager.start(state=ROOT_WIND.do_nothing)
#
# @ch_router.message(Command('basic_menu'))
# async def basic_menu_start(message: Message, dialog_manager: DialogManager):
#     await message.answer('basic menu')
#     await dialog_manager.reset_stack()
#     await dialog_manager.start(state=ROOT_WIND.do_nothing)
#
# @ch_router.message(Command('admin'), IS_ADMIN())
# async def admin_enter(message: Message, dialog_manager: DialogManager):
#     await dialog_manager.start(state=ADMIN.first)
#
#
# @ch_router.message(Command('about_project'))
# async def aboutProject(message: Message, dialog_manager: DialogManager):
#     await dialog_manager.start(state=ABOUT.one, mode=StartMode.NORMAL)

