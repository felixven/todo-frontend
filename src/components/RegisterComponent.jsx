import React, { useState } from 'react'
import { registerAPICall } from '../services/AuthService'
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Spinners } from './Spinner';

const RegisterComponent = () => {


    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigator = useNavigate();

    async function handleRegistrationForm(e) {
        e.preventDefault();

        const newErrors = {};

        if (!firstName.trim()) newErrors.firstName = '必填欄位';
        if (!lastName.trim()) newErrors.lastName = '必填欄位';

        if (!username.trim()) {
            newErrors.username = '必填欄位';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            newErrors.email = '必填欄位';
        } else if (!emailRegex.test(email)) {
            newErrors.email = '請輸入正確的電子郵件格式';
        }

        if (!password.trim()) {
            newErrors.password = '必填欄位';
        } else if (password.length < 8) {
            newErrors.password = '密碼至少需要 8 碼';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        if (loading) return;   // 避免重複送出
        setLoading(true);      // 進入載入中


        try {
            const register = { firstName, lastName, username, email, password };
            const response = await registerAPICall(register);
            console.log(response.data);

            toast.success(
                <div>
                    註冊成功，請前往{' '}
                    <Link to="/login" className="underline text-blue-600 hover:text-blue-800">
                        登入
                    </Link>
                </div>,
                { autoClose: 2000 }
            );

            setTimeout(() => {
                navigator('/login');
            }, 2000);
        } catch (error) {
            const backendMessage = error.response?.data?.message;

            if (backendMessage === "Username is already exists!") {
                setErrors({ username: "帳號名稱已被使用" });
            } else if (backendMessage === "Email is already exists") {
                setErrors({ email: "電子郵件已被註冊" });
            } else if (backendMessage === "Invalid email format") {
                setErrors({ email: "請輸入正確的電子郵件格式" });
            } else if (backendMessage === "Password must be at least 8 characters") {
                setErrors({ password: "密碼至少需要 8 碼" });
            } else {
                setErrors({ general: "註冊失敗，請稍後再試。" });
            }
        } finally {
            setLoading(false); // ✅ 無論成功失敗都結束 loading
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] pt-10 bg-gray-100">
            <br /><br />
            <div className="w-full max-w-md bg-white shadow-md rounded px-8 py-6">
                <h2 className="text-2xl font-semibold text-center mb-6">帳號註冊</h2>

                {/* 2025/05/02 更動 */}
                {/* <form> */}
                <form onSubmit={handleRegistrationForm}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">姓氏</label>
                        <input
                            type="text"
                            name="lastName"
                            className="w-full border border-gray-300 px-3 py-2 rounded"
                            placeholder="請輸入姓氏"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            disabled={loading}
                            autoComplete="lastname"
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}

                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">名字</label>
                        <input
                            type="text"
                            name="firstName"
                            className="w-full border border-gray-300 px-3 py-2 rounded"
                            placeholder="請輸入名字"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            disabled={loading}
                            autoComplete="firstname"
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}

                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">帳號名稱</label>
                        <input
                            type="text"
                            name="username"
                            className="w-full border border-gray-300 px-3 py-2 rounded"
                            placeholder="請輸入帳號名稱"
                            value={username}
                            onChange={(e) => setUserName(e.target.value)}
                            disabled={loading}
                            autoComplete="username"
                        />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">電子郵件</label>
                        <input
                            type="text"
                            name="email"
                            className="w-full border border-gray-300 px-3 py-2 rounded"
                            placeholder="請輸入電子郵件"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            autoComplete="email"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">密碼</label>
                        <input
                            type="password"
                            name="password"
                            className="w-full border border-gray-300 px-3 py-2 rounded"
                            placeholder="請輸入密碼"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            autoComplete="password"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    {errors.general && (
                        <p className="text-red-500 text-center mb-4">{errors.general}</p>
                    )}

                    <div>
                        {/* 2025/05/02 更動 */}
                        {/* <button 
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                            onClick={(e) => handleRegistrationForm(e)}
                        > */}
                    
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full font-semibold py-2 px-4 rounded transition
                                 ${loading ? "bg-blue-400 cursor-not-allowed text-white"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                            aria-busy={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Spinners /> 註冊中…
                                </span>
                            ) : (
                                "送出"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RegisterComponent