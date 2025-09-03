import React, { useState } from 'react'
import { loginAPICall, saveLoggedInUser, storeToken } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Spinners } from './Spinner';


const LoginComponent = () => {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigator = useNavigate();

  const handleLoginForm = async (e) => {
    e.preventDefault();

    if (loading) return;
    setErrorMessage('');
    setLoading(true);


    if (!username.trim() || !password.trim()) {
      setErrorMessage('請輸入帳號與密碼');
      setLoading(false);
      return;
    }


    try {

      const response = await loginAPICall(username, password);
      console.log(response.data);

      const token = 'Bearer ' + response.data.accessToken;
      const role = response.data.role;
      const firstName = response.data.firstName;
      const lastName = response.data.lastName;

      storeToken(token);
      saveLoggedInUser(username, role, firstName, lastName);
      localStorage.setItem("user", JSON.stringify({ username, role, firstName, lastName }));

      setErrorMessage('');
      {
        role === "ROLE_ADMIN"
          ? toast.success(`登入成功，歡迎 Admin ${firstName}！`)
          : toast.success(`登入成功，歡迎 ${firstName}！`)
      };

      setTimeout(() => {
        navigator("/");
      }, 500);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        setErrorMessage("帳號或密碼錯誤");
      } else if (error.response?.status === 500) {
        setErrorMessage("伺服器錯誤，請稍後再試");
      } else {
        setErrorMessage("登入失敗，請稍後再試");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] pt-10 bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">使用者登入</h2>


        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}

        <form onSubmit={handleLoginForm}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">帳號名稱或電郵</label>
            <input
              type="text"
              name="username"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="請輸入帳戶名稱或電郵"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-1">密碼</label>
            <input
              type="password"
              name="password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="請輸入密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-2 px-4 rounded transition
              ${loading
                ? "bg-blue-400 cursor-not-allowed text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"}`}
            aria-busy={loading}
            aria-live="polite"
          >
            {loading ? (
              <span className="flex gap-2 items-center justify-center">
                <Spinners />
                登入中…
              </span>
            ) : (
              "登入"
            )}
          </button>
        </form>
      </div>
      <div className="text-center mt-4">
        <p className="text-gray-600 text-md">
          伺服器因休眠機制，喚醒可能需要一些時間
        </p>
      </div>
    </div>
  );
};

export default LoginComponent;