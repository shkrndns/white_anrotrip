# Cursor Remote Control — настройка (эта машина)

> Официальная документация: [cursor.com/docs/cloud-agent/mobile#remote-control](https://cursor.com/docs/cloud-agent/mobile#remote-control)

Remote Control передаёт **управление агентом на телефон**, а **инструменты** (терминал, файлы, тесты) выполняются на этом ПК.

---

## Проверено автоматически

| Проверка          | Статус                                            |
| ----------------- | ------------------------------------------------- |
| Cursor            | **3.19.7** (нужно ≥ 3.9.8) ✓                      |
| Git remote        | `origin` → `github.com/shkrndns/white_anrotrip` ✓ |
| Agent skills      | `pnpm skills:install` ✓                           |
| `systemd-inhibit` | `/usr/bin/systemd-inhibit` ✓                      |

---

## Перед сессией Remote Control

1. ПК **в сети**, Cursor **открыт**, проект `white_anrotrip` открыт.
2. Запустить блокировку сна (в отдельном терминале):

```bash
./scripts/cursor-remote-control-awake.sh
```

Или в Cursor: **Agents Window → Settings → Agents → Keep this computer awake** (при питании от сети).

3. В **Agents Window** (не обычный Composer): включить **Remote Control**.
4. В поле агента: `/remote-control`, затем задача.
5. На **iPhone/iPad**: приложение [Cursor](https://apps.apple.com/app/cursor/id6767085653), тот же аккаунт → inbox → сессия.

---

## Только вручную (агент не может)

- [ ] **Платный план** с Cloud Agents (Pro / Pro+ / Ultra / Teams).
- [ ] **Privacy Mode** (не Legacy) — Remote Control требует cloud storage для сессии.
- [ ] Включить **Remote Control** в GUI: Agents Window → Settings → Agents.
- [ ] **Teams/Enterprise**: админ → [Dashboard → Cloud Agents → Self-Hosted](https://cursor.com/dashboard/cloud-agents#self-hosted).
- [ ] Установить **Cursor для iOS**, войти в тот же аккаунт.
- [ ] Первый раз: отправить `/remote-control` и проверить, что сессия видна в приложении.

---

## Важно

- Команды в Remote Control часто **авто-одобряются** (не Allowlist с десктопа). См. [форум Cursor](https://forum.cursor.com/t/ios-remote-control-command-allowlist/166447).
- Android-приложения пока нет; с телефона — iOS или [cursor.com/agents](https://cursor.com/agents) в браузере.
- Это **не** SSH и **не** удалённый рабочий стол — только управление агентом Cursor.

---

## Быстрая диагностика

| Симптом                   | Что проверить                                               |
| ------------------------- | ----------------------------------------------------------- |
| Нет пункта Remote Control | Обновить Cursor; открыть **Agents Window**                  |
| Сессия не на телефоне     | Тот же аккаунт; после `/remote-control` отправить сообщение |
| Агент «завис»             | ПК уснул? Запустить `cursor-remote-control-awake.sh`        |
| Teams                     | Админ включил Self-Hosted / Remote Control                  |
