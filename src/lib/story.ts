import { clampBlue } from "./color";

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
	"柠檬刚被切开",
	"太阳的余温",
	"一颗尚未熟透的杏",
	"午后留在纸上的光",
	"柚黄，接近明亮",
	"风从叶子之间穿过",
	"绿意尚未命名",
	"像一句停在半途的话",
	"呼吸变得很轻",
	"水面没有回答",
	"安静正在发生",
	"远处的光，慢慢褪色",
	"记忆里的一阵风",
	"云把声音收起来",
	"雪接住了白昼",
	"极昼，仍未抵达尽头",
] as const;

export function storyFor(blue: number) {
	const safeBlue = clampBlue(blue);
	return STORIES[Math.min(STORIES.length - 1, Math.floor(safeBlue / 32))];
}

export function colorNameFor(blue: number): string {
	return COLOR_NAMES[Math.min(COLOR_NAMES.length - 1, Math.floor(clampBlue(blue) / 16))];
}
