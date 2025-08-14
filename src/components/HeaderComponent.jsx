import React from 'react'
import { NavLink } from 'react-router-dom'
import { isUserLoggedIn, logOut } from '../services/AuthService'
import { useNavigate } from 'react-router-dom'; //use navigate hook to navigate user to login page
const HeaderComponent = () => {

  const firstName = sessionStorage.getItem("firstName");
  const lastName = sessionStorage.getItem("lastName");
  const role = sessionStorage.getItem("role");
  const isAuth = isUserLoggedIn();
  const navigate = useNavigate();

  function handleLogout() {
    logOut();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-50 bg-gray-800 text-white shadow-md">
      <nav className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
        {/* 左邊：Logo + 任務清單 */}
        <div className="flex items-center space-x-6">
          <NavLink
            to={isAuth ? "/" : "/login"}
            className="text-xl font-bold hover:text-gray-300 transition"
          >
            任務管理系統
          </NavLink>

          {isAuth && (
            <NavLink
              to="/todos"
              className="hover:text-gray-300 transition"
            >
              所有任務
            </NavLink>
          )}
        </div>

        {/* 右邊：註冊／登入／登出 */}
        <div className="flex items-center space-x-4">
          {!isAuth && (
            <>
              <NavLink
                to="/register"
                className="hover:text-gray-300 transition"
              >
                帳號註冊
              </NavLink>
              <NavLink
                to="/login"
                className="hover:text-gray-300 transition"
              >
                登入
              </NavLink>
            </>
          )}

          {isAuth && (
            <>
              <span className="text-sm text-gray-300">
                {role === "ROLE_ADMIN"
                  ? `Admin ${firstName} 您好`
                  : `${firstName} 您好`}
              </span>
              <button
                onClick={handleLogout}
                className="hover:text-red-300 transition"
              >
                登出
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default HeaderComponent;