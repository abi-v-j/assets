import { Route, Routes } from "react-router"
import LandingRoutes from "./LandingRoutes"
import AuthRoutes from "./AuthRoutes"

const GlobalRoutes: React.FC = () => {
  return (
    <Routes>
        <Route path="" element={<LandingRoutes />} />
        <Route path="auth/*" element={<AuthRoutes/>}/>
    </Routes>
  )
}

export default GlobalRoutes