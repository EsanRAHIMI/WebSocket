# React + Vite

npm create vite@latest frontend -- --template react

Node رو آپدیت کن، بعد سرور dev رو بالا بیار:
# اگه nvm داری
nvm install 22.12.0
nvm use 22.12.0
node -v   # باید 22.12.0 یا بالاتر باشه

cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
