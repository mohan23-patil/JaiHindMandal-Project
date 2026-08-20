import React, { useState } from 'react';

function LoginForm({ setIsAdmin }) {

    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;


    /* =====================================================
       LOGIN
    ===================================================== */

    const handleLogin = async (e) => {

        e.preventDefault();

        setLoading(true);
        setError('');

        try {

            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                setError(
                    data.error || 'Invalid password'
                );

                return;
            }


            /* =============================================
               SAVE TOKEN
            ============================================= */

            localStorage.setItem(
                'adminToken',
                data.token
            );


            /* =============================================
               LOGIN SUCCESS
            ============================================= */

            setPassword('');

            setIsAdmin(true);


        } catch (err) {

            console.error(
                'Login error:',
                err
            );

            setError(
                'Unable to connect to server'
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <form
            className="login-form"
            onSubmit={handleLogin}
        >


            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="login-input-group">

                <label htmlFor="admin-password">
                    Admin Password
                </label>


                <div className="password-input-wrapper">

                    <span className="password-icon">
                        🔑
                    </span>


                    <input
                        id="admin-password"
                        type="password"
                        placeholder="Enter admin password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                        autoFocus
                    />

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="login-error">

                    <span>
                        ⚠️
                    </span>

                    {error}

                </div>

            )}


            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
            >

                {loading ? (

                    <>
                        <span className="button-spinner"></span>
                        Logging in...
                    </>

                ) : (

                    <>
                        🔐 Login to Dashboard
                    </>

                )}

            </button>


            {/* =================================================
                SECURITY NOTE
            ================================================= */}

            <p className="login-security-note">
                🔒 Admin access is protected and secure.
            </p>

        </form>

    );

}


export default LoginForm;