from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware import Middleware
import os
from bot_instance import bot
import logging
import redis.asyncio as aioredis
import json
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from user_repo import create_user_if_not_exists
from lexicon import *
from collections import defaultdict


ADMIN_ID = 6685637602

class ExpenseIn(BaseModel):
    user_id: int
    category: str
    title: Optional[str] = None
    price: float

class IncomeIn(BaseModel):
    user_id: int
    title: Optional[str] = None
    amount: float



f_api = FastAPI(
    middleware=[
        Middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    ]
)

logger = logging.getLogger("fastapi")


@f_api.post("/api/auth/telegram")
async def auth_telegram(data: dict):
    print('DATA = ', data)
    tg_id = data["id"]
    first_name = data["first_name"]
    username = data.get("username")

    user = await create_user_if_not_exists(
        tg_id=tg_id,
        first_name=first_name,
        username=username,
    )

    return {
        "user_id": user.id,
        "telegram_id": user.telegram_id,
        "first_name": user.first_name,
    }



# @f_api.post("/api/receive_telegram_data")
# async def receive_telegram_data(data: dict):
#     user_id = data["user_id"]
#     logger.warning(f"📦 Telegram data: {data}")
#     await bot.send_message(chat_id= ADMIN_ID,
#                            text = f"user_id from webapp: {user_id}")
#     return {"ok": True}

#
# @f_api.post("/api/expenses/add")
# async def add_expense(expense: ExpenseIn):
#     user_id = expense.user_id
#
#     now = datetime.now(timezone.utc)
#
#     month = now.strftime("%Y-%m")
#
#     # 2️⃣ ключи
#     months_key = f"user:{user_id}:months"
#     expenses_key = f"user:{user_id}:expenses:{month}"
#
#     # 3️⃣ добавляем месяц в SET
#     await redis_db.sadd(months_key, month)
#
#     # 4️⃣ формируем объект расхода
#     expense_obj = {
#         "id": f"{int(datetime.now(timezone.utc).timestamp() * 1000)}",
#         "category": expense.category,
#         "title": expense.title,
#         "price": expense.price,
#         "createdAt": now.isoformat(),
#     }
#
#     # 5️⃣ кладём расход в LIST месяца
#     await redis_db.rpush(
#         expenses_key,
#         json.dumps(expense_obj, ensure_ascii=False)
#     )
#     logger.warning(f"💾 Expense saved: {expense_obj}")
#     return {
#         "status": "ok",
#         "month": month,
#         "expense": expense_obj,
#     }
#
#
# @f_api.get("/api/expenses/{user_id}/{month}")
# async def get_expenses(user_id: int, month: str):
#
#     key = f"user:{user_id}:expenses:{month}"
#
#     raw = await redis_db.lrange(key, 0, -1)
#
#     expenses = [json.loads(item) for item in raw]
#
#     total = sum(e["price"] for e in expenses)
#
#     return {
#         "status": "ok",
#         "expenses": expenses,
#         "total": f"{total:.2f}",
#     }
#
#
# @f_api.post("/api/expenses/delete")
# async def delete_expense(data: dict):
#     user_id = data["user_id"]
#     expense_id = data["expense_id"]
#     month = data["month"]
#
#     expenses_key = f"user:{user_id}:expenses:{month}"
#     months_key = f"user:{user_id}:months"
#
#     # 1️⃣ Получаем список расходов месяца
#     raw = await redis_db.lrange(expenses_key, 0, -1)
#
#     expenses = []
#     for item in raw:
#         try:
#             expenses.append(json.loads(item))
#         except Exception:
#             continue
#
#     # 2️⃣ Фильтруем по id
#     updated_expenses = [
#         expense for expense in expenses
#         if expense["id"] != expense_id
#     ]
#
#     # 3️⃣ Удаляем старый список
#     await redis_db.delete(expenses_key)
#
#     # 4️⃣ Если список не пуст — записываем обратно
#     if updated_expenses:
#         await redis_db.rpush(
#             expenses_key,
#             *[json.dumps(e, ensure_ascii=False) for e in updated_expenses]
#         )
#     else:
#         # если расходов не осталось — убираем месяц из SET
#         await redis_db.srem(months_key, month)
#
#     # 5️⃣ Пересчитываем total расходов
#     total = sum(e["price"] for e in updated_expenses)
#
#     return {
#         "ok": True,
#         "total": total
#     }
#
#
# ################################INCOMES########################
#
# @f_api.post("/api/incomes/add")
# async def add_income(income: IncomeIn):
#     logger.warning(f' income = {income}')
#     user_id = income.user_id
#
#     now = datetime.now(timezone.utc)
#
#     month = now.strftime("%Y-%m")
#
#     # 2️⃣ ключи
#     months_key = f"user:{user_id}:months_inc"
#     incomes_key = f"user:{user_id}:incomes_inc:{month}"
#
#     # 3️⃣ добавляем месяц в SET
#     await redis_db.sadd(months_key, month)
#
#     # 4️⃣ формируем объект дохода
#     income_obj = {
#         "id": str(int(now.timestamp() * 1000)),
#         "title": income.title,
#         "amount": income.amount,
#         "createdAt": now.isoformat(),
#     }
#
#     # 5️⃣ кладём dohod в LIST месяца
#     await redis_db.rpush(
#         incomes_key,
#         json.dumps(income_obj, ensure_ascii=False)
#     )
#     logger.warning(f"💾 INCOME saved: {income_obj}")
#     return {
#         "status": "ok",
#         "month": month,
#         "income": income_obj,
#     }
#
#
#
# @f_api.get("/api/incomes/{user_id}/{month}")
# async def get_incomes(user_id: int, month: str):
#
#     key = f"user:{user_id}:incomes_inc:{month}"
#
#     raw = await redis_db.lrange(key, 0, -1)
#
#     user_incomes = [json.loads(item) for item in raw]
#
#     total = sum(i["amount"] for i in user_incomes)
#
#     return {
#         "incomes": user_incomes,
#         "total": total
#     }
#
# @f_api.post("/api/incomes/delete")
# async def delete_income(data: dict):
#     user_id = data["user_id"]
#     income_id = data["income_id"]
#     month = data["month"]  # важно! нужен месяц для ключа
#
#     key = f"user:{user_id}:incomes_inc:{month}"
#
#     # 1️⃣ получаем список
#     raw = await redis_db.lrange(key, 0, -1)
#     incomes = [json.loads(item) for item in raw]
#
#     # 2️⃣ фильтруем
#     updated_incomes = [
#         income for income in incomes
#         if income["id"] != income_id
#     ]
#
#     # 3️⃣ полностью очищаем список в Redis
#     await redis_db.delete(key)
#
#     # 4️⃣ записываем обратно
#     if updated_incomes:
#         await redis_db.rpush(
#             key,
#             *[json.dumps(i) for i in updated_incomes]
#         )
#
#     total = sum(i["amount"] for i in updated_incomes)
#
#     return {"ok": True,
#             "total": total}
#
# ## ## ## ## ## ## ## ############ Bot Report ###################################
# bez_nazwanija = {
#     'ru':'Без названия',
#     'uk':'Без назви',
#     'de':'Ohne Titel',
#     'tr':'Başlıksız'
# }
#
# monthDict= {
#     '2026-01': 'January 2026',
#     '2026-02': 'February 2026',
#     '2026-03': 'March 2026',
#     '2026-04': 'April 2026',
#     '2026-05': 'Mai 2026',
#     '2026-06': 'June 2026',
#     '2026-07': 'July 2026',
#     '2026-08': 'August 2026',
#     '2026-09': 'September 2026',
#     '2026-10': 'October 2026',
#     '2026-11': 'November 2026',
#     '2026-12': 'December 2026'}
#
# async def build_expense_report(redis_db, user_id: int, month: str, lan: str, total:float)->dict:
#
#     key = f"user:{user_id}:expenses:{month}"
#     raw = await redis_db.lrange(key, 0, -1)
#
#     expenses = [json.loads(item) for item in raw]
#
#     if not expenses:
#         return no_expenses[lan]
#
#     # группировка
#     grouped = defaultdict(list)
#
#     for e in expenses:
#         grouped[e["category"]].append(e)
#
#     # заголовок
#     message = f"<b>📊 {report_for[lan]} {monthDict[month]}</b>\n\n"
#
#
#     for category, items in grouped.items():
#
#         # сортировка по дате
#         items.sort(key=lambda x: x["createdAt"])
#
#         emoji = CATEGORY_EMOJI[lan].get(category, "📌")
#
#         category_total = 0
#
#         message += f"<b>{emoji} {category}</b>\n"
#
#         for item in items:
#             dt = datetime.fromisoformat(item["createdAt"])
#             date_str = dt.strftime("%d.%m")
#
#             title = item["title"] or bez_nazwanija[lan]
#             price = item["price"]
#
#             category_total += price
#
#             message += f"{date_str} — {title} — {price} €\n"
#
#             # 👇 Показываем "Итого" только если больше одной записи
#         if len(items) > 1:
#             message += f"Итого: <b>{round(category_total, 2)} €</b>\n"
#
#         message += "\n"
#
#     message += f"<b>💰 Общий итог: {round(total, 2)} €</b>"
#
#     return message
#
#
#
#
#
# @f_api.post("/api/report")
# async def receive_telegram_data(data: dict):
#
#     user_id = data["user_id"]
#     month = data["month"]
#     lan = data.get("lan", "ru")
#     total = data.get("total", 'no_data')
#
#     report_text = await build_expense_report(
#         redis_db,
#         user_id,
#         month,
#         lan,
#         total
#     )
#
#     await bot.send_message(
#         chat_id=int(user_id),
#         text=report_text,
#         parse_mode="HTML"
#     )
#
#     return {"ok": True}




