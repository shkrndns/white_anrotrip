# Зеркало репозитория на Gitflic

> Настроено: июнь 2026 · обновлено 2026-09-07  
> Цель: страховка от блокировки GitHub со стороны США или РФ.

---

## Что сделано

| Что                      | Где                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| **Основной репозиторий** | [github.com/shkrndns/white_anrotrip](https://github.com/shkrndns/white_anrotrip)                 |
| Зеркало Gitflic          | [gitflic.ru/project/shkrndns/white_anrotrip](https://gitflic.ru/project/shkrndns/white_anrotrip) |
| Workflow-файл            | `.github/workflows/mirror-gitflic.yml`                                                           |
| GitHub Secret            | `GITFLIC_TOKEN` — токен от аккаунта `shkrndns` на Gitflic                                        |

---

## Как работает

При каждом `git push` в **любую ветку** на GitHub автоматически запускается GitHub Actions:

```
GitHub push → Actions: mirror-gitflic.yml → git push --mirror → Gitflic
```

Токен **не** хранится в URL workflow-файла — используется credential helper + secret `GITFLIC_TOKEN`.

Зеркалятся все ветки, теги и история коммитов.

---

## Аккаунты и доступы

| Платформа | Логин      | URL                                        |
| --------- | ---------- | ------------------------------------------ |
| GitHub    | `shkrndns` | github.com/shkrndns/white_anrotrip         |
| Gitflic   | `shkrndns` | gitflic.ru/project/shkrndns/white_anrotrip |

---

## Если GitHub недоступен

1. Клонировать с Gitflic: `git clone https://gitflic.ru/project/shkrndns/white_anrotrip.git`
2. Или скачать архив из Gitflic UI
3. После восстановления GitHub — `git push` из локальной копии

---

## Обновление токена Gitflic

1. Gitflic → Настройки → Токены → создать новый
2. GitHub → [Settings → Secrets → GITFLIC_TOKEN](https://github.com/shkrndns/white_anrotrip/settings/secrets/actions) → Update
3. Проверить: push в любую ветку → workflow «Mirror to Gitflic» зелёный

---

## Связанные документы

| Документ                                               | Содержание      |
| ------------------------------------------------------ | --------------- |
| [server-vps-stack-plan.md](./server-vps-stack-plan.md) | CI/CD, GHCR     |
| [project-roadmap.md](./project-roadmap.md)             | Фаза 0: Gitflic |
