import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ListTodoComponent from './components/ListTodoComponent'
import HeaderComponent from './components/HeaderComponent'
import FooterComponent from './components/FooterComponent'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TodoComponent from './components/TodoComponent'
import RegisterComponent from './components/RegisterComponent'
import LoginComponent from './components/LoginComponent'
import { isUserLoggedIn } from './services/AuthService'
import MainPageComponent from './components/MainPageComponent'
import TodoDetail from './components/TodoDetail'
import PendingReviewTodosComponent from './components/PendingReviewTodosComponent'
import ReviewedTodosComponent from './components/ReviewedTodosComponent'
import OverdueTodosComponent from './components/OverdueTodosComponent'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//App的註解：base component or root component, within this app component, we can import and use the other react components
//App component convert this updatedTodo into object into TodoDto
function App() {

  function AuthenticatedRoute({ children }) {//secure route: enclose that route within this functional component
    const isAuth = isUserLoggedIn();
    if (isAuth) {
      return children;
    }
    return <Navigate to="/login" />//沒登入的人，帶到“/login”這個路徑，參考下面的Route，即是login頁面
  }
  return (
    <>

      <BrowserRouter>
        <HeaderComponent />
        <Routes>
          {/* Routes acts as a container/parent for all the individual routed that will be created in our app */}


          {/* http://localhost:8080 */}


          <Route path='/' element={
            <AuthenticatedRoute>
              <MainPageComponent />
            </AuthenticatedRoute>
          }></Route>

          {/* http://localhost:8080/todos */}
          <Route path='/todos' element={
            <AuthenticatedRoute>
              <ListTodoComponent />
              {/* 上面 this is the children of AuthenticatedRoute component/method */}
            </AuthenticatedRoute>
          }></Route>

          {/* http://localhost:8080/add-todo */}
          <Route path='/add-todo' element={
            <AuthenticatedRoute>
              <TodoComponent />
            </AuthenticatedRoute>
          }></Route>

          {/* http://localhost:8080/update-todo/1 */}
          <Route path='/update-todo/:id' element={
            <AuthenticatedRoute>
              <TodoComponent />
            </AuthenticatedRoute>
          }></Route>

          <Route path='/pending-review' element={
            <AuthenticatedRoute>
              <PendingReviewTodosComponent />
            </AuthenticatedRoute>
          }></Route>

          <Route path='/reviewed-todos' element={
            <AuthenticatedRoute>
              <ReviewedTodosComponent />
            </AuthenticatedRoute>
          }></Route>

          <Route path='/overdue' element={
            <AuthenticatedRoute>
              <OverdueTodosComponent />
            </AuthenticatedRoute>
          } />


          <Route path="/todos/:id" element={
              <AuthenticatedRoute>
                <TodoDetail />
              </AuthenticatedRoute>
            }/>


          {/* http://localhost:8080/register */}
          <Route path='/register' element={<RegisterComponent />}></Route>

          {/* http://localhost:8080/login */}
          <Route path='/login' element={<LoginComponent />}></Route>

        </Routes>
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar
          closeOnClick
          pauseOnHover={false}
          draggable={false}
          theme="light"
        />
        <FooterComponent />
      </BrowserRouter>
    </>
  )
}

export default App
