import React, { useEffect, useState } from 'react';

function PublicDashboard() {
    const [event, setEvent] = useState('Kavad Yatra');
    const [collections, setCollections] = useState([]);
    const [expenses, setExpenses] = useState([]);

    const [summary, setSummary] = useState({
        totalCollections: 0,
        totalExpenses: 0,
        balance: 0
    });

    const [loading, setLoading] = useState(true);

    // English / Marathi
    const [language, setLanguage] = useState('mr');

    const API_URL = import.meta.env.VITE_API_URL;

    /* =====================================================
       TRANSLATIONS
    ===================================================== */

    const translations = {
        en: {
            live: 'Live Updates',
            currentEvent: 'Current Event',
            selectEvent: 'Select an event to view complete details',

            totalCollection: 'Total Collection',
            totalExpense: 'Total Expense',
            remaining: 'Remaining Balance',

            collected: 'Total amount collected',
            spent: 'Total amount spent',
            available: 'Amount currently available',

            collections: 'Collections',
            collectionDetails: 'Donation & collection details',

            expenses: 'Expenses',
            expenseDetails: 'Event expenditure details',

            donor: 'Donor',
            item: 'Item',
            amount: 'Amount',
            date: 'Date',

            records: 'Records',

            noCollections: 'No collections yet',
            noCollectionText:
                'Collection records for this event will appear here.',

            noExpenses: 'No expenses yet',
            noExpenseText:
                'Expense records for this event will appear here.',

            loadingCollections: 'Loading collections...',
            loadingExpenses: 'Loading expenses...',

            transparency: 'Transparency • Trust • Togetherness',

            events: {
                'Kavad Yatra': 'Kavad Yatra',
                'Ganpati Chanda': 'Ganpati Chanda',
                'Navratri Chanda': 'Navratri Chanda'
            }
        },

        mr: {
            live: 'थेट अपडेट',
            currentEvent: 'सध्याचा कार्यक्रम',
            selectEvent: 'संपूर्ण हिशोब पाहण्यासाठी कार्यक्रम निवडा',

            totalCollection: 'एकूण जमा',
            totalExpense: 'एकूण खर्च',
            remaining: 'शिल्लक रक्कम',

            collected: 'एकूण जमा झालेली रक्कम',
            spent: 'एकूण खर्च झालेली रक्कम',
            available: 'सध्या उपलब्ध रक्कम',

            collections: 'जमा रक्कम',
            collectionDetails: 'देणगी व जमा रकमेचा तपशील',

            expenses: 'खर्च',
            expenseDetails: 'कार्यक्रमातील खर्चाचा तपशील',

            donor: 'देणगीदार',
            item: 'खर्चाचा प्रकार',
            amount: 'रक्कम',
            date: 'दिनांक',

            records: 'नोंदी',

            noCollections: 'अजून कोणतीही जमा नोंद नाही',
            noCollectionText:
                'या कार्यक्रमाच्या जमा रकमेच्या नोंदी येथे दिसतील.',

            noExpenses: 'अजून कोणताही खर्च नाही',
            noExpenseText:
                'या कार्यक्रमाच्या खर्चाच्या नोंदी येथे दिसतील.',

            loadingCollections: 'जमा रक्कम लोड होत आहे...',
            loadingExpenses: 'खर्च लोड होत आहे...',

            transparency: 'पारदर्शकता • विश्वास • एकजूट',

            events: {
                'Kavad Yatra': 'कावड यात्रा',
                'Ganpati Chanda': 'गणपती वर्गणी',
                'Navratri Chanda': 'नवरात्री वर्गणी'
            }
        }
    };

    const t = translations[language];

    /* =====================================================
       FETCH DATA
    ===================================================== */

    const fetchData = async () => {
        try {
            const [collRes, expRes, sumRes] = await Promise.all([
                fetch(
                    `${API_URL}/api/collections?event=${encodeURIComponent(event)}`
                ),

                fetch(
                    `${API_URL}/api/expenses?event=${encodeURIComponent(event)}`
                ),

                fetch(
                    `${API_URL}/api/summary?event=${encodeURIComponent(event)}`
                )
            ]);

            const collectionsData = await collRes.json();
            const expensesData = await expRes.json();
            const summaryData = await sumRes.json();

            setCollections(
                Array.isArray(collectionsData)
                    ? collectionsData
                    : []
            );

            setExpenses(
                Array.isArray(expensesData)
                    ? expensesData
                    : []
            );

            setSummary({
                totalCollections:
                    Number(summaryData.totalCollections) || 0,

                totalExpenses:
                    Number(summaryData.totalExpenses) || 0,

                balance:
                    Number(summaryData.balance) || 0
            });

        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       LIVE UPDATE
    ===================================================== */

    useEffect(() => {
        setLoading(true);

        fetchData();

        const interval = setInterval(fetchData, 5000);

        return () => clearInterval(interval);
    }, [event]);

    /* =====================================================
       FORMAT CURRENCY
    ===================================================== */

    const formatAmount = (amount) => {
        return Number(amount || 0).toLocaleString('en-IN');
    };

    /* =====================================================
       FORMAT DATE
    ===================================================== */

    const formatDate = (date) => {
        if (!date) return '-';

        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <main className="public-dashboard">

            {/* =================================================
                LANGUAGE BAR
            ================================================= */}

            <div className="language-bar">

                <div className="language-info">
                    <span>🌐</span>
                    <span>
                        {language === 'mr'
                            ? 'भाषा निवडा'
                            : 'Choose Language'}
                    </span>
                </div>

                <div className="language-switch">

                    <button
                        className={language === 'mr' ? 'active' : ''}
                        onClick={() => setLanguage('mr')}
                    >
                        मराठी
                    </button>

                    <button
                        className={language === 'en' ? 'active' : ''}
                        onClick={() => setLanguage('en')}
                    >
                        English
                    </button>

                </div>

            </div>


            {/* =================================================
                HERO
            ================================================= */}

            <section className="public-hero">

                <div className="hero-content">

                    <div className="hero-logo-container">
                        <img
                            src="/logo.jpeg"
                            alt="Jai Hind Mitra Mandal"
                            className="hero-logo"
                        />
                    </div>

                    <div className="hero-text">

                        <div className="hero-tag">
                           🚩 जय हिंद मित्र मंडळ 🙏
                        </div>

                        <h2>
                            {language === 'mr'
                                ? 'सार्वजनिक हिशोब'
                                : 'Public Account'}
                        </h2>

                        <p>
                            {language === 'mr'
                                ? 'जमा आणि खर्चाचा पारदर्शक हिशोब'
                                : 'Transparent collection & expense details'}
                        </p>

                    </div>

                </div>

                <div className="live-status">
                    <span className="live-dot"></span>
                    <span>{t.live}</span>
                </div>

            </section>


            {/* =================================================
                EVENT SELECTOR
            ================================================= */}

            <section className="event-selector modern-event-selector">

                <div className="event-info">

                    <div className="event-icon">
                        🎉
                    </div>

                    <div>
                        <label htmlFor="event-select">
                            {t.currentEvent}
                        </label>

                        <p>
                            {t.selectEvent}
                        </p>
                    </div>

                </div>

                <select
                    id="event-select"
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                >

                    <option value="Kavad Yatra">
                        {t.events['Kavad Yatra']}
                    </option>

                    <option value="Ganpati Chanda">
                        {t.events['Ganpati Chanda']}
                    </option>

                    <option value="Navratri Chanda">
                        {t.events['Navratri Chanda']}
                    </option>

                </select>

            </section>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <section className="public-stats-grid">

                <div className="public-stat-card collection-card">

                    <div className="stat-icon-box">
                        💰
                    </div>

                    <div className="public-stat-content">

                        <span className="public-stat-label">
                            {t.totalCollection}
                        </span>

                        <h3>
                            ₹{formatAmount(summary.totalCollections)}
                        </h3>

                        <span className="stat-description">
                            {t.collected}
                        </span>

                    </div>

                </div>


                <div className="public-stat-card expense-card">

                    <div className="stat-icon-box">
                        🧾
                    </div>

                    <div className="public-stat-content">

                        <span className="public-stat-label">
                            {t.totalExpense}
                        </span>

                        <h3>
                            ₹{formatAmount(summary.totalExpenses)}
                        </h3>

                        <span className="stat-description">
                            {t.spent}
                        </span>

                    </div>

                </div>


                <div className="public-stat-card balance-card">

                    <div className="stat-icon-box">
                        💵
                    </div>

                    <div className="public-stat-content">

                        <span className="public-stat-label">
                            {t.remaining}
                        </span>

                        <h3>
                            ₹{formatAmount(summary.balance)}
                        </h3>

                        <span className="stat-description">
                            {t.available}
                        </span>

                    </div>

                </div>

            </section>


            {/* =================================================
                COLLECTIONS
            ================================================= */}

            <section className="table-section modern-table-section">

                <div className="table-heading">

                    <div className="table-title">

                        <div className="table-title-icon collection-icon">
                            💰
                        </div>

                        <div>
                            <h3>{t.collections}</h3>

                            <p>
                                {t.collectionDetails}
                            </p>
                        </div>

                    </div>

                    <span className="record-count">
                        {collections.length} {t.records}
                    </span>

                </div>


                <div className="table-wrapper">

                    <table>

                        <thead>
                            <tr>
                                <th>#</th>
                                <th>{t.donor}</th>
                                <th>{t.amount}</th>
                                <th>{t.date}</th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>
                                    <td
                                        colSpan="4"
                                        className="table-empty"
                                    >
                                        <div className="table-loader">
                                            <span></span>
                                            {t.loadingCollections}
                                        </div>
                                    </td>
                                </tr>

                            ) : collections.length > 0 ? (

                                collections.map((c, index) => (

                                    <tr key={c.id}>

                                        <td>
                                            <span className="row-number">
                                                {index + 1}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="person-cell">

                                                <span className="person-avatar">
                                                    {c.donorName
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || 'D'}
                                                </span>

                                                <span>
                                                    {c.donorName}
                                                </span>

                                            </div>
                                        </td>

                                        <td>
                                            <span className="collection-amount">
                                                + ₹{formatAmount(c.amount)}
                                            </span>
                                        </td>

                                        <td>
                                            {formatDate(c.date)}
                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>
                                    <td
                                        colSpan="4"
                                        className="table-empty"
                                    >

                                        <div className="empty-state">

                                            <span>📭</span>

                                            <strong>
                                                {t.noCollections}
                                            </strong>

                                            <p>
                                                {t.noCollectionText}
                                            </p>

                                        </div>

                                    </td>
                                </tr>
                            )}

                        </tbody>

                    </table>

                </div>

            </section>


            {/* =================================================
                EXPENSES
            ================================================= */}

            <section className="table-section modern-table-section">

                <div className="table-heading">

                    <div className="table-title">

                        <div className="table-title-icon expense-icon">
                            🧾
                        </div>

                        <div>
                            <h3>{t.expenses}</h3>

                            <p>
                                {t.expenseDetails}
                            </p>
                        </div>

                    </div>

                    <span className="record-count expense-record-count">
                        {expenses.length} {t.records}
                    </span>

                </div>


                <div className="table-wrapper">

                    <table>

                        <thead>

                            <tr>
                                <th>#</th>
                                <th>{t.item}</th>
                                <th>{t.amount}</th>
                                <th>{t.date}</th>
                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan="4"
                                        className="table-empty"
                                    >

                                        <div className="table-loader">

                                            <span></span>

                                            {t.loadingExpenses}

                                        </div>

                                    </td>

                                </tr>

                            ) : expenses.length > 0 ? (

                                expenses.map((e, index) => (

                                    <tr key={e.id}>

                                        <td>
                                            <span className="row-number">
                                                {index + 1}
                                            </span>
                                        </td>

                                        <td>

                                            <div className="item-cell">

                                                <span className="item-icon">
                                                    🧾
                                                </span>

                                                <span>
                                                    {e.itemName}
                                                </span>

                                            </div>

                                        </td>

                                        <td>

                                            <span className="expense-amount">
                                                - ₹{formatAmount(e.amount)}
                                            </span>

                                        </td>

                                        <td>
                                            {formatDate(e.date)}
                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan="4"
                                        className="table-empty"
                                    >

                                        <div className="empty-state">

                                            <span>📋</span>

                                            <strong>
                                                {t.noExpenses}
                                            </strong>

                                            <p>
                                                {t.noExpenseText}
                                            </p>

                                        </div>

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </section>


            {/* =================================================
                FOOTER
            ================================================= */}

            <section className="public-footer-card">

                <div className="footer-logo">

                    <img
                        src="/logo.jpeg"
                        alt="Jai Hind Mitra Mandal"
                    />

                </div>

                <div>

                    <strong>
                       🚩 जय हिंद मित्र मंडळ 🙏
                    </strong>

                    <p>
                        {t.transparency}
                    </p>

                </div>

                <div className="footer-flag">
                  
                </div>

            </section>

        </main>
    );
}

export default PublicDashboard;