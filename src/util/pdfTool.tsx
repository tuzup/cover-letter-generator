import { showToast } from "@raycast/api";

const PDFDocument = require('pdfkit');
const fs = require('fs');

export async function generatePDF(coverLetter: string, outputPath: string): Promise<void> {
    const doc = new PDFDocument();

    const writeStream = fs.createWriteStream(outputPath);

    // Pipe the PDF document to the file
    doc.pipe(writeStream);

    doc
        .fontSize(12)
        .text(coverLetter);


    // Finalize the PDF and save it
    doc.end();

    writeStream.on('finish', () => {
        console.log(`PDF created successfully at: ${outputPath}`);
    });
}

export function toCamelCase(str: string): string {
    return str
        .split(" ")                          // Split the string by spaces
        .map((word, index) => {
            if (index === 0) {
                return word.toLowerCase();       // Keep the first word lowercase
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); // Capitalize the first letter of subsequent words
        })
        .join("");                           // Join the array back into a string
}