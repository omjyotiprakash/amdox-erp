import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ErrorBanner from "./ErrorBanner";
import FormModal from "./FormModal";
import Pagination from "./Pagination";
import Sidebar from "./Sidebar";
import PrivateRoute from "../Auth/PrivateRoute";

let mockAuth = {};
vi.mock("../../context/AuthContext", () => ({ useAuth: () => mockAuth }));

describe("ErrorBanner", () => {
  it("renders nothing without a message", () => {
    const { container } = render(<ErrorBanner message="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the message and a working retry button", async () => {
    const onRetry = vi.fn();
    render(<ErrorBanner message="Cannot reach the server" onRetry={onRetry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Cannot reach the server");
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe("Pagination", () => {
  it("is hidden when everything fits on one page", () => {
    const { container } = render(<Pagination page={1} pages={1} matching={10} limit={50} onChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the row range and moves between pages", async () => {
    const onChange = vi.fn();
    render(<Pagination page={2} pages={3} matching={120} limit={50} onChange={onChange} />);

    expect(screen.getByText("Rows 51–100 of 120")).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onChange).toHaveBeenLastCalledWith(3);
    await userEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it("disables Previous on the first page and Next on the last", () => {
    const { rerender } = render(<Pagination page={1} pages={2} matching={80} limit={50} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    rerender(<Pagination page={2} pages={2} matching={80} limit={50} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("steps back when the current page no longer exists", () => {
    const onChange = vi.fn();
    render(<Pagination page={4} pages={3} matching={120} limit={50} onChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith(3);
  });
});

describe("FormModal", () => {
  const fields = [
    { name: "description", label: "Description" },
    { name: "type", label: "Type", type: "select", options: ["Income", "Expense"] },
    { name: "employeeId", label: "Employee", type: "select", options: [{ value: "e1", label: "Aarav (EMP-1001)" }, { value: "e2", label: "Priya" }] },
  ];

  it("submits the values, defaulting selects to their first option, then closes", async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    const onClose = vi.fn();
    render(<FormModal title="Add" fields={fields} onSubmit={onSubmit} onClose={onClose} />);

    await userEvent.type(screen.getByLabelText("Description"), "Office rent");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith({ description: "Office rent", type: "Income", employeeId: "e1" });
  });

  it("shows option labels but submits their values", async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    render(<FormModal title="Add" fields={fields} onSubmit={onSubmit} onClose={() => {}} />);

    expect(screen.getByRole("option", { name: "Aarav (EMP-1001)" })).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("Employee"), "e2");
    await userEvent.type(screen.getByLabelText("Description"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].employeeId).toBe("e2");
  });

  it("keeps the dialog open and shows the server's error when saving fails", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Duplicate SKU"));
    const onClose = vi.fn();
    render(<FormModal title="Add" fields={fields} onSubmit={onSubmit} onClose={onClose} />);

    await userEvent.type(screen.getByLabelText("Description"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Duplicate SKU");
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled(); // can try again
  });

  it("cancels without submitting", async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(<FormModal title="Add" fields={fields} onSubmit={onSubmit} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("PrivateRoute", () => {
  const renderAt = () =>
    render(
      <MemoryRouter initialEntries={["/secret"]}>
        <Routes>
          <Route path="/login" element={<p>Login page</p>} />
          <Route element={<PrivateRoute />}>
            <Route path="/secret" element={<p>Secret page</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

  it("sends signed-out visitors to the login page", () => {
    mockAuth = { isAuthenticated: false, loading: false };
    renderAt();
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("waits while the session is being restored instead of redirecting", () => {
    mockAuth = { isAuthenticated: false, loading: true };
    renderAt();
    expect(screen.getByText(/loading your workspace/i)).toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });

  it("lets signed-in users through", () => {
    mockAuth = { isAuthenticated: true, loading: false };
    renderAt();
    expect(screen.getByText("Secret page")).toBeInTheDocument();
  });
});

describe("Sidebar", () => {
  const renderSidebar = () =>
    render(
      <MemoryRouter>
        <Sidebar isOpen onClose={() => {}} />
      </MemoryRouter>
    );

  const roleWith = (modules) => ({
    permissions: Object.fromEntries(modules.map((module) => [module, { view: true }])),
  });

  it("shows only the links the role may view", () => {
    mockAuth = { user: { role: roleWith(["projects", "supplyChain"]) } };
    renderSidebar();

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Vendors" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ledger" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Payroll" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "User Management" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Audit Log" })).not.toBeInTheDocument();
  });

  it("shows everything to a role with every module", () => {
    mockAuth = { user: { role: roleWith(["finance", "hr", "supplyChain", "projects", "reports", "settings"]) } };
    renderSidebar();
    expect(screen.getAllByRole("link")).toHaveLength(21);
    expect(screen.getByRole("link", { name: "Audit Log" })).toBeInTheDocument();
  });

  it("falls back to the dashboard alone when permissions are unknown", () => {
    mockAuth = { user: null };
    renderSidebar();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});
