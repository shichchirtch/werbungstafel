from aiogram import Router
from filters import IS_ADMIN
from aiogram.types import Message, InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.filters import CommandStart, Command, CommandObject
from aiogram.fsm.context import FSMContext
from bot_instance import ROOT_WIND, ADMIN, ABOUT
from aiogram_dialog import  DialogManager, StartMode

from lexicon import *
from user_repo import *


ch_router = Router()


@ch_router.message(CommandStart(deep_link=True))
async def command_start_process(message: Message, command: CommandObject):
    user_id = message.from_user.id
    user_name = message.from_user.first_name
    user_lan = message.from_user.language_code

    token = command.args
    print(user_name, user_id,'\n\ntoken = ', token)
    await create_user_if_not_exists(
        tg_id=user_id,
        first_name=user_name
    )

    login_button = InlineKeyboardButton(
        text="🔑 Login",
        callback_data=f"login:{token}"
    )

    start_keyboard = InlineKeyboardMarkup(
        inline_keyboard=[[login_button]])

    await message.answer(text=f'👋\n\n<b>Hello, {message.from_user.first_name}!</b>\n'
                              'Das ist WerbungsTafel, um zu login kliclen Sie bitta auf den Taste',
                         reply_markup=start_keyboard)





@ch_router.message(Command('help'))
async def command_help(message: Message, dialog_manager: DialogManager):
    user = await get_user(message.from_user.id)
    lan =user['lan']
    await message.answer(text=help_msg[lan])
    await dialog_manager.reset_stack()
    await dialog_manager.start(state=ROOT_WIND.do_nothing)

@ch_router.message(Command('basic_menu'))
async def basic_menu_start(message: Message, dialog_manager: DialogManager):
    await message.answer('basic menu')
    await dialog_manager.reset_stack()
    await dialog_manager.start(state=ROOT_WIND.do_nothing)

@ch_router.message(Command('admin'), IS_ADMIN())
async def admin_enter(message: Message, dialog_manager: DialogManager):
    await dialog_manager.start(state=ADMIN.first)


@ch_router.message(Command('about_project'))
async def aboutProject(message: Message, dialog_manager: DialogManager):
    await dialog_manager.start(state=ABOUT.one, mode=StartMode.NORMAL)

