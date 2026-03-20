import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { environment } from "@raycast/api";

export function toCamelCase(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

export async function generatePDF(content: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);

      // Path to the bundled font in assets/fonts
      const fontPath = path.join(environment.assetsPath, "fonts", "Roboto-Regular.ttf");

      doc.pipe(stream);

      // Register and use the font before adding text
      if (fs.existsSync(fontPath)) {
        doc.font(fontPath);
      } else {
        reject(new Error(`Font not found at path: ${fontPath}`));
        return;
      }

      doc.fontSize(12).text(content, {
        align: "left",
      });
      doc.end();

      stream.on("finish", () => {
        resolve();
      });

      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}
