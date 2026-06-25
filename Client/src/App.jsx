import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import './App.css'
import Register from './Pages/Register'
import Login from './Pages/Login'
import Layout from './components/layout/Layout'
function App() {
  return (
    <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout/>} >
          <Route index element={<Home/>}/>
        </Route>
    </Routes>
  )
}

export default App