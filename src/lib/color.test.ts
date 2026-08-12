import { describe, expect, it } from "vitest";
import { blueToHex, fafaColor, progressToBlue } from "./color";

describe("FAFA color channel", () => {
	it.each([
		[0, "#fafa00"],
		[1, "#fafa01"],
		[15, "#fafa0f"],
		[16, "#fafa10"],
		[128, "#fafa80"],
		[254, "#fafafe"],
		[255, "#fafaff"],
	])("maps %i to %s", (blue, color) => {
		expect(fafaColor(blue)).toBe(color);
	});

	it("keeps the channel in the valid discrete range", () => {
		expect(blueToHex(-3)).toBe("00");
		expect(blueToHex(300)).toBe("ff");
		expect(progressToBlue(0.532)).toBe(136);
	});
});
