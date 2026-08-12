export const FAFA_CHANNEL = 250;

export function clampBlue(value: number): number {
	return Math.max(0, Math.min(255, Math.round(value)));
}

export function blueToHex(value: number): string {
	return clampBlue(value).toString(16).padStart(2, "0");
}

export function fafaColor(value: number): string {
	return `#fafa${blueToHex(value)}`;
}

export function fafaHex(value: number): string {
	return fafaColor(value).toUpperCase();
}

export function progressToBlue(progress: number): number {
	return clampBlue(Math.max(0, Math.min(1, progress)) * 255);
}

export function parseBlue(value: string | null): number | null {
	if (!value || !/^[\da-f]{1,2}$/i.test(value)) return null;
	return Number.parseInt(value, 16);
}
