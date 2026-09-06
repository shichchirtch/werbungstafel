from aiogram.types import BotCommand

from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton


async def set_main_menu(bot):
    main_menu_commands = [
        BotCommand(command='/start',
                   description='start window'),

        BotCommand(command='/help',
                   description='about bot'),

        BotCommand(command='/login',
                   description='login through Smartphone'),

    ]

    await bot.set_my_commands(main_menu_commands)


help_keyboard = InlineKeyboardMarkup(
    inline_keyboard=[
        [
            InlineKeyboardButton(
                text="🎥 Video",
                callback_data="help_video"
            )
        ]
    ]
)