import { Route, Routes } from "react-router"
import HomePage from "../landing/pages/HomePage"

const LandingRoutes: React.FC = () => {
  return (
    <Routes>
        <Route path="" element={<HomePage />} />
    </Routes>
  )
}

export default LandingRoutes