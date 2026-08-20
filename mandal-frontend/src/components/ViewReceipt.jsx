import React from "react";
import "./ViewReceipt.css";

function ViewReceipt({ donor, onBack }) {

    const handlePrint = () => {
        window.print();
    };

    // If donor data is not available
    if (!donor) {
        return (
            <div className="vr-error-page">

                <div className="vr-error">

                    <div className="vr-error-icon">
                        ⚠️
                    </div>

                    <h2>
                        पावती सापडली नाही
                    </h2>

                    <p>
                        देणगीदाराची माहिती उपलब्ध नाही.
                    </p>

                    <button
                        className="vr-back-btn"
                        onClick={onBack}
                    >
                        ← Back to Admin
                    </button>

                </div>

            </div>
        );
    }

    // =========================
    // SAFE VALUES
    // =========================

    const donorName = donor.donorName || "N/A";

    const mobileNumber = donor.mobileNumber || "N/A";

    const event = donor.event || "Collection";

    const receiptId = donor.receiptId || "N/A";

    const amount = Number(donor.amount) || 0;


    // =========================
    // DATE
    // =========================

    const donorDate = donor.date
        ? new Date(donor.date)
        : null;


    const formattedDate =
        donorDate &&
        !isNaN(donorDate.getTime())
            ? donorDate.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
              })
            : "N/A";


    // =========================
    // TIME
    // =========================

    const formattedTime =
        donorDate &&
        !isNaN(donorDate.getTime())
            ? donorDate.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
              })
            : "N/A";


    return (

        <div className="vr-page">

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="vr-main">


                {/* =================================================
                    ACTION BUTTONS
                ================================================= */}

                <div className="vr-actions no-print">

                    <button
                        className="vr-back-btn"
                        onClick={onBack}
                    >
                        ← Back to Admin
                    </button>


                    <button
                        className="vr-print-btn"
                        onClick={handlePrint}
                    >
                        🖨️ पावती छापा
                    </button>

                </div>


                {/* =================================================
                    RECEIPT CARD
                ================================================= */}

                <div className="vr-card">


                    {/* =================================================
                        TOP BORDER
                    ================================================= */}

                    <div className="vr-top-border"></div>


                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="vr-header">

                        <div className="vr-logo">
                            <img
                                src="/logo.jpeg"
                                alt="Jai Hind Mitra Mandal Logo"
                            />
                        </div>


                        <div className="vr-header-info">

                            <h1>
                                जय हिंद मित्र मंडळ
                            </h1>

                            <p className="vr-location">
                                अजंदे
                            </p>

                            {/* <p className="vr-org">
                                Collection &amp; Charitable Organization
                            </p> */}

                        </div>

                    </div>


                    {/* =================================================
                        EVENT
                    ================================================= */}

                    <div className="vr-event">

                        <span className="vr-event-icon">
                            🎯
                        </span>

                        <span>
                            {event} देणगी पावती
                        </span>

                    </div>


                    {/* =================================================
                        RECEIPT ID
                    ================================================= */}

                    <div className="vr-receipt-id">

                        <span className="vr-receipt-id-label">
                            पावती क्रमांक
                        </span>

                        <strong>
                            {receiptId}
                        </strong>

                    </div>


                    <div className="vr-divider"></div>


                    {/* =================================================
                        DONOR INFORMATION
                    ================================================= */}

                    <section className="vr-donor-section">

                        <h2 className="vr-section-title">

                            <span>
                                📋
                            </span>

                            देणगीदाराची माहिती

                        </h2>


                        <div className="vr-donor-grid">


                            {/* NAME */}

                            <div className="vr-donor-row">

                                <div className="vr-donor-label">

                                    <span>
                                        👤
                                    </span>

                                    देणगीदाराचे नाव

                                </div>


                                <div className="vr-donor-value">

                                    {donorName}

                                </div>

                            </div>


                            {/* MOBILE */}

                            <div className="vr-donor-row">

                                <div className="vr-donor-label">

                                    <span>
                                        📱
                                    </span>

                                    मोबाईल क्रमांक

                                </div>


                                <div className="vr-donor-value">

                                    {mobileNumber}

                                </div>

                            </div>


                            {/* DATE */}

                            <div className="vr-donor-row">

                                <div className="vr-donor-label">

                                    <span>
                                        📅
                                    </span>

                                    दिनांक

                                </div>


                                <div className="vr-donor-value">

                                    {formattedDate}

                                </div>

                            </div>


                            {/* TIME */}

                            <div className="vr-donor-row">

                                <div className="vr-donor-label">

                                    <span>
                                        ⏰
                                    </span>

                                    वेळ

                                </div>


                                <div className="vr-donor-value">

                                    {formattedTime}

                                </div>

                            </div>

                        </div>

                    </section>


                    <div className="vr-divider"></div>


                    {/* =================================================
                        AMOUNT
                    ================================================= */}

                    <section className="vr-amount-section">

                        <div className="vr-amount-title">

                            <span>
                                💰
                            </span>

                            योगदान दिलेली रक्कम

                        </div>


                        <div className="vr-amount-box">

                            <div className="vr-amount">

                                ₹{amount.toLocaleString("en-IN")}

                            </div>


                            <div className="vr-amount-words">

                                {getAmountInWords(amount)}

                            </div>

                        </div>

                    </section>


                    <div className="vr-divider"></div>


                    {/* =================================================
                        THANK YOU
                    ================================================= */}

                    <section className="vr-thank-you">

                        <div className="vr-thank-you-icon">

                            <img
                                src="/logo.jpeg"
                                alt="Jai Hind Mitra Mandal Logo"
                            />

                        </div>


                        <h2>
                           धन्यवाद!
                        </h2>


                        <p className="vr-thank-you-main">
                            तुमच्या उदार योगदानाबद्दल धन्यवाद.
                        </p>

                    </section>


                    <div className="vr-divider"></div>


                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <footer className="vr-footer">


                        <div className="vr-footer-main">

                            <h3>
                                 जय हिंद मित्र मंडळ
                            </h3>

                            <p>
                                अजंदे
                            </p>

                        </div>


                        <div className="vr-footer-notes">

                            <p>
                                 ही अधिकृत पावती आहे.
                            </p>

                            <p>
                                ✓ कृपया आपल्या नोंदीसाठी जपून ठेवा.
                            </p>

                            <p>
                               ✓ तुमच्या पाठिंब्याबद्दल धन्यवाद
                            </p>

                        </div>


                        <div className="vr-footer-seal">

                            ✨ Authorized Receipt ✨

                        </div>

                    </footer>


                    {/* =================================================
                        BOTTOM BORDER
                    ================================================= */}

                    <div className="vr-bottom-border"></div>

                </div>

            </main>

        </div>
    );
}


/* =========================================================
   AMOUNT TO WORDS
========================================================= */

function getAmountInWords(amount) {

    const ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
    ];


    const teens = [
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
    ];


    const tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety",
    ];


    function convertBelowThousand(num) {

        if (num === 0) {
            return "";
        }


        if (num < 10) {
            return ones[num];
        }


        if (num < 20) {
            return teens[num - 10];
        }


        if (num < 100) {

            return (
                tens[Math.floor(num / 10)] +
                (
                    num % 10 !== 0
                        ? " " + ones[num % 10]
                        : ""
                )
            );
        }


        return (
            ones[Math.floor(num / 100)] +
            " Hundred" +
            (
                num % 100 !== 0
                    ? " " +
                      convertBelowThousand(num % 100)
                    : ""
            )
        );
    }


    function convertIndianNumber(num) {

        if (num === 0) {
            return "Zero";
        }


        let result = "";


        // =========================
        // CRORE
        // =========================

        if (num >= 10000000) {

            result +=
                convertIndianNumber(
                    Math.floor(num / 10000000)
                ) +
                " Crore ";

            num %= 10000000;
        }


        // =========================
        // LAKH
        // =========================

        if (num >= 100000) {

            result +=
                convertBelowThousand(
                    Math.floor(num / 100000)
                ) +
                " Lakh ";

            num %= 100000;
        }


        // =========================
        // THOUSAND
        // =========================

        if (num >= 1000) {

            result +=
                convertBelowThousand(
                    Math.floor(num / 1000)
                ) +
                " Thousand ";

            num %= 1000;
        }


        // =========================
        // REMAINING
        // =========================

        if (num > 0) {

            result += convertBelowThousand(num);

        }


        return result.trim();
    }


    const numericAmount =
        Math.floor(Number(amount) || 0);


    return (
        convertIndianNumber(numericAmount) +
        " Rupees Only"
    );
}


export default ViewReceipt;