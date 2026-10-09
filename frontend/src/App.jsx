
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
import General from "./pages/Settings/General";
import FinanceReports from "./pages/Finance/Reports";
import Payables from "./pages/Finance/Payables";
import Receivables from "./pages/Finance/Receivables";
import Attendance from "./pages/HR/Attendance";
import Leave from "./pages/HR/Leave";
import Payroll from "./pages/HR/Payroll";
import Vendors from "./pages/SupplyChain/Vendors";
import PurchaseOrders from "./pages/SupplyChain/PurchaseOrders";
import Forecasting from "./pages/SupplyChain/Forecasting";
import ProjectsList from "./pages/Projects/ProjectsList";
import ProjectDetail from "./pages/Projects/ProjectDetail";
import ResourcePlanning from "./pages/Projects/ResourcePlanning";

import Integrations from "./pages/Settings/Integrations";
import Roles from "./pages/Settings/Roles";
import Users from "./pages/Settings/Users";

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
          element={<Layout><Dashboard /></Layout>}
        />

        <Route
          path="/supply-chain/vendors"
          element={<Layout><Vendors /></Layout>}
        />
        
        <Route
          path="/supply-chain/purchase-orders"
          element={<Layout><PurchaseOrders /></Layout>}
        />
        <Route
          path="/supply-chain/forecasting"
          element={<Layout><Forecasting /></Layout>}
        />

        <Route
          path="/finance/ledger"
          element={<Layout><Ledger /></Layout>}
        />

        <Route
          path="/hr/attendance"
          element={<Layout><Attendance /></Layout>}
        />
        
        <Route
          path="/hr/leave"
          element={<Layout><Leave /></Layout>}
        />
        
        <Route
          path="/hr/payroll"
          element={<Layout><Payroll /></Layout>}
        />

        <Route
          path="/finance/receivables"
          element={<Layout><Receivables /></Layout>}
        />

        <Route 
          path="/finance/payables"
          element={<Layout><Payables /></Layout>}
        />

        <Route
          path="/reports"
          element={<Layout><FinanceReports /></Layout>}
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

        <Route
          path="/projects/details"
          element={<Layout><ProjectDetail /></Layout>}
        />
        
        <Route
          path="/projects/resources"
          element={<Layout><ResourcePlanning /></Layout>}
        />
        
        <Route
          path="/settings/integrations"
          element={<Layout><Integrations /></Layout>}
        />
        
        <Route
          path="/settings/roles"
          element={<Layout><Roles /></Layout>}
        />
        
        <Route
          path="/settings/users"
          element={<Layout><Users /></Layout>}
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
