import asyncio
from bot_instance import bot, dp, bot_storage_key
from command_handlers import ch_router
from callback_handlers import cb_router
from start_menu import set_main_menu
from aiogram_dialog import setup_dialogs
from admin_dialog import admin_dialog , message_sender_worker
from dialogs import root_dialog, send_dialog, login_dialog
from postgres_table import init_models
from scheduler import scheduler, background_worker



async def main():
    # стартовые действия

    scheduler.start()

    print("SCHEDULER STARTED")

    await init_models()

    # инициализация FSM-хранилища
    await dp.storage.set_data(key=bot_storage_key, data={})

    # роутеры
    dp.include_router(ch_router)
    dp.include_router(cb_router)
    dp.include_router(root_dialog)
    dp.include_router(login_dialog)
    dp.include_router(send_dialog)
    dp.include_router(admin_dialog)
    # dialogs

    setup_dialogs(dp)

    dp.startup.register(set_main_menu)
    background_task = asyncio.create_task(background_worker())
    message_sender_task = asyncio.create_task(message_sender_worker())

    print("BACKGROUND SERVICES STARTED")
    # старт бота
    await bot.delete_webhook(drop_pending_updates=True)

    try:
        await dp.start_polling(bot)
    finally:

        background_task.cancel()
        message_sender_task.cancel()

        try:
            await background_task
        except asyncio.CancelledError:
            pass

        try:
            await message_sender_task
        except asyncio.CancelledError:
            pass

if __name__ == "__main__":
    asyncio.run(main())

