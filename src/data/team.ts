/**
 * Сотрудники ANRO TRIP — карточки в раскрывающемся списке «Вся команда».
 */
import type { ImageMetadata } from 'astro';

import uDenisovaImg from '../assets/team/u_denisova.webp';
import eNedelkoImg from '../assets/team/e_nedelko.webp';
import aDenisovaImg from '../assets/team/a_denisova.webp';
import eSherbakovaImg from '../assets/team/e_sherbakova.webp';
import sMosincevaImg from '../assets/team/s_mosinceva.webp';
import nKorolevaImg from '../assets/team/n_koroleva.webp';
import uSubotinaImg from '../assets/team/u_subotina.webp';
import dSemushinaImg from '../assets/team/d_semushina.webp';
import tDankovaImg from '../assets/team/t_dankova.webp';
import sLednevaImg from '../assets/team/s_ledneva.webp';
import kTsypyshevaImg from '../assets/team/k_tsypysheva.webp';
import kMusinaImg from '../assets/team/k_musina.webp';
import aBochkarevaImg from '../assets/team/a_bochkareva.webp';
import aKrestovskichImg from '../assets/team/a_krestovskich.webp';
import eGolovanovaImg from '../assets/team/e_golovanova.webp';
import uPasynkovaImg from '../assets/team/u_pasynkova.webp';
import aBatenevaImg from '../assets/team/a_bateneva.webp';
import mVinokurovaImg from '../assets/team/m_vinokurova.webp';
import oGolikovaImg from '../assets/team/o_golikova.webp';
import oDomashevskayaImg from '../assets/team/o_domashevskaya.webp';
import eMamikinaImg from '../assets/team/e_mamykina.webp';
import nVafinaImg from '../assets/team/n_vafina.webp';
import kNagovicynaImg from '../assets/team/k_nagovicyna.webp';

export interface TeamMember {
	name: string;
	role: string;
	dept: string;
	email: string;
	phone: string;
	img: ImageMetadata;
	photoClass?: string;
}

export const teamMembers: TeamMember[] = [
	{
		name: 'Юлия Денисова',
		role: 'Административный директор',
		dept: 'г. Челябинск',
		email: 'online@anrotrip.ru',
		phone: '8 (800) 222-44-73',
		img: uDenisovaImg,
	},
	{
		name: 'Екатерина Неделько',
		role: 'Руководитель',
		dept: 'Авиаотдел',
		email: 'e.nedelko@anrotrip.ru',
		phone: '8 (800) 222-44-73 доб. 115',
		img: eNedelkoImg,
		photoClass:
			'-translate-y-2 object-[50%_40%] scale-[1.14] group-hover:scale-[1.18]',
	},
	{
		name: 'Анна Денисова',
		role: 'Руководитель',
		dept: 'Туристический отдел',
		email: 'a.denisova@anrotrip.ru',
		phone: '8 (800) 222-44-73',
		img: aDenisovaImg,
		photoClass: 'object-[50%_42%] scale-[1.08] group-hover:scale-[1.12]',
	},
	{
		name: 'Елена Щербакова',
		role: 'Авиакассир',
		dept: 'Авиаотдел',
		email: 'lena@anrotrip.ru',
		phone: '8 (800) 222-44-73 доб. 114',
		img: eSherbakovaImg,
		photoClass: 'object-[50%_42%] scale-[1.08] group-hover:scale-[1.12]',
	},
	{
		name: 'Светлана Мосинцева',
		role: 'Авиакассир',
		dept: 'Авиаотдел',
		email: 'svetlana.m@anrotrip.ru',
		phone: '8 (800) 222-44-73 доб. 111',
		img: sMosincevaImg,
	},
	{
		name: 'Наталья Королёва',
		role: 'Авиакассир',
		dept: 'Авиаотдел',
		email: 'koroleva@anrotrip.ru',
		phone: '8 (800) 222-44-73 доб. 112',
		img: nKorolevaImg,
	},
	{
		name: 'Юлия Субботина',
		role: 'Авиакассир',
		dept: 'Авиаотдел',
		email: 'iuliia.s@anrotrip.ru',
		phone: '8 (800) 222-44-73 доб. 116',
		img: uSubotinaImg,
	},
	{
		name: 'Диана Семушова',
		role: 'Авиакассир',
		dept: 'Авиаотдел',
		email: 'diana@anrotrip.ru',
		phone: '8 (800) 222-44-73 доб. 110',
		img: dSemushinaImg,
	},
	{
		name: 'Татьяна Данкова',
		role: 'Авиакассир',
		dept: 'Авиаотдел',
		email: 't.dankova@anrotrip.ru',
		phone: '8 (800) 222-44-73',
		img: tDankovaImg,
	},
	{
		name: 'Светлана Леднева',
		role: 'Авиакассир',
		dept: 'Авиаотдел',
		email: 'svetlana.l@anrotrip.ru',
		phone: '8 (800) 222-44-73 доб. 115',
		img: sLednevaImg,
	},
	{
		name: 'Кристина Цыпышева',
		role: 'Авиакассир',
		dept: 'Авиаотдел',
		email: 'k.tsypysheva@anrotrip.ru',
		phone: '8 (800) 222-44-73 доб. 222',
		img: kTsypyshevaImg,
		photoClass: 'object-[50%_42%] scale-[1.08] group-hover:scale-[1.12]',
	},
	{
		name: 'Ксения Мусина',
		role: 'Менеджер',
		dept: 'Отдел сервиса',
		email: 'ksenia@anrotrip.ru',
		phone: '8 (800) 222-44-73 доб. 666',
		img: kMusinaImg,
	},
	{
		name: 'Анна Бочкарева',
		role: 'Менеджер',
		dept: 'Туристический отдел',
		email: 'bochkareva@anrotrip.ru',
		phone: '8 (800) 222-44-73 доб. 120',
		img: aBochkarevaImg,
		photoClass: 'object-[50%_42%] scale-[1.00] group-hover:scale-[1.04]',
	},
	{
		name: 'Анастасия Крестовских',
		role: 'Менеджер',
		dept: 'Туристический отдел',
		email: 'anastasiya@anrotrip.ru',
		phone: '8 (800) 222-44-73 доб. 117',
		img: aKrestovskichImg,
	},
	{
		name: 'Елена Голованова',
		role: 'Менеджер',
		dept: 'Туристический отдел',
		email: 'anro.chelyabinsk@anrotrip.ru',
		phone: '8 (800) 222-44-73 доб. 119',
		img: eGolovanovaImg,
	},
	{
		name: 'Юлия Пасынкова',
		role: 'Менеджер',
		dept: 'Туристический отдел',
		email: 'anro.chelyabinsk@anrotrip.ru',
		phone: '8 (800) 222-44-73 доб. 118',
		img: uPasynkovaImg,
	},
	{
		name: 'Анна Батенева',
		role: 'Менеджер',
		dept: 'Туристический отдел',
		email: 'a.bateneva@anrotrip.ru',
		phone: '8 (800) 222-44-73 доб. 122',
		img: aBatenevaImg,
	},
	{
		name: 'Мария Винокурова',
		role: 'Менеджер',
		dept: 'Туристический отдел',
		email: 'm.vinokurova@anrotrip.ru',
		phone: '8 (800) 222-44-73',
		img: mVinokurovaImg,
		photoClass: 'object-[50%_42%] scale-[1.08] group-hover:scale-[1.12]',
	},
	{
		name: 'Ольга Голикова',
		role: 'Визовый специалист',
		dept: 'Туристический отдел',
		email: 'visa@anrotrip.ru',
		phone: '8 (800) 222-44-73',
		img: oGolikovaImg,
	},
	{
		name: 'Ольга Домашевская',
		role: 'Главный бухгалтер',
		dept: 'Финансовый отдел',
		email: 'finance@anrotrip.ru',
		phone: '8 (800) 222-44-73 доб. 333',
		img: oDomashevskayaImg,
	},
	{
		name: 'Екатерина Мамыкина',
		role: 'Бухгалтер',
		dept: 'Финансовый отдел',
		email: 'katya@anrotrip.ru',
		phone: '8 (800) 222-44-73',
		img: eMamikinaImg,
	},
	{
		name: 'Наталья Вафина',
		role: 'Бухгалтер',
		dept: 'Финансовый отдел',
		email: 'natalia.v@anrotrip.ru',
		phone: '8 (800) 222-44-73',
		img: nVafinaImg,
	},
	{
		name: 'Кристина Наговицына',
		role: 'Бухгалтер',
		dept: 'Финансовый отдел',
		email: 'buh1@anrotrip.ru',
		phone: '8 (800) 222-44-73',
		img: kNagovicynaImg,
		photoClass: 'object-[50%_42%] scale-[1.10] group-hover:scale-[1.14]',
	},
];
