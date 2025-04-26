package com.versammlungsassistent.util;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;

public class PdfGenerator {

    public static byte[] generateResultsPdf(String meetingTitle, String resultsText) throws Exception {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
        Font bodyFont = new Font(Font.HELVETICA, 12);

        document.add(new Paragraph("Beschlussergebnisse", titleFont));
        document.add(new Paragraph("\n"));
        document.add(new Paragraph("Versammlung: " + meetingTitle, bodyFont));
        document.add(new Paragraph("\n"));
        document.add(new Paragraph(resultsText, bodyFont));

        document.close();
        return out.toByteArray();
    }
}
