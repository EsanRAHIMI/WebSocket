# fastapi uvicorn

## E

مراحل اجرای بک‌اند
cd /Users/ehsanrahimi/Works/WebSocket/backend

python3 -m venv venv
source venv/bin/activate

پکیج‌های لازم رو نصب کن:
pip install fastapi uvicorn
pip install "uvicorn[standard]" websockets

 سرور رو اجرا کن:
uvicorn main:app --reload
اگر فایل اصلی‌ت اسمش چیز دیگه‌ایه (مثلاً app.py 
uvicorn app.main:app --reload
تغییر پورت به ۸۰۰۱
uvicorn main:app --reload --port 8001
اگر می‌خوای به‌صورت پیش‌فرض همیشه روی پورت 8001 اجرا بشه،
در فایل main.py (یا هر فایلی که سرور رو اجرا می‌کنی) انتهای کد رو به این شکل تغییر بده:
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

ساخت و به‌روزرسانی خودکار requirements.txt 
ساخت یا آپدیت → pip freeze > requirements.txt
نصب ازش → pip install -r requirements.txt

لیست پکیج‌ها:
pip list

✅ حالا هر بار فقط بنویسی:
source venv/bin/activate
python main.py