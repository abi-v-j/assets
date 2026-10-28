import { Route, Routes } from "react-router"
import Login from "../auth/pages/Login"

const AuthRoutes: React.FC = () => {
  return (
  <Routes>
    <Route path="/login" element={<Login />} />
  </Routes>
  )
}

export default AuthRoutes