# 果菜市場 API 服務

這是一個提供果菜市場資料的 API 服務，主要從 notify.json 檔案中讀取資料。

## 安裝

```bash
npm install
```

## 執行

開發模式：
```bash
npm run dev
```

生產模式：
```bash
npm start
```

## API 端點

- GET `/api/notify` - 獲取所有通知資料

## 環境變數

- `PORT` - 伺服器端口（預設：3000） 