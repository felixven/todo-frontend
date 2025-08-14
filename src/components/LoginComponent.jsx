import React, { useState } from 'react'
import { loginAPICall, saveLoggedInUser, storeToken } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


const LoginComponent = () => {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // ✅ 加入錯誤訊息狀態
  const navigator = useNavigate();

  async function handleLoginForm(e) {
    e.preventDefault();

    // ✅ 前端欄位驗證
    if (!username.trim() || !password.trim()) {
      setErrorMessage('請輸入帳號與密碼');
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

      setErrorMessage(''); // 清除錯誤訊息
      {role === "ROLE_ADMIN"
        ? toast.success(`登入成功，歡迎 Admin ${firstName}！`)
        : toast.success(`登入成功，歡迎 ${firstName}！`)};

      setTimeout(() => {
        navigator("/"); // ✅ 正確寫法是 navigate，不是 navigator
        // window.location.reload(false); ← 建議先移除
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
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] pt-10 bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">使用者登入</h2>

        {/* ✅ 顯示錯誤訊息 */}
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
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            登入
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginComponent;