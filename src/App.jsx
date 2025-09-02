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
import LeaderBoardComponent from './components/LeaderboardComponent'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  function AuthenticatedRoute({ children }) {//secure route: enclose that route within this functional component
    const isAuth = isUserLoggedIn();
    if (isAuth) {
      return children;
    }
    return <Navigate to="/login" />
  }
  return (
    <>

      <BrowserRouter>
        <HeaderComponent />
        <Routes>
  
          <Route path='/' element={
            <AuthenticatedRoute>
              <MainPageComponent />
            </AuthenticatedRoute>
          }></Route>

          <Route path='/todos' element={
            <AuthenticatedRoute>
              <ListTodoComponent />
            </AuthenticatedRoute>
          }></Route>

          <Route path='/add-todo' element={
            <AuthenticatedRoute>
              <TodoComponent />
            </AuthenticatedRoute>
          }></Route>

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


          <Route path="/leaderboard" element={
              <AuthenticatedRoute>
                <LeaderBoardComponent />
              </AuthenticatedRoute>
            }/>

         <Route path="/todos/:id" element={
              <AuthenticatedRoute>
                <TodoDetail />
              </AuthenticatedRoute>
            }/>

          <Route path='/register' element={<RegisterComponent />}></Route>

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
