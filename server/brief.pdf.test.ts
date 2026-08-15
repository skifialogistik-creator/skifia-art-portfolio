import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { jsPDF } from "jspdf";

describe("brief PDF", () => {
  it("creates a PDF with a Cyrillic-capable font", async () => {
    const font = await readFile("/home/ubuntu/webdev-static-assets/NotoSans-Regular.ttf");
    const document = new jsPDF({ unit: "mm", format: "a4" });

    document.addFileToVFS("NotoSans-Regular.ttf", font.toString("base64"));
    document.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
    document.setFont("NotoSans");
    document.text("Бриф на разработку сайта", 20, 20);

    const output = new Uint8Array(document.output("arraybuffer"));
    expect(new TextDecoder().decode(output.slice(0, 4))).toBe("%PDF");
    expect(output.byteLength).toBeGreaterThan(10_000);
  });
});
