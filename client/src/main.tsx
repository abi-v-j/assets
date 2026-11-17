import { createRoot } from "react-dom/client";
import GlobalRoutes from "./routes/GlobalRoutes";
import { BrowserRouter } from "react-router";
import "./css/style.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <GlobalRoutes />
  </BrowserRouter>,
);
