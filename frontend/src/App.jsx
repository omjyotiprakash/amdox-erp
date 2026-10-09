
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/common/Layout";
import PrivateRoute from "./components/Auth/PrivateRoute";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Error from "./pages/Error";
import NotFound from "./pages/NotFound";

import Ledger from "./pages/Finance/Ledger";
import Employees from "./pages/HR/Employees";
import Inventory from "./pages/SupplyChain/Inventory";
import ProjectsList from "./pages/Projects/ProjectsList";
import General from "./pages/Settings/General";

const App = () => {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/error" element={<Error />} />

      {/* Protected workspace */}
      <Route element={<PrivateRoute />}>
        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/finance/ledger"
          element={<Layout><Ledger /></Layout>}
        />

        <Route
          path="/hr/employees"
          element={<Layout><Employees /></Layout>}
        />

        <Route
          path="/supply-chain/inventory"
          element={<Layout><Inventory /></Layout>}
        />

        <Route
          path="/projects"
          element={<Layout><ProjectsList /></Layout>}
        />

        <Route
          path="/settings/general"
          element={<Layout><General /></Layout>}
        />

        {/* Temporary redirects for unconnected module pages */}
        <Route path="/finance/*" element={<Navigate to="/finance/ledger" replace />} />
        <Route path="/hr/*" element={<Navigate to="/hr/employees" replace />} />
        <Route path="/supply-chain/*" element={<Navigate to="/supply-chain/inventory" replace />} />
        <Route path="/settings/*" element={<Navigate to="/settings/general" replace />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
