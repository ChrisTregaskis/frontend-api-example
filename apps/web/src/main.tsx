import { createRoot } from "react-dom/client";
import "./style.css";
import { QueryProvider } from "./providers/QueryProvider";
import { NotificationList } from "./components/NotificationsList";

const App = () => (
  <div className="flex flex-col h-screen bg-gray-100 rounded-lg shadow-lg">
    <NotificationList />
  </div>
);

createRoot(document.getElementById("app")!).render(
  <QueryProvider>
    <App />
  </QueryProvider>
);
