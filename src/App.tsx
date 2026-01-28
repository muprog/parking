import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import OperatorDashboard from './pages/OperatorDashboard'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import OperatorsList from './pages/OperatorsList'
import ViewOperator from './pages/ViewOperator'
import ReportsPage from './pages/ReportsPage'
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />

          <Route
            path='/admin/dashboard'
            element={
              <ProtectedRoute requiredRole='admin'>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/operator/dashboard'
            element={
              <ProtectedRoute requiredRole='operator'>
                <OperatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/operators'
            element={
              <ProtectedRoute requiredRole='admin'>
                <OperatorsList />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/operators/:operatorId'
            element={
              <ProtectedRoute requiredRole='admin'>
                <ViewOperator />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/reports'
            element={
              <ProtectedRoute requiredRole='admin'>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/operator/reports'
            element={
              <ProtectedRoute requiredRole='operator'>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          <Route path='/' element={<Login />} />

          <Route path='*' element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
