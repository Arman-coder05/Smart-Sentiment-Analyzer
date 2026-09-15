const PDFDocument = require("pdfkit");

/*
|--------------------------------------------------------------------------
| Utility Functions
|--------------------------------------------------------------------------
*/

function safe(value, fallback = "N/A") {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return fallback;
    }

    return value;
}

/*
|--------------------------------------------------------------------------
| Model Name Helper
|--------------------------------------------------------------------------
|
| Mongoose documents can expose a `model()` function.
| If analysis.model is accessed incorrectly, PDFKit may print
| the entire function instead of the actual model name.
|
*/

function firstString(...values) {
    for (const value of values) {

        if (
            typeof value === "string" &&
            value.trim()
        ) {
            return value.trim();
        }

        if (
            value &&
            typeof value === "object" &&
            typeof value.name === "string" &&
            value.name.trim()
        ) {
            return value.name.trim();
        }
    }

    return null;
}


function getModelName(analysis) {

    const source =
        analysis && analysis._doc
            ? {
                ...analysis._doc,
                ...analysis
            }
            : analysis || {};

    const model = firstString(
        source.modelUsed,
        source.modelName,
        source.model_name,
        source.model
    );

    /*
    |--------------------------------------------------------------------------
    | Prevent Mongoose model() function from being printed
    |--------------------------------------------------------------------------
    */

    if (
        model &&
        !model.includes("function") &&
        !model.includes("$model")
    ) {
        return model.name;
    }

    return "Twitter-roBERTa";
}


function number(value, fallback = 0) {

    const parsed = Number(value);

    return Number.isFinite(parsed)
        ? parsed
        : fallback;
}


function percentage(value) {
    return `${number(value).toFixed(2)}%`;
}


function formatDate(date = new Date()) {

    return new Date(date).toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


function truncate(text, length = 120) {

    text = String(
        safe(text, "")
    );

    if (text.length <= length) {
        return text;
    }

    return text.substring(0, length) + "...";
}


/*
|--------------------------------------------------------------------------
| Sentiment Statistics
|--------------------------------------------------------------------------
*/

function calculateSentimentStats(analysis) {

    const counts =
        analysis.sentimentCounts ||
        analysis.counts ||
        {};

    const positive = number(
        counts.Positive ??
        counts.positive ??
        analysis.positive ??
        analysis.positiveCount
    );

    const neutral = number(
        counts.Neutral ??
        counts.neutral ??
        analysis.neutral ??
        analysis.neutralCount
    );

    const negative = number(
        counts.Negative ??
        counts.negative ??
        analysis.negative ??
        analysis.negativeCount
    );

    const total =
        positive +
        neutral +
        negative;

    return {
        positive,
        neutral,
        negative,
        total
    };
}


/*
|--------------------------------------------------------------------------
| Confidence Statistics
|--------------------------------------------------------------------------
*/

// -----------------------------------------
// CONFIDENCE STATISTICS
// -----------------------------------------


function calculateConfidenceStats(analysis) {

    const average = number(
        analysis.averageConfidence ??
        analysis.avgConfidence ??
        0
    );

    const confidenceValues = (analysis.results || [])
        .map(item => Number(item.confidence))
        .filter(value => Number.isFinite(value));

    const highest = confidenceValues.length > 0
        ? Math.max(...confidenceValues)
        : 0;

    const lowest = confidenceValues.length > 0
        ? Math.min(...confidenceValues)
        : 0;

    return {
        average,
        highest,
        lowest
    };
}


/*
|--------------------------------------------------------------------------
| Main PDF Generator
|--------------------------------------------------------------------------
*/

function generatePDFReport(analysis) {

    return new Promise((resolve, reject) => {

        try {

            /*
            |--------------------------------------------------------------------------
            | PDF Configuration
            |--------------------------------------------------------------------------
            */

            const doc = new PDFDocument({
                size: "A4",
                margins: {
                    top: 45,
                    bottom: 55,
                    left: 45,
                    right: 45
                },
                bufferPages: true,
                autoFirstPage: true
            });


            const chunks = [];


            doc.on(
                "data",
                chunk => {
                    chunks.push(chunk);
                }
            );


            doc.on(
                "end",
                () => {

                    const pdfBuffer =
                        Buffer.concat(chunks);

                    resolve(pdfBuffer);
                }
            );


            doc.on(
                "error",
                reject
            );


            /*
            |--------------------------------------------------------------------------
            | Colors
            |--------------------------------------------------------------------------
            */

            const colors = {

                blue: "#2563EB",

                darkBlue: "#0F172A",

                lightBlue: "#EFF6FF",

                green: "#16A34A",

                red: "#DC2626",

                yellow: "#CA8A04",

                gray: "#64748B",

                lightGray: "#E2E8F0",

                dark: "#1E293B",

                white: "#FFFFFF"
            };


            /*
            |--------------------------------------------------------------------------
            | Extract Analysis Information
            |--------------------------------------------------------------------------
            */

            const stats =
                calculateSentimentStats(
                    analysis
                );
            console.log("PDF ANALYSIS OBJECT:", analysis);
            console.log("PDF CONFIDENCE STATS:", {
                average: analysis.averageConfidence,
                avg: analysis.avgConfidence,
                highest: analysis.highestConfidence,
                lowest: analysis.lowestConfidence
            });

            const confidence =
                calculateConfidenceStats(
                    analysis
                );


            const results =
                Array.isArray(
                    analysis.results
                )
                    ? analysis.results
                    : [];


            const totalRows =
                number(
                    analysis.totalRows ??
                    analysis.total ??
                    results.length
                );


            const analyzedRows =
                number(
                    analysis.analyzedRows ??
                    analysis.analyzed ??
                    results.length
                );


            const fileName =
                safe(
                    analysis.fileName ??
                    analysis.filename,
                    "Dataset"
                );


            const modelName =
                getModelName(
                    analysis
                );


            /*
            |--------------------------------------------------------------------------
            | Helper Functions
            |--------------------------------------------------------------------------
            */

            function addPageHeader(title = "TaxSentiment") {

                doc
                    .font("Helvetica-Bold")
                    .fontSize(9)
                    .fillColor(colors.gray)
                    .text(
                        title,
                        45,
                        25,
                        {
                            width: 505,
                            align: "left",
                            lineBreak: false
                        }
                    );

                doc
                    .moveTo(45, 38)
                    .lineTo(
                        doc.page.width - 45,
                        38
                    )
                    .strokeColor(
                        colors.lightGray
                    )
                    .stroke();
            }


            function sectionHeading(text) {

                /*
                |--------------------------------------------------------------------------
                | Keep heading away from footer
                |--------------------------------------------------------------------------
                */

                if (doc.y > 735) {
                    doc.addPage();
                    addPageHeader();
                }

                doc
                    .moveDown(0.8)
                    .fontSize(15)
                    .fillColor(colors.blue)
                    .font("Helvetica-Bold")
                    .text(text, 45);

                doc.moveDown(0.4);
            }


            function drawMetric(
                x,
                y,
                width,
                title,
                value,
                valueColor = colors.dark
            ) {

                doc
                    .roundedRect(
                        x,
                        y,
                        width,
                        70,
                        6
                    )
                    .fillAndStroke(
                        colors.lightBlue,
                        colors.lightGray
                    );


                doc
                    .font("Helvetica")
                    .fontSize(8)
                    .fillColor(colors.gray)
                    .text(
                        title,
                        x + 10,
                        y + 12,
                        {
                            width: width - 20
                        }
                    );


                doc
                    .font("Helvetica-Bold")
                    .fontSize(16)
                    .fillColor(valueColor)
                    .text(
                        value,
                        x + 10,
                        y + 32,
                        {
                            width: width - 20
                        }
                    );
            }


            function drawProgressBar(
                label,
                value,
                color
            ) {

                const x = 45;
                const width = 505;
                const height = 14;

                doc
                    .font("Helvetica-Bold")
                    .fontSize(9)
                    .fillColor(colors.dark)
                    .text(label, x);

                doc.moveDown(0.25);

                doc
                    .roundedRect(
                        x,
                        doc.y,
                        width,
                        height,
                        5
                    )
                    .fill(colors.lightGray);

                const progressWidth =
                    Math.max(
                        0,
                        Math.min(
                            width,
                            width * (
                                number(value) / 100
                            )
                        )
                    );

                doc
                    .roundedRect(
                        x,
                        doc.y,
                        progressWidth,
                        height,
                        5
                    )
                    .fill(color);

                doc.moveDown(1);
            }


            /*
            |--------------------------------------------------------------------------
            | PAGE 1 — COVER
            |--------------------------------------------------------------------------
            */

            doc
                .fillColor(colors.darkBlue)
                .font("Helvetica-Bold")
                .fontSize(28)
                .text(
                    "TaxSentiment",
                    45,
                    150,
                    {
                        align: "center",
                        width: 505
                    }
                );


            doc
                .font("Helvetica")
                .fontSize(14)
                .fillColor(colors.gray)
                .text(
                    "Public Sentiment Analysis Report",
                    {
                        align: "center"
                    }
                );


            doc.moveDown(2);


            doc
                .font("Helvetica-Bold")
                .fontSize(17)
                .fillColor(colors.dark)
                .text(
                    "Budgetary Tax Reforms",
                    {
                        align: "center"
                    }
                );


            doc.moveDown(1.5);


            doc
                .font("Helvetica")
                .fontSize(10)
                .fillColor(colors.gray)
                .text(
                    `Dataset: ${fileName}`,
                    {
                        align: "center"
                    }
                );


            doc
                .text(
                    `Generated: ${formatDate()}`,
                    {
                        align: "center"
                    }
                );


            doc
                .text(
                    `Model: ${modelName}`,
                    {
                        align: "center"
                    }
                );


            /*
            |--------------------------------------------------------------------------
            | PAGE 2 — EXECUTIVE SUMMARY
            |--------------------------------------------------------------------------
            */

            doc.addPage();

            addPageHeader(
                "TaxSentiment • Executive Summary"
            );


            sectionHeading(
                "Executive Summary"
            );


            doc
                .font("Helvetica")
                .fontSize(10)
                .fillColor(colors.dark)
                .text(
                    `This report presents an automated sentiment analysis of public reactions related to budgetary tax reforms. The analysis uses the ${modelName} model to classify comments into positive, neutral and negative categories.`,
                    {
                        width: 505,
                        lineGap: 3,
                        align: "justify"
                    }
                );


            doc.moveDown(1);


            /*
            |--------------------------------------------------------------------------
            | Key Metrics
            |--------------------------------------------------------------------------
            */

            sectionHeading(
                "Key Metrics"
            );


            const metricWidth = 118;

            const metricGap = 9;

            const metricY = doc.y;


            drawMetric(
                45,
                metricY,
                metricWidth,
                "Total Rows",
                totalRows
            );


            drawMetric(
                45 + metricWidth + metricGap,
                metricY,
                metricWidth,
                "Analyzed",
                analyzedRows
            );


            drawMetric(
                45 + (
                    metricWidth +
                    metricGap
                ) * 2,
                metricY,
                metricWidth,
                "Positive",
                stats.positive,
                colors.green
            );


            drawMetric(
                45 + (
                    metricWidth +
                    metricGap
                ) * 3,
                metricY,
                metricWidth,
                "Neutral",
                stats.neutral,
                colors.blue
            );


            doc.moveDown(5);


            const metricY2 = doc.y;


            drawMetric(
                45,
                metricY2,
                metricWidth,
                "Negative",
                stats.negative,
                colors.red
            );


            drawMetric(
                45 + metricWidth + metricGap,
                metricY2,
                metricWidth,
                "Avg. Confidence",
                percentage(
                    confidence.average
                )
            );


            drawMetric(
                45 + (
                    metricWidth +
                    metricGap
                ) * 2,
                metricY2,
                metricWidth,
                "Highest Confidence",
                percentage(
                    confidence.highest
                ),
                colors.green
            );


            drawMetric(
                45 + (
                    metricWidth +
                    metricGap
                ) * 3,
                metricY2,
                metricWidth,
                "Lowest Confidence",
                percentage(
                    confidence.lowest
                ),
                colors.red
            );


            /*
            |--------------------------------------------------------------------------
            | Sentiment Distribution
            |--------------------------------------------------------------------------
            */

            doc.moveDown(5);

            sectionHeading(
                "Sentiment Distribution"
            );


            const sentimentTotal =
                stats.total || analyzedRows || 1;


            const positivePercentage =
                (
                    stats.positive /
                    sentimentTotal
                ) * 100;


            const neutralPercentage =
                (
                    stats.neutral /
                    sentimentTotal
                ) * 100;


            const negativePercentage =
                (
                    stats.negative /
                    sentimentTotal
                ) * 100;


            drawProgressBar(
                "Positive",
                positivePercentage,
                colors.green
            );


            drawProgressBar(
                "Neutral",
                neutralPercentage,
                colors.blue
            );


            drawProgressBar(
                "Negative",
                negativePercentage,
                colors.red
            );


            /*
            |--------------------------------------------------------------------------
            | PAGE 3 — CONFIDENCE ANALYSIS
            |--------------------------------------------------------------------------
            */

            doc.addPage();

            addPageHeader(
                "TaxSentiment • Confidence Analysis"
            );


            sectionHeading(
                "Confidence Analysis"
            );


            doc
                .font("Helvetica")
                .fontSize(10)
                .fillColor(colors.dark)
                .text(
                    "Confidence represents how strongly the sentiment model supports its predicted classification.",
                    {
                        width: 505,
                        lineGap: 3
                    }
                );


            doc.moveDown(1);


            drawMetric(
                45,
                doc.y,
                155,
                "Average Confidence",
                percentage(
                    confidence.average
                )
            );


            drawMetric(
                220,
                doc.y,
                155,
                "Highest Confidence",
                percentage(
                    confidence.highest
                ),
                colors.green
            );


            drawMetric(
                395,
                doc.y,
                155,
                "Lowest Confidence",
                percentage(
                    confidence.lowest
                ),
                colors.red
            );


            doc.moveDown(5);


            sectionHeading(
                "Confidence Interpretation"
            );


            doc
                .font("Helvetica")
                .fontSize(10)
                .fillColor(colors.dark)
                .text(
                    `The average confidence across the analyzed comments is ${percentage(confidence.average)}. The highest observed confidence is ${percentage(confidence.highest)}, while the lowest observed confidence is ${percentage(confidence.lowest)}.`,
                    {
                        width: 505,
                        lineGap: 4,
                        align: "justify"
                    }
                );


            doc.moveDown(1);


            /*
            |--------------------------------------------------------------------------
            | PAGE 4 — DATASET COVERAGE
            |--------------------------------------------------------------------------
            */

            doc.addPage();

            addPageHeader(
                "TaxSentiment • Dataset Coverage"
            );


            sectionHeading(
                "Dataset Coverage"
            );


            doc
                .font("Helvetica")
                .fontSize(10)
                .fillColor(colors.dark)
                .text(
                    `The uploaded dataset contains ${totalRows} rows. This analysis run processed ${analyzedRows} rows.`,
                    {
                        width: 505,
                        lineGap: 4
                    }
                );


            doc.moveDown(1);


            const coverage =
                totalRows > 0
                    ? (
                        analyzedRows /
                        totalRows
                    ) * 100
                    : 0;


            drawProgressBar(
                "Analyzed Dataset Coverage",
                coverage,
                colors.blue
            );


            if (totalRows > analyzedRows) {

                doc
                    .font("Helvetica")
                    .fontSize(9)
                    .fillColor(colors.yellow)
                    .text(
                        `Note: ${totalRows - analyzedRows} rows were not included in this analysis run.`,
                        {
                            width: 505,
                            lineGap: 3
                        }
                    );
            }


            /*
            |--------------------------------------------------------------------------
            | PAGE 5 — MODEL & METHODOLOGY
            |--------------------------------------------------------------------------
            */

            doc.addPage();

            addPageHeader(
                "TaxSentiment • Methodology"
            );


            sectionHeading(
                "Model & Methodology"
            );


            doc
                .font("Helvetica-Bold")
                .fontSize(10)
                .fillColor(colors.dark)
                .text(
                    "Model Used"
                );


            doc
                .font("Helvetica")
                .fontSize(10)
                .fillColor(colors.gray)
                .text(
                    modelName,
                    {
                        width: 505,
                        lineGap: 3
                    }
                );


            doc.moveDown(1);


            doc
                .font("Helvetica-Bold")
                .fontSize(10)
                .fillColor(colors.dark)
                .text(
                    "Classification"
                );


            doc
                .font("Helvetica")
                .fontSize(10)
                .fillColor(colors.gray)
                .text(
                    "Each comment is assigned one of three sentiment categories: Positive, Neutral or Negative.",
                    {
                        width: 505,
                        lineGap: 3
                    }
                );


            doc.moveDown(1);


            doc
                .font("Helvetica-Bold")
                .fontSize(10)
                .fillColor(colors.dark)
                .text(
                    "Processing"
                );


            doc
                .font("Helvetica")
                .fontSize(10)
                .fillColor(colors.gray)
                .text(
                    "The uploaded dataset is processed by the backend sentiment-analysis service. The resulting classifications and confidence values are then stored and presented through the TaxSentiment dashboard.",
                    {
                        width: 505,
                        lineGap: 3,
                        align: "justify"
                    }
                );


            /*
            |--------------------------------------------------------------------------
            | PAGE 6 — INTERPRETATION
            |--------------------------------------------------------------------------
            */

            doc.addPage();

            addPageHeader(
                "TaxSentiment • Interpretation"
            );


            sectionHeading(
                "Interpretation of Results"
            );


            let dominantSentiment =
                "Neutral";


            let dominantCount =
                stats.neutral;


            if (
                stats.positive >
                dominantCount
            ) {

                dominantSentiment =
                    "Positive";

                dominantCount =
                    stats.positive;
            }


            if (
                stats.negative >
                dominantCount
            ) {

                dominantSentiment =
                    "Negative";

                dominantCount =
                    stats.negative;
            }


            doc
                .font("Helvetica")
                .fontSize(10)
                .fillColor(colors.dark)
                .text(
                    `The dominant sentiment in the analyzed dataset is ${dominantSentiment}, with ${dominantCount} comments classified in this category.`,
                    {
                        width: 505,
                        lineGap: 4,
                        align: "justify"
                    }
                );


            doc.moveDown(1);


            doc
                .text(
                    `Positive sentiment represents ${percentage(positivePercentage)} of the analyzed comments, neutral sentiment represents ${percentage(neutralPercentage)}, and negative sentiment represents ${percentage(negativePercentage)}.`,
                    {
                        width: 505,
                        lineGap: 4,
                        align: "justify"
                    }
                );


            /*
            |--------------------------------------------------------------------------
            | DETAILED RESULTS
            |--------------------------------------------------------------------------
            */

            doc.addPage();

            addPageHeader(
                "TaxSentiment • Detailed Results"
            );


            sectionHeading(
                "Detailed Analysis Results"
            );


            doc
                .font("Helvetica")
                .fontSize(9)
                .fillColor(colors.gray)
                .text(
                    `Showing up to ${Math.min(results.length, 100)} analyzed records.`,
                    {
                        width: 505
                    }
                );


            doc.moveDown(0.8);


            /*
            |--------------------------------------------------------------------------
            | Detailed Results
            |--------------------------------------------------------------------------
            |
            | IMPORTANT:
            | We estimate the height of each record before rendering.
            | This prevents a record from being split awkwardly across
            | two pages.
            |
            */

            results
                .slice(0, 100)
                .forEach(
                    (item, index) => {

                        const comment =
                            item.comment ??
                            item.text ??
                            item.content ??
                            item.Comment ??
                            "N/A";


                        const sentiment =
                            item.sentiment ??
                            item.Sentiment ??
                            "N/A";


                        const itemConfidence =
                            item.confidence ??
                            item.Confidence ??
                            item.score;


                        const recordWidth =
                            505;


                        const commentText =
                            `Comment: ${truncate(
                                comment,
                                300
                            )}`;


                        const sentimentText =
                            `Sentiment: ${safe(
                                sentiment
                            )}`;


                        const confidenceText =
                            itemConfidence !==
                                undefined &&
                                itemConfidence !==
                                null
                                ? `Confidence: ${percentage(
                                    itemConfidence
                                )}`
                                : null;


                        /*
                        |--------------------------------------------------------------------------
                        | Estimate required height
                        |--------------------------------------------------------------------------
                        */

                        let requiredHeight =
                            doc.heightOfString(
                                `Record ${index + 1}`,
                                {
                                    width:
                                        recordWidth,
                                    font:
                                        "Helvetica-Bold",
                                    fontSize:
                                        8.5
                                }
                            );


                        requiredHeight +=
                            doc.heightOfString(
                                commentText,
                                {
                                    width:
                                        recordWidth,
                                    font:
                                        "Helvetica",
                                    fontSize:
                                        8.5,
                                    lineGap:
                                        1
                                }
                            );


                        requiredHeight +=
                            doc.heightOfString(
                                sentimentText,
                                {
                                    width:
                                        recordWidth,
                                    font:
                                        "Helvetica",
                                    fontSize:
                                        8.5
                                }
                            );


                        if (
                            confidenceText
                        ) {

                            requiredHeight +=
                                doc.heightOfString(
                                    confidenceText,
                                    {
                                        width:
                                            recordWidth,
                                        font:
                                            "Helvetica",
                                        fontSize:
                                            8.5
                                    }
                                );
                        }


                        requiredHeight += 20;


                        /*
                        |--------------------------------------------------------------------------
                        | Check page space
                        |--------------------------------------------------------------------------
                        */

                        const contentBottom =
                            doc.page.height -
                            65;


                        if (
                            doc.y +
                            requiredHeight >
                            contentBottom
                        ) {

                            doc.addPage();


                            addPageHeader(
                                "TaxSentiment • Detailed Results (continued)"
                            );


                            doc
                                .moveDown(0.7);


                            doc
                                .font("Helvetica-Bold")
                                .fontSize(15)
                                .fillColor(
                                    colors.blue
                                )
                                .text(
                                    "Detailed Analysis Results (continued)"
                                );


                            doc.moveDown(0.7);
                        }


                        /*
                        |--------------------------------------------------------------------------
                        | Record Header
                        |--------------------------------------------------------------------------
                        */

                        doc
                            .font("Helvetica-Bold")
                            .fontSize(8.5)
                            .fillColor(colors.dark)
                            .text(
                                `Record ${index + 1}`
                            );


                        /*
                        |--------------------------------------------------------------------------
                        | Comment
                        |--------------------------------------------------------------------------
                        */

                        doc
                            .font("Helvetica")
                            .fontSize(8.5)
                            .fillColor(colors.gray)
                            .text(
                                commentText,
                                {
                                    width:
                                        recordWidth,
                                    lineGap:
                                        1
                                }
                            );


                        /*
                        |--------------------------------------------------------------------------
                        | Sentiment
                        |--------------------------------------------------------------------------
                        */

                        let sentimentColor =
                            colors.blue;


                        const sentimentLower =
                            String(
                                sentiment
                            )
                                .toLowerCase();


                        if (
                            sentimentLower
                                .includes(
                                    "positive"
                                )
                        ) {

                            sentimentColor =
                                colors.green;

                        } else if (
                            sentimentLower
                                .includes(
                                    "negative"
                                )
                        ) {

                            sentimentColor =
                                colors.red;
                        }


                        doc
                            .font("Helvetica-Bold")
                            .fontSize(8.5)
                            .fillColor(
                                sentimentColor
                            )
                            .text(
                                sentimentText
                            );


                        /*
                        |--------------------------------------------------------------------------
                        | Confidence
                        |--------------------------------------------------------------------------
                        */

                        if (
                            confidenceText
                        ) {

                            doc
                                .font("Helvetica")
                                .fontSize(8.5)
                                .fillColor(
                                    colors.gray
                                )
                                .text(
                                    confidenceText
                                );
                        }


                        doc.moveDown(0.5);


                        /*
                        |--------------------------------------------------------------------------
                        | Separator
                        |--------------------------------------------------------------------------
                        */

                        doc
                            .moveTo(
                                45,
                                doc.y
                            )
                            .lineTo(
                                doc.page.width -
                                45,
                                doc.y
                            )
                            .strokeColor(
                                colors.lightGray
                            )
                            .stroke();


                        doc.moveDown(0.5);
                    }
                );


            /*
            |--------------------------------------------------------------------------
            | LIMITATIONS
            |--------------------------------------------------------------------------
            */

            sectionHeading(
                "Limitations"
            );


            doc
                .font("Helvetica")
                .fontSize(9)
                .fillColor(colors.gray)
                .text(
                    "Automated sentiment analysis provides statistical insights into the dataset but should not be interpreted as a perfect representation of human opinion. Sarcasm, ambiguity, mixed opinions, context and domain-specific language may affect classification accuracy.",
                    {
                        width: 505,
                        lineGap: 3,
                        align: "justify"
                    }
                );


            /*
            |--------------------------------------------------------------------------
            | CONCLUSION
            |--------------------------------------------------------------------------
            */

            sectionHeading(
                "Conclusion"
            );


            doc
                .font("Helvetica")
                .fontSize(9)
                .fillColor(colors.dark)
                .text(
                    `The analysis processed ${analyzedRows} comments using the ${modelName} sentiment model. The resulting sentiment distribution, confidence statistics and individual classifications provide an overview of public reactions contained within the uploaded dataset.`,
                    {
                        width: 505,
                        lineGap: 3,
                        align: "justify"
                    }
                );


            /*
            |--------------------------------------------------------------------------
            | FOOTERS
            |--------------------------------------------------------------------------
            |
            | IMPORTANT:
            |
            | The previous implementation positioned the footer around
            | y = 805. With A4 + margins this could exceed the content
            | region and PDFKit could create another page.
            |
            | We now position it relative to the actual page height.
            |
            */

            const range =
                doc.bufferedPageRange();


            const totalPages =
                range.count;


            for (
                let i = range.start;
                i <
                range.start +
                totalPages;
                i++
            ) {

                doc.switchToPage(i);


                /*
                |--------------------------------------------------------------------------
                | Prevent PDFKit from auto-inserting a page for the footer
                |--------------------------------------------------------------------------
                |
                | doc.page.height - 30 sits below the printable area PDFKit
                | tracks (page.height - margins.bottom). Writing there — even
                | with explicit x/y — makes PDFKit think the content overflows
                | the page, so it silently appends a new page to hold it.
                | lineBreak: false does NOT stop this; it only disables word-
                | wrapping. Temporarily zeroing the bottom margin removes the
                | overflow check for this one draw call.
                |
                */

                const originalBottomMargin =
                    doc.page.margins.bottom;

                doc.page.margins.bottom = 0;


                doc
                    .save()
                    .font("Helvetica")
                    .fontSize(7.5)
                    .fillColor(colors.gray)
                    .text(
                        `TaxSentiment • Sentiment Analysis Report • Page ${i - range.start + 1} of ${totalPages}`,
                        45,
                        doc.page.height - 30,
                        {
                            align: "center",
                            width:
                                doc.page.width -
                                90,
                            lineBreak: false
                        }
                    )
                    .restore();


                doc.page.margins.bottom =
                    originalBottomMargin;
            }


            /*
            |--------------------------------------------------------------------------
            | Finish PDF
            |--------------------------------------------------------------------------
            */

            doc.end();

        } catch (error) {

            reject(error);
        }
    });
}


/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
    generatePDFReport
};