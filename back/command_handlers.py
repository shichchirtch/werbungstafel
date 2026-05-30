from aiogram import Router
from filters import IS_ADMIN
from aiogram.types import Message
from aiogram.filters import CommandStart, Command
from aiogram.fsm.context import FSMContext
from bot_instance import ROOT_WIND, ADMIN, ABOUT
from aiogram_dialog import  DialogManager, StartMode
from my_fast_api import redis_db
from lexicon import *
from user_repo import *


ch_router = Router()


@ch_router.message(CommandStart())
async def command_start_process(message: Message,dialog_manager: DialogManager, state: FSMContext
):
    user_id = message.from_user.id
    user_name = message.from_user.first_name
    user_lan = message.from_user.language_code
    print(user_name, user_id)
    user = await ensure_user(redis_db, user_id, user_name, user_lan)
    print('user = ', user)
    await message.answer(text=f"<b>{start_dict[user_lan]}, {user_name} !</b>")
    await dialog_manager.start(
        state=ROOT_WIND.lan_select,
        mode=StartMode.RESET_STACK
    )



@ch_router.message(Command('help'))
async def command_help(message: Message, dialog_manager: DialogManager):
    user = await get_user(redis_db, message.from_user.id)
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

