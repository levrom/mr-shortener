# mr-shortener

Простая сокращалка ссылок для Cloudflare Pages + KV.

## Как работает

- В KV храним пары `slug -> destination`
- Запрос на `/<slug>` делает `302` redirect на `destination`
- Интерфейса нет, только редиректы

## Что нужно настроить

1. Создай KV namespace с binding `REDIRECTS`
2. Привяжи этот namespace к Pages project `mr-shortener`
3. Добавляй записи в KV как обычные строки:

```bash
wrangler kv key put --binding=REDIRECTS "gh" "https://github.com/levrom/mr-shortener"
wrangler kv key put --binding=REDIRECTS "docs" "https://developers.cloudflare.com/"
```

Если namespace еще не создан:

```bash
wrangler kv namespace create REDIRECTS
```

## Пример

- `https://your-domain/gh` -> `https://github.com/levrom/mr-shortener`
- `https://your-domain/docs` -> `https://developers.cloudflare.com/`

## Локально

Если хочешь проверить через Wrangler, добавь KV binding `REDIRECTS` и затем запускай Pages dev.
