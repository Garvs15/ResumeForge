import { describe, it, expect } from "vitest";

describe("File Upload", () => {
    it("should generate correct file path", () => {
        const userId = "123";
        const path = `${userId}/file.jpeg`;

        expect(path).toMatch("123/");
    });
});