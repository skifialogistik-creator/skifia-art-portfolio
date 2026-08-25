# Миграция Skifia Art на Cloudflare Workers

## Что подготовлено

В папке `cloudflare/` находится изолированная Worker-реализация с D1 для заявок и контента, R2 для медиафайлов, API на tRPC и проверкой Cloudflare Access для административных операций. До подтверждённого production-развёртывания текущая Node/Express-версия и внешние данные не удаляются.

## Сохранение данных

Старые данные находятся вне Git-репозитория, поэтому сначала необходим экспорт в JSON. Файл должен быть сохранён как `cloudflare/backup/legacy-export.json` и иметь следующий формат:

```json
{
  "briefSubmissions": [],
  "siteInquiries": [],
  "siteContent": {},
  "mediaAssets": [],
  "telegramSettings": { "chatId": "" }
}
```

После проверки экспорта нужно выполнить:

```bash
node scripts/build-d1-import.mjs cloudflare/backup/legacy-export.json cloudflare/backup/d1-import.sql
pnpm exec wrangler d1 execute skifia-art-portfolio-data --remote --file=cloudflare/migrations/0001_initial.sql
pnpm exec wrangler d1 execute skifia-art-portfolio-data --remote --file=cloudflare/backup/d1-import.sql
```

Не запускайте импорт до сверки количества заявок, содержимого сайта и списка медиафайлов. Скрипт импорта перед записью очищает целевые D1-таблицы, поэтому это действие допускается только после подтверждённого резервного экспорта.

## Медиафайлы

Записи в `mediaAssets` содержат метаданные, но сами бинарные файлы необходимо отдельно выгрузить из прежнего хранилища. Их следует загрузить в R2 с сохранением ключей из поля `key`, а затем проверить ссылки `/media/<key>` на тестовом домене. Новые загрузки из админ-панели выполняются потоково в R2 через защищённый endpoint `/api/admin/media`; Base64 для больших видео больше не используется.

## Cloudflare Access

Перед публикацией в Worker нужно задать секреты `OWNER_EMAIL`, `ACCESS_TEAM_DOMAIN`, `ACCESS_POLICY_AUD`, `TELEGRAM_BOT_TOKEN` и `TELEGRAM_WEBHOOK_SECRET`. В Zero Trust создаётся self-hosted Access application для `https://skifia-art.site/studio-control/*` с политикой Allow только для email владельца. Worker дополнительно проверяет Access JWT на API-вызовах из административной панели.

## Проверка перед публикацией

Сначала выполните `pnpm run build:worker` и `pnpm run check:worker`. Затем примените схему и проверенный импорт на D1, загрузите медиа в R2, задайте секреты и только после этого запускайте `pnpm run deploy:worker`. Пользовательский домен `skifia-art.site` подключается после успешного test deployment.
