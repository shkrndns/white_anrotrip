#!/usr/bin/env node
/**
 * Перенос тона кожи с эталонного фото на исходное (Reinhard LAB, только skin-mask).
 * Использование: node scripts/skin-tone-transfer.mjs <source> <reference> <output> [strength]
 */

import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const [sourcePath, refPath, outPath, strengthArg] = process.argv.slice(2);
const STRENGTH = strengthArg ? Number(strengthArg) : 0.82;

if (!sourcePath || !refPath || !outPath) {
	console.error(
		'Usage: node scripts/skin-tone-transfer.mjs <source> <reference> <output> [strength]',
	);
	process.exit(1);
}

function rgbToLab(r, g, b) {
	let rr = r / 255;
	let gg = g / 255;
	let bb = b / 255;
	rr = rr > 0.04045 ? ((rr + 0.055) / 1.055) ** 2.4 : rr / 12.92;
	gg = gg > 0.04045 ? ((gg + 0.055) / 1.055) ** 2.4 : gg / 12.92;
	bb = bb > 0.04045 ? ((bb + 0.055) / 1.055) ** 2.4 : bb / 12.92;
	const x = (rr * 0.4124564 + gg * 0.3575761 + bb * 0.1804375) / 0.95047;
	const y = (rr * 0.2126729 + gg * 0.7151522 + bb * 0.072175) / 1.0;
	const z = (rr * 0.0193339 + gg * 0.119192 + bb * 0.9503041) / 1.08883;
	const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
	const fx = f(x);
	const fy = f(y);
	const fz = f(z);
	return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function labToRgb(L, a, b) {
	const fy = (L + 16) / 116;
	const fx = a / 500 + fy;
	const fz = fy - b / 200;
	const fInv = (t) => {
		const t3 = t * t * t;
		return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787;
	};
	const x = fInv(fx) * 0.95047;
	const y = fInv(fy) * 1.0;
	const z = fInv(fz) * 1.08883;
	let r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
	let g = x * -0.969266 + y * 1.8760108 + z * 0.041556;
	let bb = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;
	const gamma = (u) =>
		u <= 0.0031308 ? 12.92 * u : 1.055 * u ** (1 / 2.4) - 0.055;
	return [
		Math.min(255, Math.max(0, Math.round(gamma(r) * 255))),
		Math.min(255, Math.max(0, Math.round(gamma(g) * 255))),
		Math.min(255, Math.max(0, Math.round(gamma(bb) * 255))),
	];
}

function skinWeight(r, g, b) {
	const y = 0.299 * r + 0.587 * g + 0.114 * b;
	const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
	const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
	if (y <= 55 || y >= 245 || cb < 75 || cb > 130 || cr < 130 || cr > 178)
		return 0;
	const dist = Math.hypot(cb - 101, cr - 154);
	return Math.max(0, 1 - dist / 35);
}

async function loadRaw(path) {
	const { data, info } = await sharp(path)
		.removeAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });
	return { data: new Uint8ClampedArray(data), info };
}

function channelStats(lab, weights, ch, n) {
	let sum = 0;
	let sum2 = 0;
	let cnt = 0;
	for (let i = 0; i < n; i++) {
		const w = weights[i];
		if (w < 0.15) continue;
		const v = lab[i * 3 + ch];
		sum += v * w;
		sum2 += v * v * w;
		cnt += w;
	}
	const mean = sum / cnt;
	const variance = sum2 / cnt - mean * mean;
	return { mean, std: Math.sqrt(Math.max(variance, 1e-6)) };
}

const src = await loadRaw(sourcePath);
const ref = await loadRaw(refPath);

if (src.info.width !== ref.info.width || src.info.height !== ref.info.height) {
	console.error(
		`Размеры не совпадают: ${src.info.width}x${src.info.height} vs ${ref.info.width}x${ref.info.height}`,
	);
	process.exit(1);
}

const { width, height } = src.info;
const n = width * height;
const srcLab = new Float64Array(n * 3);
const refLab = new Float64Array(n * 3);
const weights = new Float64Array(n);

for (let i = 0, p = 0; i < n; i++, p += 3) {
	const [sl, sa, sb] = rgbToLab(src.data[p], src.data[p + 1], src.data[p + 2]);
	const [rl, ra, rb] = rgbToLab(ref.data[p], ref.data[p + 1], ref.data[p + 2]);
	srcLab[i * 3] = sl;
	srcLab[i * 3 + 1] = sa;
	srcLab[i * 3 + 2] = sb;
	refLab[i * 3] = rl;
	refLab[i * 3 + 1] = ra;
	refLab[i * 3 + 2] = rb;
	weights[i] = skinWeight(src.data[p], src.data[p + 1], src.data[p + 2]);
}

function rgbChannelStats(data, weights, ch, n) {
	let sum = 0;
	let sum2 = 0;
	let cnt = 0;
	for (let i = 0; i < n; i++) {
		const w = weights[i];
		if (w < 0.15) continue;
		const v = data[i * 3 + ch];
		sum += v * w;
		sum2 += v * v * w;
		cnt += w;
	}
	const mean = sum / cnt;
	const variance = sum2 / cnt - mean * mean;
	return { mean, std: Math.sqrt(Math.max(variance, 1e-6)) };
}

const srcLabStats = [0, 1, 2].map((ch) => channelStats(srcLab, weights, ch, n));
const refLabStats = [0, 1, 2].map((ch) => channelStats(refLab, weights, ch, n));
const srcRgbStats = [0, 1, 2].map((ch) =>
	rgbChannelStats(src.data, weights, ch, n),
);
const refRgbStats = [0, 1, 2].map((ch) =>
	rgbChannelStats(ref.data, weights, ch, n),
);

const out = new Uint8ClampedArray(src.data.length);

for (let i = 0, p = 0; i < n; i++, p += 3) {
	const w = weights[i] * STRENGTH;

	if (w > 0.01) {
		let L = srcLab[i * 3];
		let a = srcLab[i * 3 + 1];
		let b = srcLab[i * 3 + 2];

		const labChannels = [L, a, b].map((v, ch) => {
			const s = srcLabStats[ch];
			const r = refLabStats[ch];
			return (v - s.mean) * (r.std / s.std) + r.mean;
		});

		const rgbChannels = [src.data[p], src.data[p + 1], src.data[p + 2]].map(
			(v, ch) => {
				const s = srcRgbStats[ch];
				const r = refRgbStats[ch];
				return (v - s.mean) * (r.std / s.std) + r.mean;
			},
		);

		const [lr, lg, lb] = labToRgb(
			labChannels[0],
			labChannels[1],
			labChannels[2],
		);
		const mix = 0.55; // LAB + RGB transfer для более естественного тона кожи
		const nr = lr * mix + rgbChannels[0] * (1 - mix);
		const ng = lg * mix + rgbChannels[1] * (1 - mix);
		const nb = lb * mix + rgbChannels[2] * (1 - mix);

		out[p] = Math.round(src.data[p] * (1 - w) + nr * w);
		out[p + 1] = Math.round(src.data[p + 1] * (1 - w) + ng * w);
		out[p + 2] = Math.round(src.data[p + 2] * (1 - w) + nb * w);
	} else {
		out[p] = src.data[p];
		out[p + 1] = src.data[p + 1];
		out[p + 2] = src.data[p + 2];
	}
}

const webp = await sharp(out, { raw: { width, height, channels: 3 } })
	.webp({ quality: 92, effort: 6 })
	.toBuffer();

await writeFile(outPath, webp);
console.log(
	`Готово: ${outPath} (${(webp.length / 1024).toFixed(1)} KB, strength=${STRENGTH})`,
);
