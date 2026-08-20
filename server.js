const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const axios = require('axios');
const path = require('path');
const os = require('os');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());


// =========================================================
// DATABASE
// =========================================================

const db = new sqlite3.Database('./mandal.db', (err) => {

    if (err) {
        console.error('Database error:', err);
    } else {
        console.log('✓ Database connected');
    }

});


// =========================================================
// CONFIG
// =========================================================

const JWT_SECRET =
    process.env.JWT_SECRET ||
    'your-secret-key-change-in-production';

const ADMIN_PASSWORD = bcrypt.hashSync(
    process.env.ADMIN_PASSWORD || 'admin123',
    10
);


// =========================================================
// INITIALIZE DATABASE
// =========================================================

const initDB = () => {

    db.serialize(() => {

        // Collections Table
        db.run(`
            CREATE TABLE IF NOT EXISTS collections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event TEXT NOT NULL,
                donorName TEXT NOT NULL,
                amount INTEGER NOT NULL,
                mobileNumber TEXT NOT NULL,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                receiptId TEXT UNIQUE
            )
        `);


        // Expenses Table
        db.run(`
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event TEXT NOT NULL,
                itemName TEXT NOT NULL,
                amount INTEGER NOT NULL,
                date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);


        console.log('✓ Tables initialized');

    });

};

initDB();


// =========================================================
// AUTH MIDDLEWARE
// =========================================================

const verifyToken = (req, res, next) => {

    const token =
        req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'No token'
        });
    }


    jwt.verify(
        token,
        JWT_SECRET,
        (err, decoded) => {

            if (err) {
                return res.status(403).json({
                    error: 'Invalid token'
                });
            }

            req.admin = decoded;

            next();

        }
    );

};


// =========================================================
// LOGIN
// =========================================================

app.post('/api/auth/login', (req, res) => {

    const { password } = req.body;

    if (!password) {

        return res.status(400).json({
            error: 'Password required'
        });

    }


    const isValid =
        bcrypt.compareSync(
            password,
            ADMIN_PASSWORD
        );


    if (!isValid) {

        return res.status(401).json({
            error: 'Invalid password'
        });

    }


    const token = jwt.sign(
        { admin: true },
        JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );


    res.json({
        token,
        message: 'Login successful'
    });

});


// =========================================================
// ADD COLLECTION / DONOR
// =========================================================

app.post('/api/collections', verifyToken, (req, res) => {

    const {
        event,
        donorName,
        amount,
        mobileNumber
    } = req.body;


    if (!event || !donorName || !amount || !mobileNumber) {

        return res.status(400).json({
            error: 'All fields are required'
        });

    }


    const receiptId = `JAI-${Date.now()}`;


    db.run(
        `
        INSERT INTO collections
        (
            event,
            donorName,
            amount,
            mobileNumber,
            receiptId
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            event,
            donorName,
            amount,
            mobileNumber,
            receiptId
        ],
        function (err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }


            res.json({

                success: true,

                id: this.lastID,

                receiptId,

                message: 'Collection added'

            });

        }
    );

});


// =========================================================
// GET COLLECTIONS
// =========================================================

app.get('/api/collections', (req, res) => {

    const { event } = req.query;


    const query = event
        ? `
            SELECT *
            FROM collections
            WHERE event = ?
            ORDER BY date DESC
          `
        : `
            SELECT *
            FROM collections
            ORDER BY date DESC
          `;


    db.all(
        query,
        event ? [event] : [],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }


            res.json(rows || []);

        }
    );

});


// =========================================================
// DELETE COLLECTION / DONOR
// =========================================================
// IMPORTANT:
// Only admin with valid JWT can delete donor.
// =========================================================

app.delete(
    '/api/collections/:id',
    verifyToken,
    (req, res) => {

        const collectionId = req.params.id;


        if (!collectionId) {

            return res.status(400).json({
                error: 'Collection ID is required'
            });

        }


        db.run(
            `
            DELETE FROM collections
            WHERE id = ?
            `,
            [collectionId],
            function (err) {

                if (err) {

                    return res.status(500).json({
                        error: err.message
                    });

                }


                // ID not found
                if (this.changes === 0) {

                    return res.status(404).json({
                        error: 'Donor / collection not found'
                    });

                }


                res.json({

                    success: true,

                    message:
                        'Donor collection deleted successfully'

                });

            }
        );

    }
);


// =========================================================
// GET SUMMARY
// =========================================================

app.get('/api/summary', (req, res) => {

    const { event } = req.query;


    let collectionsQuery = `
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM collections
    `;


    let expensesQuery = `
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM expenses
    `;


    let collectionParams = [];

    let expenseParams = [];


    if (event) {

        collectionsQuery += `
            WHERE event = ?
        `;

        expensesQuery += `
            WHERE event = ?
        `;


        collectionParams.push(event);

        expenseParams.push(event);

    }


    db.get(
        collectionsQuery,
        collectionParams,
        (err, collResult) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }


            db.get(
                expensesQuery,
                expenseParams,
                (err, expResult) => {

                    if (err) {

                        return res.status(500).json({
                            error: err.message
                        });

                    }


                    const collections =
                        collResult.total || 0;


                    const expenses =
                        expResult.total || 0;


                    res.json({

                        totalCollections:
                            collections,

                        totalExpenses:
                            expenses,

                        balance:
                            collections - expenses

                    });

                }
            );

        }
    );

});


// =========================================================
// ADD EXPENSE
// =========================================================

app.post('/api/expenses', verifyToken, (req, res) => {

    const {
        event,
        itemName,
        amount
    } = req.body;


    if (!event || !itemName || !amount) {

        return res.status(400).json({
            error: 'All fields are required'
        });

    }


    db.run(
        `
        INSERT INTO expenses
        (
            event,
            itemName,
            amount
        )
        VALUES (?, ?, ?)
        `,
        [
            event,
            itemName,
            amount
        ],
        function (err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }


            res.json({

                success: true,

                id: this.lastID,

                message: 'Expense added'

            });

        }
    );

});


// =========================================================
// GET EXPENSES
// =========================================================

app.get('/api/expenses', (req, res) => {

    const { event } = req.query;


    const query = event
        ? `
            SELECT *
            FROM expenses
            WHERE event = ?
            ORDER BY date DESC
          `
        : `
            SELECT *
            FROM expenses
            ORDER BY date DESC
          `;


    db.all(
        query,
        event ? [event] : [],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }


            res.json(rows || []);

        }
    );

});


// =========================================================
// DELETE EXPENSE
// =========================================================

app.delete(
    '/api/expenses/:id',
    verifyToken,
    (req, res) => {

        const expenseId = req.params.id;


        db.run(
            `
            DELETE FROM expenses
            WHERE id = ?
            `,
            [expenseId],
            function (err) {

                if (err) {

                    return res.status(500).json({
                        error: err.message
                    });

                }


                if (this.changes === 0) {

                    return res.status(404).json({
                        error: 'Expense not found'
                    });

                }


                res.json({

                    success: true,

                    message:
                        'Expense deleted successfully'

                });

            }
        );

    }
);


// =========================================================
// GENERATE PDF RECEIPT
// =========================================================

const generatePDF = (data) => {

    return new Promise((resolve, reject) => {

        const doc = new PDFDocument({
            size: 'A4',
            margin: 40
        });


        const filename =
            path.join(
                os.tmpdir(),
                `receipt-${data.receiptId}.pdf`
            );


        const stream =
            require('fs').createWriteStream(filename);


        stream.on('error', reject);


        doc.pipe(stream);


        // Header

        doc
            .fontSize(24)
            .font('Helvetica-Bold')
            .text('🙏', {
                align: 'center'
            });


        doc
            .fontSize(18)
            .font('Helvetica-Bold')
            .text(
                'Jai Hind Mitra Mandal',
                {
                    align: 'center'
                }
            );


        doc
            .fontSize(12)
            .font('Helvetica')
            .fillColor('#666')
            .text(
                'Hyderabad',
                {
                    align: 'center'
                }
            );


        doc
            .fillColor('#000')
            .moveTo(50, doc.y)
            .lineTo(510, doc.y)
            .stroke();


        doc.moveDown();


        // Title

        doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .text(
                `${data.event} Collection Receipt`,
                {
                    align: 'center'
                }
            );


        doc
            .fontSize(10)
            .fillColor('#999')
            .text(
                `Receipt #${data.receiptId}`,
                {
                    align: 'center'
                }
            );


        doc.fillColor('#000');


        doc.moveDown();


        doc
            .moveTo(50, doc.y)
            .lineTo(510, doc.y)
            .stroke();


        doc.moveDown();


        // Details

        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text(
                'Collection Details',
                {
                    underline: true
                }
            );


        doc
            .fontSize(11)
            .font('Helvetica');


        doc.text(
            `Donor Name: ${data.donorName}`
        );


        doc.text(
            `Amount Contributed: ₹${data.amount}`
        );


        doc.text(
            `Event: ${data.event}`
        );


        doc.text(
            `Date: ${new Date().toLocaleDateString(
                'en-IN'
            )}`
        );


        doc.text(
            `Time: ${new Date().toLocaleTimeString(
                'en-IN'
            )}`
        );


        doc.moveDown();


        doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .fillColor('#2563eb')
            .text(
                `₹${data.amount}`,
                {
                    align: 'center'
                }
            );


        doc.fillColor('#000');


        doc.moveDown();


        doc
            .moveTo(50, doc.y)
            .lineTo(510, doc.y)
            .stroke();


        doc.moveDown();


        // Thank You

        doc
            .fontSize(12)
            .text(
                'सुक्रिया आपका दिल की भक्ति और सहायता के लिए',
                {
                    align: 'center'
                }
            );


        doc
            .fontSize(11)
            .text(
                'Thank you for your generous contribution',
                {
                    align: 'center'
                }
            );


        doc.moveDown();


        doc
            .fontSize(9)
            .fillColor('#666')
            .text(
                'Jai Hind Mitra Mandal',
                {
                    align: 'center'
                }
            );


        doc
            .fillColor('#999')
            .text(
                'This is an official receipt. Please keep for your records.',
                {
                    align: 'center'
                }
            );


        doc.end();


        stream.on(
            'finish',
            () => resolve(filename)
        );

    });

};


// =========================================================
// SEND RECEIPT VIA WHATSAPP
// =========================================================

app.post(
    '/api/send-receipt',
    verifyToken,
    async (req, res) => {

        const {
            donorName,
            amount,
            mobileNumber,
            event,
            receiptId
        } = req.body;


        try {

            const pdfPath =
                await generatePDF({
                    donorName,
                    amount,
                    event,
                    receiptId
                });


            await sendWhatsApp(
                mobileNumber,
                donorName,
                amount,
                pdfPath
            );


            res.json({

                success: true,

                message:
                    'Receipt sent via WhatsApp!'

            });

        } catch (err) {

            res.status(500).json({
                error: err.message
            });

        }

    }
);


// =========================================================
// SEND WHATSAPP - TWILIO
// =========================================================

const sendWhatsApp = async (
    mobileNumber,
    donorName,
    amount,
    pdfPath
) => {

    try {

        const accountSid =
            process.env.TWILIO_ACCOUNT_SID;


        const authToken =
            process.env.TWILIO_AUTH_TOKEN;


        const fromNumber =
            process.env.TWILIO_WHATSAPP_NUMBER;


        if (
            !accountSid ||
            !authToken ||
            !fromNumber
        ) {

            console.log(
                'WhatsApp credentials not set - skipping send'
            );

            return;

        }


        const toNumber =
            `whatsapp:+91${mobileNumber}`;


        const message = `
🙏 *Jai Hind Mitra Mandal*

Thank you ${donorName} for contributing ₹${amount}

आपकी दान के लिए धन्यवाद!

PDF Receipt attached.
`;


        const auth =
            Buffer
                .from(
                    `${accountSid}:${authToken}`
                )
                .toString('base64');


        await axios.post(

            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,

            `From=${fromNumber}&To=${toNumber}&Body=${encodeURIComponent(message)}`,

            {
                headers: {

                    'Authorization':
                        `Basic ${auth}`,

                    'Content-Type':
                        'application/x-www-form-urlencoded'

                }
            }

        );


        console.log(
            '✓ WhatsApp sent to',
            mobileNumber
        );


    } catch (error) {

        console.log(
            'WhatsApp send failed:',
            error.message
        );

    }

};


// =========================================================
// SERVER
// =========================================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `\n🚀 Server running on http://localhost:${PORT}\n`
        );

    }
);