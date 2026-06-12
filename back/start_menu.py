from aiogram.types import BotCommand


async def set_main_menu(bot):
    main_menu_commands = [
        BotCommand(command='/start',
                   description='start window'),

        BotCommand(command='/help',
                   description='about bot'),

        BotCommand(command='/login',
                   description='login through Smartfpne')

    ]
    await bot.set_my_commands(main_menu_commands)
