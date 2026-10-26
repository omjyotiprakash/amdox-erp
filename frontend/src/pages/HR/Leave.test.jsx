import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Leave from "./Leave";
import { fetchEmployees, fetchLeave } from "../../services/hrService";

vi.mock("../../services/hrService");

const request = (overrides) => ({
  id: "1",
  code: "LV-1001",
  type: "Casual Leave",
  from: "2026-10-12",
  to: "2026-10-13",
  days: 2,
  reason: "",
  status: "Pending",
  employee: { name: "Priya Das", department: "HR" },
  canDecide: true,
  blockedReason: null,
  ...overrides,
});

const rowFor = (text) => screen.getByText(text).closest("tr");

describe("Leave Management approvals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchEmployees.mockResolvedValue({ items: [] });
  });

  it("offers Approve and Reject only on requests the user is allowed to decide", async () => {
    fetchLeave.mockResolvedValue({
      total: 3,
      page: 1,
      pages: 1,
      matching: 3,
      limit: 50,
      summary: { total: 3, pending: 2, approved: 1, approvedDays: 2 },
      items: [
        request({ id: "a", employee: { name: "Allowed Person", department: "HR" } }),
        request({
          id: "b",
          employee: { name: "Own Leave Person", department: "HR" },
          canDecide: false,
          blockedReason: "You cannot approve or reject your own leave. Ask another approver.",
        }),
        request({ id: "c", employee: { name: "Settled Person", department: "HR" }, status: "Approved", canDecide: false }),
      ],
    });
    render(<Leave />);

    await screen.findByText("Allowed Person");
    const allowed = rowFor("Allowed Person");
    expect(within(allowed).getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(within(allowed).getByRole("button", { name: "Reject" })).toBeInTheDocument();

    const own = rowFor("Own Leave Person");
    expect(within(own).queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(within(own).queryByRole("button", { name: "Reject" })).not.toBeInTheDocument();
    expect(within(own).getByText(/cannot approve or reject your own leave/i)).toBeInTheDocument();

    const settled = rowFor("Settled Person");
    expect(within(settled).queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(within(settled).getByText("Completed")).toBeInTheDocument();
  });

  it("explains a blocked request even when the server sent no reason", async () => {
    fetchLeave.mockResolvedValue({
      total: 1, page: 1, pages: 1, matching: 1, limit: 50,
      summary: { total: 1, pending: 1, approved: 0, approvedDays: 0 },
      items: [request({ canDecide: false, blockedReason: null })],
    });
    render(<Leave />);

    expect(await screen.findByText("Awaiting an approver")).toBeInTheDocument();
  });
});
