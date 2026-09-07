# Agent Skills — ANRO TRIP

> Установка: `pnpm skills:install` (или `node scripts/install-agent-skills.mjs`)  
> Каталог: [skills.sh](https://www.skills.sh/) · lock-файл: `skills-lock.json` (в git)

Skills лежат в `.agents/skills/` (локально, в gitignore). В репозитории хранится только `skills-lock.json` + кастомный skill в `.doc/meta/skills/anrotrip/`.

Workflow-скилы **aif-*** — в `.cursor/skills/` (отдельно, AI Factory).

---

## Установлено в проекте (16 + anrotrip)

### Разработка

| Skill                       | Пакет skills.sh                                                                                                                          | Назначение                                 |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `anrotrip`                  | **локальный** `.doc/meta/skills/anrotrip`                                                                                                | Контекст проекта, конституция, ограничения |
| `astro`                     | [astrolicious/agent-skills](https://skills.sh/astrolicious/agent-skills/astro)                                                           | Astro 7, islands, content collections      |
| `tailwind-4-docs`           | [lombiq/tailwind-agent-skills](https://skills.sh/lombiq/tailwind-agent-skills/tailwind-4-docs)                                           | Tailwind CSS v4 синтаксис                  |
| `accessibility`             | [addyosmani/web-quality-skills](https://skills.sh/addyosmani/web-quality-skills/accessibility)                                           | WCAG, a11y-аудит                           |
| `core-web-vitals`           | [addyosmani/web-quality-skills](https://skills.sh/addyosmani/web-quality-skills/core-web-vitals)                                         | LCP, INP, CLS                              |
| `best-practices`            | [addyosmani/web-quality-skills](https://skills.sh/addyosmani/web-quality-skills/best-practices)                                          | Security, современный веб                  |
| `web-design-guidelines`     | [vercel-labs/agent-skills](https://skills.sh/vercel-labs/agent-skills/web-design-guidelines)                                             | UI/UX review                               |
| `docker-patterns`           | [affaan-m/ecc](https://skills.sh/affaan-m/ecc/docker-patterns)                                                                           | Dockerfile, compose                        |
| `github-actions-templates`  | [wshobson/agents](https://skills.sh/wshobson/agents/github-actions-templates)                                                            | CI/CD workflows                            |
| `playwright-best-practices` | [currents-dev/playwright-best-practices-skill](https://skills.sh/currents-dev/playwright-best-practices-skill/playwright-best-practices) | E2E smoke                                  |
| `pwa-development`           | [alinaqi/maggy](https://skills.sh/alinaqi/maggy/pwa-development)                                                                         | Manifest, SW (этап 6)                      |

### Маркетинг и SEO

| Skill              | Пакет skills.sh                                                                                   | Назначение                           |
| ------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `seo-audit`        | [coreyhaines31/marketingskills](https://skills.sh/coreyhaines31/marketingskills/seo-audit)        | Технический SEO-аудит                |
| `schema`           | [coreyhaines31/marketingskills](https://skills.sh/coreyhaines31/marketingskills/schema)           | Schema.org, JSON-LD                  |
| `copywriting`      | [coreyhaines31/marketingskills](https://skills.sh/coreyhaines31/marketingskills/copywriting)      | Тексты, CTA                          |
| `content-strategy` | [coreyhaines31/marketingskills](https://skills.sh/coreyhaines31/marketingskills/content-strategy) | Блог, контент-план                   |
| `analytics`        | [coreyhaines31/marketingskills](https://skills.sh/coreyhaines31/marketingskills/analytics)        | GA4, события, UTM (Метрика — этап 6) |
| `cro`              | [coreyhaines31/marketingskills](https://skills.sh/coreyhaines31/marketingskills/cro)              | Конверсия форм и лендингов           |

---

## Не установлено (покрыто документацией или нет skill)

| Тема                | Почему не skill                                 | Где в проекте                                      |
| ------------------- | ----------------------------------------------- | -------------------------------------------------- |
| TypeScript strict   | Сканер заблокировал `typescript-advanced-types` | `AGENTS.md`, `tsconfig`                            |
| Zod                 | Сканер заблокировал `pydantic/zod` skill        | `src/lib/schemas.ts`, `.doc/forms/forms.md`        |
| Caddy               | Нет качественного skill на skills.sh            | `.doc/deploy/`                                     |
| Nodemailer / Sharp  | Нет отдельного skill                            | `src/lib/mail-*.ts`, `scripts/optimize-images.mjs` |
| Яндекс.Метрика      | Нет dedicated skill                             | `.doc/forms/analytics-cookies-plan.md`, этап 6     |
| Русская типографика | Нет skill                                       | `pnpm typograf:blog`, `src/lib/typograf.ts`        |
| Локальное SEO       | Частично `seo-audit` + schema                   | `.doc/content/Семантическое-ядро.md`               |

---

## Добавить skill вручную

```bash
npx skills add <owner/repo@skill> -y -a cursor
# Проверка (aif security scanner):
python3 .cursor/skills/aif-skill-generator/scripts/security-scan.py .agents/skills/<name>
```

После добавления — закоммитить обновлённый `skills-lock.json`.

---

## Связанные документы

| Документ                                             | Содержание              |
| ---------------------------------------------------- | ----------------------- |
| [project-roadmap.md](../roadmaps/project-roadmap.md) | Общий план              |
| `.specify/memory/constitution.md`                    | Конституция проекта     |
| `AGENTS.md`                                          | Руководство для агентов |
