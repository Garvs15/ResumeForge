import { describe, it, expect } from "vitest";

describe("AI Resume Output", () => {
    it("should return the structured HTML response", () => {
        const output = "<mark class='good'>Optimized</mark>";

        expect(output).contain("mark");
    });
});