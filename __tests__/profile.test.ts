import { describe, it, expect } from "vitest";

describe("Profile Update Logic", () => {
    it("should merge profile fields correctly", () => {
        const current = {
            first_name: 'Garv',
            skills: ['React'],
        };

        const update = {
            skills: ["Node.js"],
        };

        const result = {
            ...current,
            skills: [...current.skills, ...update.skills],
        };

        expect(result.skills).toContain("Node.js");
    });
});
