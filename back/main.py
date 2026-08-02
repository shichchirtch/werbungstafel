import asyncio
from bot_instance import bot, dp, bot_storage_key
from command_handlers import ch_router
from callback_handlers import cb_router
from start_menu import set_main_menu
from aiogram_dialog import setup_dialogs
from admin_dialog import admin_dialog # about_dialog
from dialogs import root_dialog  #, create_dialog
from postgres_table import init_models
from scheduler import scheduler



async def main():
    # стартовые действия

    print("START MAIN")

    scheduler.start()

    print("SCHEDULER STARTED")

    # await init_models()

    print("INIT DONE")
    # инициализация FSM-хранилища
    await dp.storage.set_data(key=bot_storage_key, data={})
    print("TEST LAST PRINT")
    # роутеры
    dp.include_router(ch_router)
    dp.include_router(cb_router)
    dp.include_router(root_dialog)
    dp.include_router(admin_dialog)

    # dialogs
    setup_dialogs(dp)

    dp.startup.register(set_main_menu)

    # старт бота
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot, skip_updates=True)


if __name__ == "__main__":
    asyncio.run(main())

