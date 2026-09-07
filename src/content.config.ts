import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'zod';

const blog = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			/** Hero внутри статьи (16:9) */
			heroImage: image().optional(),
			/** Превью карточки (4:3); если нет — используется heroImage */
			cardImage: image().optional(),
			/** Коллаж из нескольких изображений (приоритет над heroImage) */
			heroImages: z.array(image()).optional(),
			author: z.string().default('Команда ANRO TRIP'),
			destination: z.string().optional(),
			/** Крупная карточка в блоке «Журнал» на главной (одна на сайт) */
			featured: z.boolean().optional(),
			/** Черновик — не показывается на сайте (импорт из MAX и т.п.) */
			draft: z.boolean().default(false),
			/** Источник импорта */
			source: z.enum(['max']).optional(),
			/** ID поста в MAX (body.mid) */
			sourceId: z.string().optional(),
			/** Публичная ссылка на пост в MAX */
			sourceUrl: z.string().url().optional(),
			/** Дата импорта в репозиторий */
			importedAt: z.coerce.date().optional(),
		}),
});

export const collections = { blog };
