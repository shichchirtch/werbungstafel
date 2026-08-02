# import apscheduler.schedulers.asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from static_functions import (get_users_for_daily_report,
                              get_new_ads_global, get_new_ads_in_radius,
                              build_daily_report_text
                              )
from bot_instance import bot
from datetime import datetime
import asyncio

scheduler = AsyncIOScheduler(timezone="Europe/Berlin")

message_queue = asyncio.Queue()



# print("Jobs after create:", scheduler.get_jobs())
#
# async def test_job():
#     print(datetime.now(), "Scheduler works!")
#
#
#
#
# print("Jobs after add:", scheduler.get_jobs())

async def queue_sender_message(
    chat_id: int,
    text: str,
):
    await message_queue.put({
        "chat_id": chat_id,
        "type": "text",
        "text": text,
    })


async def background_worker():

    while True:

        task = await message_queue.get()

        try:

            if task["type"] == "text":

                await bot.send_message(
                    chat_id=task["chat_id"],
                    text=task["text"],
                )

        except Exception as e:

            print(f"Ошибка отправки сообщения: {e}")

        finally:

            await asyncio.sleep(0.08)   # ≈ 12.5 сообщений/сек
            message_queue.task_done()

async def send_daily_report():
    users = await get_users_for_daily_report()

    for user in users:

        if user["latitude"] is None:

            ads = await get_new_ads_global()

        else:

            ads = await get_new_ads_in_radius(
                center_lat=user["latitude"],
                center_lon=user["longitude"],
                radius=30
            )

        text = build_daily_report_text(
            ads=ads,
            lan=user["lan"],
        )

        await queue_sender_message(
            chat_id=user["telegram_id"],
            text=text,
        )

# scheduler.add_job(
#     send_daily_report,
#     trigger="interval",
#     seconds=30,
# )

scheduler.add_job(
    send_daily_report,
    trigger="cron",
    hour=18,
    minute=18,
)
