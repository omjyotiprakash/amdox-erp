import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import MyProfile from "../../pages/MyProfile";
import { fetchRegistrationOpen } from "../../services/authService";
import * as self from "../../services/selfService";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ login: vi.fn(), register: vi.fn() }),
}));
vi.mock("../../services/authService", () => ({ fetchRegistrationOpen: vi.fn() }));
vi.mock("../../services/selfService");

const renderInRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("sign-up availability", () => {
  beforeEach(() => vi.clearAllMocks());

  it("login hides 'Create account' once sign-up is closed", async () => {
    fetchRegistrationOpen.mockResolvedValue(false);
    renderInRouter(<LoginForm />);

    expect(await screen.findByText(/ask your administrator/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /create account/i })).not.toBeInTheDocument();
  });

  it("login offers 'Create account' while sign-up is open", async () => {
    fetchRegistrationOpen.mockResolvedValue(true);
    renderInRouter(<LoginForm />);

    expect(await screen.findByRole("link", { name: /create account/i })).toBeInTheDocument();
  });

  it("the register page explains that sign-up is closed instead of showing a form", async () => {
    fetchRegistrationOpen.mockResolvedValue(false);
    renderInRouter(<RegisterForm />);

    expect(await screen.findByText(/sign-up is closed/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to sign in/i })).toBeInTheDocument();
  });

  it("the register page shows the form while sign-up is open", async () => {
    fetchRegistrationOpen.mockResolvedValue(true);
    renderInRouter(<RegisterForm />);

    expect(await screen.findByLabelText(/full name/i)).toBeInTheDocument();
  });
});

describe("My Profile", () => {
  const empty = { items: [], summary: { present: 0, late: 0, absent: 0, onLeave: 0, pending: 0, approved: 0, approvedDays: 0 } };

  beforeEach(() => {
    vi.clearAllMocks();
    self.fetchMyAttendance.mockResolvedValue({ ...empty, linked: false, month: "2026-10" });
    self.fetchMyLeave.mockResolvedValue({ ...empty, linked: false });
    self.fetchMyPayslips.mockResolvedValue({ linked: false, items: [] });
  });

  it("tells an unlinked person which email HR should use, and hides the empty sections", async () => {
    self.fetchMyProfile.mockResolvedValue({ linked: false, email: "stray@amdox.com", employee: null });
    renderInRouter(<MyProfile />);

    expect(await screen.findByText(/no employee record is linked/i)).toBeInTheDocument();
    expect(screen.getByText("stray@amdox.com")).toBeInTheDocument();
    expect(screen.queryByText("My Leave")).not.toBeInTheDocument();
    expect(screen.queryByText("My Payslips")).not.toBeInTheDocument();
  });

  it("shows the person's own details and sections once linked", async () => {
    self.fetchMyProfile.mockResolvedValue({
      linked: true,
      email: "ana@amdox.com",
      employee: {
        id: "1", code: "EMP-1001", name: "Ana Rao", email: "ana@amdox.com",
        department: "Engineering", jobTitle: "Developer", joinedOn: "2025-02-10", status: "Active",
      },
    });
    self.fetchMyLeave.mockResolvedValue({
      linked: true,
      summary: { pending: 1, approved: 0, approvedDays: 0 },
      items: [{ id: "l1", type: "Casual Leave", from: "2026-10-12", to: "2026-10-13", days: 2, status: "Pending", reason: "" }],
    });
    self.fetchMyPayslips.mockResolvedValue({
      linked: true,
      items: [{ id: "p1", month: "2026-10", basicSalary: 50000, deductions: 1000, netSalary: 49000, status: "Paid" }],
    });
    renderInRouter(<MyProfile />);

    expect(await screen.findByText("Ana Rao")).toBeInTheDocument();
    expect(screen.getByText("EMP-1001")).toBeInTheDocument();
    expect(await screen.findByText("Casual Leave")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument(); // pending requests can be cancelled
    expect(await screen.findByText("₹49,000")).toBeInTheDocument();
    expect(screen.queryByText(/no employee record is linked/i)).not.toBeInTheDocument();
  });
});
