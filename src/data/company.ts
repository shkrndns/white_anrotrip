/**
 * Единый источник NAP (Name, Address, Phone) и контактов ANRO TRIP.
 * Schema.org, компоненты и AGENTS.md должны читать отсюда.
 */
export const company = {
	brand: 'ANRO TRIP',
	legalName: 'ООО «АНРО»',
	siteUrl: 'https://anrotrip.ru',

	phones: {
		tollFree: {
			display: '8 (800) 222-44-73',
			tel: '88002224473',
			e164: '+78002224473',
		},
		mobile: {
			display: '+7 (922) 026-70-59',
			displayCompact: '+7-922-026-70-59',
			tel: '+79220267059',
			e164: '+79220267059',
			whatsapp: '79220267059',
		},
		chelyabinskOffice: {
			display: '8 (351) 225-29-91',
			tel: '83512252991',
			e164: '+73512252991',
		},
	},

	emails: {
		/** Публичный email на сайте, в футере и формах */
		public: 'anro@anrotrip.ru',
		/** Административный / команда */
		online: 'online@anrotrip.ru',
	},

	social: {
		telegram: 'https://t.me/anrotrip',
		telegramChannel: 'https://t.me/anro_trip',
		vk: 'https://vk.com/anrotrip',
		vkRu: 'https://vk.ru/anrotrip',
		maxBiz: 'https://max.ru/id6658540239_biz',
		maxChannel:
			'https://max.ru/u/f9LHodD0cOKNXrTMtvUZWd2zLeGEpz34bQ0i1a-Ur_6EKrIw9H11bR6uhLM',
	},

	offices: {
		chelyabinsk: {
			id: 'chelyabinsk',
			name: 'ANRO TRIP — Челябинск',
			isPrimary: true,
			address: {
				streetAddress: 'ул. 250-летия Челябинска, д. 29, пом. 2',
				streetShort: 'ул. 250-летия Челябинска, д. 29',
				locality: 'Челябинск',
				postalCode: '454003',
				country: 'RU',
				display: 'г. Челябинск, ул. 250-летия Челябинска, д. 29',
				displayMultiline: 'г. Челябинск,<br />ул. 250-летия Челябинска, д. 29',
			},
			geo: {
				latitude: 55.172378,
				longitude: 61.287497,
			},
			mapUrl:
				'https://yandex.com/maps/org/anro_trip/186447146474/?ll=61.287497%2C55.172378&z=16',
			openingHours: {
				weekdaysLabel: 'ПН–ПТ: 9:00–18:00',
				weekendNote: 'СБ–ВС по предварительной договорённости',
				specification: [
					{
						dayOfWeek: [
							'Monday',
							'Tuesday',
							'Wednesday',
							'Thursday',
							'Friday',
						] as const,
						opens: '09:00',
						closes: '18:00',
					},
				],
			},
			phone: 'chelyabinskOffice' as const,
		},
		ekaterinburg: {
			id: 'ekaterinburg',
			name: 'ANRO TRIP — Екатеринбург',
			isPrimary: false,
			address: {
				locality: 'Екатеринбург',
				region: 'Свердловская область',
				country: 'RU',
			},
			phone: 'tollFree' as const,
		},
	},

	representativeCities: ['Москва', 'Екатеринбург'] as const,
} as const;

/** Уникальные профили в соцсетях для schema.org sameAs */
export const companySameAs = [
	company.social.telegramChannel,
	company.social.maxChannel,
	company.social.telegram,
	company.social.vk,
	company.social.maxBiz,
] as const;

export function companyPhoneHref(
	key: keyof typeof company.phones,
): `tel:${string}` {
	return `tel:${company.phones[key].tel}`;
}

export function companyMailto(
	key: keyof typeof company.emails = 'public',
): `mailto:${string}` {
	return `mailto:${company.emails[key]}`;
}

export function companyWhatsAppHref(): string {
	return `https://wa.me/${company.phones.mobile.whatsapp}`;
}
