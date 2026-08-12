import { useCallback, useEffect, useRef, useState } from "react";
import { fafaColor, fafaHex, parseBlue, progressToBlue } from "./lib/color";
import {
	readTodaySpectrum,
	rememberColor,
	spectrumLabel,
	storyFor,
} from "./lib/story";

const MOMENTS = [
	{ at: 0, word: "起点" },
	{ at: 32, word: "暖意" },
	{ at: 64, word: "初醒" },
	{ at: 96, word: "午后" },
	{ at: 128, word: "介于之间" },
	{ at: 160, word: "静下来" },
	{ at: 192, word: "像一段记忆" },
	{ at: 224, word: "渐渐褪去" },
	{ at: 255, word: "光" },
];

function closestMoment(blue: number): string {
	return MOMENTS.reduce((nearest, moment) =>
		Math.abs(moment.at - blue) < Math.abs(nearest.at - blue) ? moment : nearest,
	).word;
}

function sceneFor(progress: number): string {
	if (progress < 0.13) return "name";
	if (progress < 0.26) return "missing";
	if (progress < 0.54) return "range";
	if (progress < 0.68) return "field";
	if (progress < 0.79) return "name";
	if (progress < 0.9) return "possibilities";
	return "light";
}

function Counter({ blue }: { blue: number }) {
	const characters = fafaHex(blue).slice(-2).split("");
	return (
		<span className="counter" aria-label={`当前颜色 ${fafaHex(blue)}`}>
			<span className="stable">#FAFA</span>
			{characters.map((character, index) => (
				<span className="counter__digit" key={index} aria-hidden="true">
					<span
						style={{
							transform: `translateY(-${Number.parseInt(character, 16) * 6.25}%)`,
						}}
					>
						0<br />1<br />2<br />3<br />4<br />5<br />6<br />7<br />8<br />9
						<br />A<br />B<br />C<br />D<br />E<br />F
					</span>
				</span>
			))}
		</span>
	);
}

function ColorField({
	activeBlue,
	onPick,
}: {
	activeBlue: number;
	onPick: (blue: number) => void;
}) {
	const fieldRef = useRef<HTMLDivElement>(null);
	const [hovered, setHovered] = useState<number | null>(null);

	const blueFromClientY = (clientY: number) => {
		const rect = fieldRef.current?.getBoundingClientRect();
		if (!rect) return null;
		return Math.max(
			0,
			Math.min(255, Math.floor(((clientY - rect.top) / rect.height) * 256)),
		);
	};

	const updateHover = (clientY: number) => {
		setHovered(blueFromClientY(clientY));
	};

	const stepActive = (event: React.KeyboardEvent<HTMLDivElement>) => {
		const steps: Record<string, number> = {
			ArrowUp: -1,
			ArrowDown: 1,
			PageUp: -16,
			PageDown: 16,
			Home: -activeBlue,
			End: 255 - activeBlue,
		};
		if (!(event.key in steps)) return;
		event.preventDefault();
		onPick(Math.max(0, Math.min(255, activeBlue + steps[event.key])));
	};

	const reading = hovered ?? activeBlue;

	return (
		<section className="color-field" aria-label="全部 256 种 FAFA 颜色">
			<p className="field-index">00 — FF / 256</p>
			<div
				className="color-field__lines"
				ref={fieldRef}
				role="slider"
				tabIndex={0}
				aria-label="蓝色通道"
				aria-valuemin={0}
				aria-valuemax={255}
				aria-valuenow={activeBlue}
				aria-valuetext={fafaHex(activeBlue)}
				onPointerMove={(event) => updateHover(event.clientY)}
				onPointerLeave={() => setHovered(null)}
				onKeyDown={stepActive}
			>
				<div
					className="field-cursor field-cursor--active"
					style={{ top: `${(activeBlue / 255) * 100}%` }}
					aria-hidden="true"
				>
					<span>{fafaHex(activeBlue)}</span>
				</div>
				{hovered !== null && (
					<div
						className="field-cursor field-cursor--hover"
						style={{ top: `${(hovered / 255) * 100}%` }}
						aria-hidden="true"
					>
						<span>{fafaHex(hovered)}</span>
					</div>
				)}
				{Array.from({ length: 256 }, (_, blue) => (
					<button
						className={`color-line ${hovered === blue ? "is-hovered" : ""} ${activeBlue === blue ? "is-active" : ""}`}
						key={blue}
						style={{ backgroundColor: fafaColor(blue) }}
						aria-label={`选择 ${fafaHex(blue)}`}
						tabIndex={activeBlue === blue ? 0 : -1}
						onFocus={() => setHovered(blue)}
						onClick={() => onPick(blue)}
					/>
				))}
			</div>
			<p className="field-reading" aria-live="polite">
				{fafaHex(reading)}
			</p>
		</section>
	);
}

function DebugPanel({
	progress,
	blue,
	fps,
	scene,
}: {
	progress: number;
	blue: number;
	fps: number;
	scene: string;
}) {
	return (
		<aside className="debug" aria-label="调试信息">
			<span>scroll&nbsp;&nbsp;&nbsp; {progress.toFixed(3)}</span>
			<span>blue&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {blue}</span>
			<span>hex&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {fafaHex(blue)}</span>
			<span>fps&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {fps}</span>
			<span>scene&nbsp;&nbsp;&nbsp;&nbsp; {scene}</span>
		</aside>
	);
}

function Spectrum({ colors, onPick }: { colors: number[]; onPick: (blue: number) => void }) {
	return (
		<section className="spectrum" aria-label={`今日色谱：${spectrumLabel(colors)}`}>
			<div className="spectrum__heading">
				<p>今日色谱</p>
				<span>已留存 {colors.length}/7</span>
			</div>
			<div className="spectrum__colors">
				{colors.length > 0 ? (
					colors.map((item) => (
						<button
							key={item}
							type="button"
							style={{ backgroundColor: fafaColor(item) }}
							onClick={() => onPick(item)}
							aria-label={`回到 ${fafaHex(item)}`}
						/>
					))
				) : (
					<span className="spectrum__empty">选择一种颜色，留下痕迹</span>
				)}
			</div>
		</section>
	);
}

export function App() {
	const params = new URLSearchParams(window.location.search);
	const sharedBlue = parseBlue(params.get("b"));
	const debug = params.get("debug") === "true";
	const reducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	const [blue, setBlue] = useState(sharedBlue ?? 0);
	const [progress, setProgress] = useState(0);
	const [copied, setCopied] = useState(false);
	const [introColor, setIntroColor] = useState(sharedBlue);
	const [fps, setFps] = useState(60);
	const [spectrum, setSpectrum] = useState<number[]>(() => readTodaySpectrum());
	const latest = useRef({
		blue: sharedBlue ?? 0,
		progress: 0,
		manual: null as number | null,
	});
	const lastRender = useRef(0);
	const copyTimer = useRef<number | undefined>(undefined);

	const choose = useCallback((nextBlue: number, remember = true) => {
		latest.current.manual = nextBlue;
		setBlue(nextBlue);
		document.documentElement.style.setProperty(
			"--fafa-color",
			fafaColor(nextBlue),
		);
		const url = new URL(window.location.href);
		url.searchParams.set("b", nextBlue.toString(16).padStart(2, "0"));
		window.history.replaceState({}, "", url);
		if (remember) setSpectrum(rememberColor(nextBlue));
	}, []);

	useEffect(() => {
		const timeout = window.setTimeout(
			() => setIntroColor(null),
			reducedMotion ? 0 : 1500,
		);
		let raf = 0;
		let previousFrame = performance.now();
		let frames = 0;
		let fpsTime = previousFrame;

		const paint = (time: number) => {
			const maxScroll = Math.max(
				1,
				document.documentElement.scrollHeight - window.innerHeight,
			);
			const nextProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
			const baseBlue = progressToBlue(nextProgress);
			if (Math.abs(nextProgress - latest.current.progress) > 0.00001) {
				latest.current.manual = null;
			}
			const nextBlue = latest.current.manual ?? baseBlue;
			latest.current.blue = nextBlue;
			latest.current.progress = nextProgress;
			document.documentElement.style.setProperty(
				"--fafa-color",
				fafaColor(nextBlue),
			);
			document.documentElement.style.setProperty(
				"--ink-opacity",
				String(0.88 - nextProgress * 0.35),
			);

			if (time - lastRender.current > 80) {
				setBlue(nextBlue);
				setProgress(nextProgress);
				lastRender.current = time;
			}
			frames += 1;
			if (time - fpsTime > 1000) {
				setFps(Math.round((frames * 1000) / (time - fpsTime)));
				frames = 0;
				fpsTime = time;
			}
			previousFrame = time;
			void previousFrame;
			raf = requestAnimationFrame(paint);
		};

		raf = requestAnimationFrame(paint);
		return () => {
			window.clearTimeout(timeout);
			cancelAnimationFrame(raf);
		};
	}, [reducedMotion]);

	const copyCurrent = async () => {
		choose(blue);
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopied(true);
			window.clearTimeout(copyTimer.current);
			copyTimer.current = window.setTimeout(() => setCopied(false), 1400);
		} catch {
			setCopied(true);
		}
	};

	const [title, line] = storyFor(blue);
	const possibilities = 256 - blue;

	return (
		<main className="artwork">
			<div className="atmosphere" aria-hidden="true" />
			{introColor !== null && (
				<div className="shared-opening" aria-live="polite">
					<span>{fafaHex(introColor)}</span>
				</div>
			)}
			<div className="grain" aria-hidden="true" />

			<div
				className="canvas"
				aria-label="FAFA，一件可滚动的数字色彩作品"
			>
				<section className="scene scene--intro" aria-label="FAFA">
					<div className="scene__center intro-type">
						<h1>FAFA</h1>
						<p>一个名字的 256 种明暗</p>
					</div>
					<div className="intro-hex" aria-hidden="true">
						#FAFA<span>00</span>
					</div>
				</section>

				<section
					className="scene scene--missing"
					aria-label="未定义的颜色通道"
				>
					<div className="scene__center missing-type">
						<p className="broken-hex">
							#FAFA<span>??</span>
						</p>
						<p className="microcopy">少了些什么。</p>
						<p className="rapid-count" aria-hidden="true">
							00&nbsp;&nbsp;01&nbsp;&nbsp;02&nbsp;&nbsp;03&nbsp;&nbsp;04&nbsp;&nbsp;...
						</p>
					</div>
				</section>

				<section className="scene scene--range" aria-label="颜色范围">
					<div className="range-display">
						<p className="range-note">{closestMoment(blue)} / {title}</p>
						<button
							className="hex-button"
							onClick={copyCurrent}
							aria-label={`复制 ${fafaHex(blue)} 的链接`}
						>
							<Counter blue={blue} />
						</button>
						<p className="range-statement">
							{line}。
							<br />
							FAFA 不是一种颜色，而是一段范围。
						</p>
						{copied && <p className="lock-note">链接已复制</p>}
					</div>
					<p className="scroll-mark">
						{Math.round(progress * 100)}%&nbsp;&nbsp; / &nbsp;&nbsp;
						{blueToLabel(blue)}
					</p>
				</section>

				<section
					className="scene scene--field"
					aria-label="完整色场"
				>
					<ColorField activeBlue={blue} onPick={choose} />
				</section>

				<section
					className="scene scene--deconstruct"
					aria-label="颜色与记忆"
				>
					<div className="scene__center color-story">
						<p className="story-kicker">{fafaHex(blue)} / {title}</p>
						<h2>{line}。</h2>
						<Spectrum colors={spectrum} onPick={choose} />
					</div>
				</section>

				<section
					className="scene scene--possibilities"
					aria-label="256 种可能"
				>
					<div className="scene__center possible-type">
						<strong>{possibilities}</strong>
						<p>种颜色的可能</p>
					</div>
				</section>

				<section
					className="scene scene--ending"
					aria-label="颜色范围的尽头"
				>
					<div className="scene__center ending-type">
						<h2>FAFA</h2>
						<p>FAFA 从来不止一种颜色。</p>
						<small>我们也是。</small>
					</div>
					<p className="ending-index">
						{fafaHex(blue)}
						<br />
						FF / 尽头
					</p>
				</section>
			</div>
			{debug && (
				<DebugPanel
					progress={progress}
					blue={blue}
					fps={fps}
					scene={sceneFor(progress)}
				/>
			)}
		</main>
	);
}

function blueToLabel(blue: number): string {
	return `#FAFA${blue.toString(16).padStart(2, "0").toUpperCase()}`;
}
