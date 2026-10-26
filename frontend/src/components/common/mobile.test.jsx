import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmProvider, useConfirm } from "../../context/ConfirmContext";
import { labelTableCells } from "../../hooks/useStackedTables";
import BottomNav from "./BottomNav";
import FormModal from "./FormModal";
import Sheet from "./Sheet";

let mockAuth = {};
vi.mock("../../context/AuthContext", () => ({ useAuth: () => mockAuth }));

describe("labelTableCells (phone table cards)", () => {
  const build = (html) => {
    const root = document.createElement("div");
    root.innerHTML = html;
    labelTableCells(root);
    return root;
  };

  it("copies each column heading onto its cells", () => {
    const root = build(`
      <table>
        <thead><tr><th>Employee</th><th>Department</th><th>Status</th></tr></thead>
        <tbody><tr><td>Ana</td><td>Marketing</td><td>Active</td></tr></tbody>
      </table>`);
    const cells = [...root.querySelectorAll("td")];

    expect(cells.map((cell) => cell.dataset.label)).toEqual(["Employee", "Department", "Status"]);
    expect(cells.every((cell) => cell.dataset.kind === undefined)).toBe(true);
  });

  it("marks action columns so their buttons can sit together", () => {
    const root = build(`
      <table>
        <thead><tr><th>Name</th><th>Action</th><th>Update Status</th><th>Actions</th></tr></thead>
        <tbody><tr><td>x</td><td>a</td><td>b</td><td>c</td></tr></tbody>
      </table>`);
    const kinds = [...root.querySelectorAll("td")].map((cell) => cell.dataset.kind);

    expect(kinds).toEqual([undefined, "actions", "actions", "actions"]);
  });

  it("leaves 'no results' rows alone and tolerates extra cells", () => {
    const root = build(`
      <table>
        <thead><tr><th>A</th><th>B</th></tr></thead>
        <tbody>
          <tr><td colspan="2">No results</td></tr>
          <tr><td>1</td><td>2</td><td>surplus</td></tr>
        </tbody>
      </table>`);
    const [empty, one, two, extra] = root.querySelectorAll("td");

    expect(empty.dataset.label).toBeUndefined();
    expect([one.dataset.label, two.dataset.label]).toEqual(["A", "B"]);
    expect(extra.dataset.label).toBeUndefined();
  });

  it("is safe to run repeatedly", () => {
    const root = build(`<table><thead><tr><th>A</th></tr></thead><tbody><tr><td>1</td></tr></tbody></table>`);
    labelTableCells(root);
    labelTableCells(root);
    expect(root.querySelector("td").dataset.label).toBe("A");
  });
});

describe("Sheet (the popup shell)", () => {
  it("renders above everything by living in <body>, not inside the page", () => {
    const { container } = render(
      <Sheet label="Demo" onClose={() => {}}>
        <p>Inside the sheet</p>
      </Sheet>
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.getByRole("dialog", { name: "Demo" })).toBeInTheDocument();
    expect(document.body.contains(screen.getByText("Inside the sheet"))).toBe(true);
  });

  it("closes on Escape and on a tap of the dim background, but not on a tap inside", async () => {
    const onClose = vi.fn();
    render(
      <Sheet label="Demo" onClose={onClose}>
        <button type="button">Inside</button>
      </Sheet>
    );

    await userEvent.click(screen.getByRole("button", { name: "Inside" }));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("dialog").parentElement); // the backdrop
    expect(onClose).toHaveBeenCalledTimes(1);

    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("stops the page scrolling behind it, and releases it when the last popup closes", () => {
    const first = render(<Sheet label="One" onClose={() => {}}>a</Sheet>);
    expect(document.body.style.overflow).toBe("hidden");

    const second = render(<Sheet label="Two" onClose={() => {}}>b</Sheet>);
    second.unmount();
    expect(document.body.style.overflow).toBe("hidden"); // the first popup is still open

    first.unmount();
    expect(document.body.style.overflow).toBe("");
  });
});

describe("FormModal as a popup", () => {
  it("closes on Escape without saving", async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();
    render(<FormModal title="Add" fields={[{ name: "x", label: "X" }]} onSubmit={onSubmit} onClose={onClose} />);

    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("uses 16px text on phones so iOS does not zoom in on the fields", () => {
    render(<FormModal title="Add" fields={[{ name: "x", label: "X" }]} onSubmit={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByLabelText("X").className).toContain("text-base");
  });
});

describe("ConfirmProvider", () => {
  const Harness = () => {
    const confirm = useConfirm();
    const [answer, setAnswer] = useState("none");
    return (
      <>
        <button
          type="button"
          onClick={async () =>
            setAnswer(String(await confirm({ title: "Delete it?", message: "This cannot be undone.", confirmLabel: "Delete", danger: true })))
          }
        >
          Ask
        </button>
        <p data-testid="answer">{answer}</p>
      </>
    );
  };

  const renderHarness = () =>
    render(
      <ConfirmProvider>
        <Harness />
      </ConfirmProvider>
    );

  it("shows the question and resolves true when confirmed", async () => {
    renderHarness();
    await userEvent.click(screen.getByRole("button", { name: "Ask" }));

    expect(screen.getByRole("dialog", { name: "Delete it?" })).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(screen.getByTestId("answer")).toHaveTextContent("true"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("resolves false on Cancel and on Escape", async () => {
    renderHarness();

    await userEvent.click(screen.getByRole("button", { name: "Ask" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.getByTestId("answer")).toHaveTextContent("false"));

    await userEvent.click(screen.getByRole("button", { name: "Ask" }));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByTestId("answer")).toHaveTextContent("false");
  });
});

describe("BottomNav (phone tab bar)", () => {
  const roleWith = (...modules) => ({
    permissions: Object.fromEntries(modules.map((module) => [module, { view: true }])),
  });

  const renderNav = (initialPath = "/", onMenuClick = () => {}) =>
    render(
      <MemoryRouter initialEntries={[initialPath]}>
        <BottomNav onMenuClick={onMenuClick} />
      </MemoryRouter>
    );

  beforeEach(() => {
    mockAuth = { user: { role: roleWith("finance", "hr", "supplyChain", "projects") } };
  });

  it("shows Home, Profile and at most two of the person's modules, plus Menu", () => {
    renderNav();
    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual(["Home", "Profile", "Finance", "HR"]);
    expect(screen.getByRole("button", { name: /open full menu/i })).toBeInTheDocument();
  });

  it("only offers modules the role can view", () => {
    mockAuth = { user: { role: roleWith("projects") } };
    renderNav();
    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual(["Home", "Profile", "Projects"]);
  });

  it("falls back to Home and Profile when permissions are unknown", () => {
    mockAuth = { user: null };
    renderNav();
    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual(["Home", "Profile"]);
  });

  it("highlights the tab for the section you are in, even on a deeper page", () => {
    renderNav("/hr/payroll");
    expect(screen.getByRole("link", { name: "HR" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Finance" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });

  it("opens the full menu from the Menu tab", async () => {
    const onMenuClick = vi.fn();
    renderNav("/", onMenuClick);
    await userEvent.click(screen.getByRole("button", { name: /open full menu/i }));
    expect(onMenuClick).toHaveBeenCalled();
  });
});
