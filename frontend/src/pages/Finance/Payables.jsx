import InvoicePage from "./InvoicePage";
import { createPayable, deletePayable, fetchPayables, payPayable } from "../../services/financeService";

const config = {
  title: "Accounts Payable",
  subtitle: "Track vendor invoices, outstanding balances, and payments.",
  listTitle: "Vendor Invoices",
  searchPlaceholder: "Search vendors or invoices...",
  partyColumn: "Vendor",
  partyLabel: "Vendor name",
  partyPlaceholder: "e.g. Tech Solutions Pvt. Ltd.",
  outstandingTitle: "Outstanding Payables",
  paidTitle: "Total Paid",
  addLabel: "Add Vendor Invoice",
  payLabel: "Mark as paid",
  emptyMessage: "No vendor invoices yet. Click Add Vendor Invoice to create the first one.",
  fetchAll: fetchPayables,
  create: createPayable,
  pay: payPayable,
  remove: deletePayable,
};

const Payables = () => <InvoicePage config={config} />;

export default Payables;
