import InvoicePage from "./InvoicePage";
import {
  createReceivable,
  deleteReceivable,
  fetchReceivables,
  payReceivable,
} from "../../services/financeService";

const config = {
  title: "Accounts Receivable",
  subtitle: "Track customer invoices, incoming payments, and outstanding balances.",
  listTitle: "Customer Invoices",
  searchPlaceholder: "Search customers or invoices...",
  partyColumn: "Customer",
  partyLabel: "Customer name",
  partyPlaceholder: "e.g. Acme Technologies",
  outstandingTitle: "Outstanding Receivables",
  paidTitle: "Payments Received",
  addLabel: "Add Customer Invoice",
  payLabel: "Record payment",
  emptyMessage: "No customer invoices yet. Click Add Customer Invoice to create the first one.",
  fetchAll: fetchReceivables,
  create: createReceivable,
  pay: payReceivable,
  remove: deleteReceivable,
};

const Receivables = () => <InvoicePage config={config} />;

export default Receivables;
