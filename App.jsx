import { Route, Routes } from 'react-router-dom'
import { AuthProvider, Protected } from './components/Auth'
import { ToastProvider } from './components/ui'
import Layout from './components/Layout'
import Home from './pages/Home'
import Listing from './pages/Listing'
import Detail from './pages/Detail'
import { Login, Signup, Forgot, Reset } from './pages/AuthPages'
import Dashboard from './pages/Dashboard'
import Admin from './pages/admin/Admin'

const NotFound = () => <div className="container-x py-24 text-center"><h1 className="text-3xl font-bold">Page not found</h1><p className="mt-2 text-slate-500">The page you are looking for does not exist.</p></div>

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<Forgot />} />
            <Route path="/reset-password" element={<Reset />} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/admin/*" element={<Protected admin><Admin /></Protected>} />
            <Route path="/:type" element={<Listing />} />
            <Route path="/:type/:id" element={<Detail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ToastProvider>
  )
}
