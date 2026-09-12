# ANRO TRIP — Путешествия и командировки

Веб-сайт туристического агентства **ANRO TRIP**. Организации путешествий и командировок по всему миру. Консьерж-сервис с полным циклом обслуживания.

**Репозиторий:** [github.com/shkrndns/white_anrotrip](https://github.com/shkrndns/white_anrotrip)
**Зеркало (Gitflic):** [gitflic.ru/project/shkrndns/white_anrotrip](https://gitflic.ru/project/shkrndns/white_anrotrip)

---

### Страницы

| Страница       | Описание                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| `/`            | Главная — Hero, поиск, популярные туры, о компании, партнёры, отзывы, награды, подарки, команда, контакты |
| `/cabinet`     | Личный кабинет — форма входа (`action` → `lk.anrotrip.ru`)                                                |
| `/terms`       | Условия использования                                                                                     |
| `/privacy`     | Политика конфиденциальности (152-ФЗ)                                                                      |
| `/blog`        | Журнал — список статей                                                                                    |
| `/blog/[slug]` | Статья журнала (7 материалов)                                                                             |

---

## Внешние сервисы

- **Nemo API** — поиск туров
- **Tourvisor** — поиск туров (особая обработка iframe)
- **Яндекс.Карты** — карта офиса
- **WhatsApp, Telegram** — контактные ссылки
- **Личный кабинет** — `https://lk.anrotrip.ru`

---

## Разработка

```bash
pnpm install
pnpm skills:install   # локально: agent skills (нужны skills-lock.json)
pnpm dev
```

ИИ-агенты (только локально, не в git): **`AGENTS.md`** · `.cursor/rules/` · `skills-lock.json` · `skills/anrotrip/` · `.doc/`

---

## Лицензия

Проект Anrotrip. Все права защищены.
