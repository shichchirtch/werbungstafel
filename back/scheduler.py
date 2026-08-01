import apscheduler.schedulers.asyncio
from static_functions import (get_users_for_daily_report,
                              get_new_ads_global, get_new_ads_in_radius,
                              build_daily_report_text
                              )
from bot_instance import bot
from datetime import datetime
print("scheduler.py imported")

scheduler = apscheduler.schedulers.asyncio.AsyncIOScheduler()




print("Jobs after create:", scheduler.get_jobs())

async def test_job():
    print(datetime.now(), "Scheduler works!")


scheduler.add_job(
    test_job,
    trigger="interval",
    seconds=30,
)

print("Jobs after add:", scheduler.get_jobs())

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

        await bot.send_message(
            chat_id=user["telegram_id"],
            text=text,
        )

scheduler.add_job(
    send_daily_report,
    trigger="cron",
    hour=1,
    minute=40,
)
