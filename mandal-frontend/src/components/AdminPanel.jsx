import React, { useState, useEffect } from 'react';

function AdminPanel({ onViewReceipt }) {
  const [event, setEvent] = useState('Kavad Yatra');
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [itemName, setItemName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [collections, setCollections] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    totalCollections: 0,
    totalExpenses: 0,
    balance: 0
  });
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [sendingReceipt, setSendingReceipt] = useState(false);

  const token = localStorage.getItem('adminToken');
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [event]);

  const fetchData = async () => {
    try {
      const [collRes, expRes, sumRes] = await Promise.all([
        fetch(`${API_URL}/api/collections?event=${event}`),
        fetch(`${API_URL}/api/expenses?event=${event}`),
        fetch(`${API_URL}/api/summary?event=${event}`)
      ]);

      setCollections(await collRes.json());
      setExpenses(await expRes.json());
      setSummary(await sumRes.json());
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleAddCollection = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          event,
          donorName,
          amount: parseInt(amount),
          mobileNumber
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${data.error}`);
        return;
      }

      setMessage(`✓ Collection added!`);
      setDonorName('');
      setAmount('');
      setMobileNumber('');

      fetchData();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          event,
          itemName,
          amount: parseInt(expenseAmount)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${data.error}`);
        return;
      }

      setMessage('✓ Expense added');
      setItemName('');
      setExpenseAmount('');

      fetchData();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense?')) return;

    try {
      const response = await fetch(`${API_URL}/api/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('✓ Expense deleted');
        fetchData();
      } else {
        const data = await response.json();
        setMessage(`Error: ${data.error || 'Failed to delete expense'}`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  // =========================================================
  // DELETE DONOR / COLLECTION
  // =========================================================

  const handleDeleteCollection = async (id) => {
    if (!window.confirm('Delete this donor collection?')) return;

    try {
      const response = await fetch(`${API_URL}/api/collections/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('✓ Collection deleted');
        fetchData();
      } else {
        const data = await response.json();
        setMessage(
          `Error: ${data.error || 'Failed to delete collection'}`
        );
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleSendReceipt = async () => {
    if (!selectedDonor) return;

    setSendingReceipt(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/send-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          donorName: selectedDonor.donorName,
          amount: selectedDonor.amount,
          mobileNumber: selectedDonor.mobileNumber,
          event: selectedDonor.event,
          receiptId: selectedDonor.receiptId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${data.error}`);
        return;
      }

      setMessage('✓ Receipt sent via WhatsApp!');

      setTimeout(() => setSelectedDonor(null), 2000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSendingReceipt(false);
    }
  };

  return (
    <div className="admin-panel">

      {/* =========================================================
          ADMIN STATS
      ========================================================= */}

      <div className="stats-grid">

        <div className="stat-card success">
          <div className="stat-icon">💰</div>
          <div className="stat-label">एकूण जमा</div>
          <div className="stat-value">
            ₹{summary.totalCollections.toLocaleString()}
          </div>
          <div className="stat-count">
            {collections.length} donations
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">📊</div>
          <div className="stat-label">एकूण खर्च</div>
          <div className="stat-value">
            ₹{summary.totalExpenses.toLocaleString()}
          </div>
          <div className="stat-count">
            {expenses.length} खर्च
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-icon">📈</div>
          <div className="stat-label">शिल्लक रक्कम</div>
          <div className="stat-value">
            ₹{summary.balance.toLocaleString()}
          </div>
          <div className="stat-count">
            रक्कम
          </div>
        </div>

      </div>

      {/* =========================================================
          EVENT SELECTOR
      ========================================================= */}

      <div className="event-selector">
        <label>कार्यक्रम निवडा:</label>

        <select
          value={event}
          onChange={(e) => setEvent(e.target.value)}
        >
          <option>कावड यात्रा</option>
          <option>गणपतीची वर्गणी</option>
          <option>नवरात्री वर्गणी</option>
        </select>
      </div>

      {/* =========================================================
          MESSAGE
      ========================================================= */}

      {message && (
        <div
          className={
            message.includes('✓')
              ? 'success-message'
              : 'error-message'
          }
        >
          {message}
        </div>
      )}

      {/* =========================================================
          FORMS
      ========================================================= */}

      <div className="forms-grid">

        {/* ADD COLLECTION */}

        <div className="form-card">

          <div className="form-header">
            <h3>➕ देणगी जोडा </h3>
            <span className="form-icon">💵</span>
          </div>

          <form onSubmit={handleAddCollection}>

            <input
              type="text"
              placeholder="देणगीदाराचे नाव"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="रक्कम (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <input
              type="tel"
              placeholder="मोबाईल क्रमांक"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'देणगीदार जोडा'}
            </button>

          </form>
        </div>

        {/* ADD EXPENSE */}

        <div className="form-card">

          <div className="form-header">
            <h3>➖ खर्च जोडा</h3>
            <span className="form-icon">💸</span>
          </div>

          <form onSubmit={handleAddExpense}>

            <input
              type="text"
              placeholder="साहित्य (सजावट, पूजा इत्यादी.)"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="रक्कम (₹)"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'खर्च जोडा'}
            </button>

          </form>
        </div>

      </div>

      {/* =========================================================
          COLLECTION TABLE
      ========================================================= */}

      <div className="table-section">

        <h3>💸 जमा</h3>

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>देणगीदार</th>
                <th>रक्कम</th>
                <th>मोबाईल</th>
                <th>दिनांक</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {collections.map((c) => (

                <tr
                  key={c.id}
                  onClick={() => setSelectedDonor(c)}
                  className="clickable-row"
                >

                  <td>{c.donorName}</td>

                  <td className="amount">
                    ₹{c.amount.toLocaleString()}
                  </td>

                  <td>{c.mobileNumber}</td>

                  <td>
                    {new Date(c.date).toLocaleDateString()}
                  </td>

                  <td>

                    <span className="view-badge">
                      पहा →
                    </span>

                    {/* DELETE DONOR BUTTON */}
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCollection(c.id);
                      }}
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

              {collections.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="empty-state"
                  >
                    No collections yet
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      <br />
      <br />

      {/* =========================================================
          EXPENSE TABLE
      ========================================================= */}

      <div className="table-section">

        <h3>📝 खर्च</h3>

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>Item</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {expenses.map((e) => (

                <tr key={e.id}>

                  <td>{e.itemName}</td>

                  <td className="amount">
                    ₹{e.amount.toLocaleString()}
                  </td>

                  <td>
                    {new Date(e.date).toLocaleDateString()}
                  </td>

                  <td>
                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDeleteExpense(e.id)
                      }
                    >
                      Delete
                    </button>
                  </td>

                </tr>

              ))}

              {expenses.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="empty-state"
                  >
                    No expenses yet
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================================================
          DONOR DETAILS MODAL
      ========================================================= */}

      {selectedDonor && (

        <div
          className="modal-overlay"
          onClick={() => setSelectedDonor(null)}
        >

          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="close-btn"
              onClick={() => setSelectedDonor(null)}
            >
              ×
            </button>

            <h2>देणगीदाराची माहिती</h2>

            <div className="donor-details">

              <div className="detail-row">
                <span className="label">नाव :</span>
                <span className="value">
                  {selectedDonor.donorName}
                </span>
              </div>

              <div className="detail-row">
                <span className="label">रक्कम :</span>
                <span className="value">
                  ₹{selectedDonor.amount.toLocaleString()}
                </span>
              </div>

              <div className="detail-row">
                <span className="label">मोबाईल :</span>
                <span className="value">
                  {selectedDonor.mobileNumber}
                </span>
              </div>

              <div className="detail-row">
                <span className="label">कार्यक्रम :</span>
                <span className="value">
                  {selectedDonor.event}
                </span>
              </div>

              <div className="detail-row">
                <span className="label">पावती क्रमांक :</span>
                <span className="value">
                  {selectedDonor.receiptId}
                </span>
              </div>

              <div className="detail-row">
                <span className="label">दिनांक :</span>
                <span className="value">
                  {new Date(
                    selectedDonor.date
                  ).toLocaleDateString('en-IN')}
                </span>
              </div>

            </div>

            <div className="receipt-button-group">

              <button
                className="view-receipt-btn"
                onClick={() => {
                  onViewReceipt(selectedDonor);
                  setSelectedDonor(null);
                }}
              >
                👁️ पावती पहा
              </button>

              <button
                className="send-receipt-btn"
                onClick={handleSendReceipt}
                disabled={sendingReceipt}
              >
                {sendingReceipt
                  ? 'Sending...'
                  : '📱 Send Receipt'}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminPanel;