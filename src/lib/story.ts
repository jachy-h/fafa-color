import { clampBlue, fafaHex } from "./color";

const STORIES = [
	["正午前的柠檬", "一束明亮的念头，被轻轻握住"],
	["一扇未合的窗", "暖风掠过，房间没有说话"],
	["雨后的玻璃", "天空还留在屋里"],
	["树荫里的春茶", "白昼有了片刻停顿"],
	["静止的湖面", "光慢慢落在水上"],
	["月光下的棉絮", "柔软，不必命名"],
	["被安静留住的蓝", "天黑前，最后一点声响"],
	["雪接住了光", "地平线又一次开始"],
] as const;

const COLOR_NAMES = [
	"柠檬", "晨雾", "薄荷", "春茶",
	"湖色", "天青", "水汽", "微蓝",
	"棉絮", "月白", "夜蓝", "靛影",
	"星尘", "霜色", "雪光", "极昼",
] as const;

const MEMORY_KEY = "fafa:today-spectrum";
const MEMORY_LIMIT = 7;

export function storyFor(blue: number) {
	const safeBlue = clampBlue(blue);
	return STORIES[Math.min(STORIES.length - 1, Math.floor(safeBlue / 32))];
}

export function colorNameFor(blue: number): string {
	return COLOR_NAMES[Math.min(COLOR_NAMES.length - 1, Math.floor(clampBlue(blue) / 16))];
}

export function readTodaySpectrum(): number[] {
	try {
		const saved = JSON.parse(window.localStorage.getItem(MEMORY_KEY) ?? "[]");
		return Array.isArray(saved)
			? saved.filter((value) => Number.isInteger(value) && value >= 0 && value <= 255)
			: [];
	} catch {
		return [];
	}
}

export function rememberColor(blue: number): number[] {
	const safeBlue = clampBlue(blue);
	const next = [safeBlue, ...readTodaySpectrum().filter((value) => value !== safeBlue)].slice(
		0,
		MEMORY_LIMIT,
	);
	try {
		window.localStorage.setItem(MEMORY_KEY, JSON.stringify(next));
	} catch {
		// Keeping a temporary spectrum is still useful when storage is unavailable.
	}
	return next;
}

export function spectrumLabel(colors: number[]): string {
	return colors.length === 0
		? "尚未留存颜色"
		: colors.map((blue) => fafaHex(blue)).join(", ");
}
