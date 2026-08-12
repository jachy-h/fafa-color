import { clampBlue, fafaHex } from "./color";

const STORIES = [
	["lemon before noon", "a bright thought held close"],
	["a window left open", "warm air, almost still"],
	["glass after rain", "the room remembers sky"],
	["green tea in shade", "a small pause in the day"],
	["lake, not moving", "light settles on the surface"],
	["cotton under moonlight", "softness without a name"],
	["a blue held quietly", "the last sound before dark"],
	["snow taking light", "the horizon begins again"],
] as const;

const MEMORY_KEY = "fafa:today-spectrum";
const MEMORY_LIMIT = 7;

export function storyFor(blue: number) {
	const safeBlue = clampBlue(blue);
	return STORIES[Math.min(STORIES.length - 1, Math.floor(safeBlue / 32))];
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
		? "nothing held yet"
		: colors.map((blue) => fafaHex(blue)).join(", ");
}
