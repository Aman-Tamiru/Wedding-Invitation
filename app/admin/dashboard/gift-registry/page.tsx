import AdminModulePage from "@/components/admin/AdminModulePage";

export default function Page() {
  return <AdminModulePage config={{
    title: 'Gift Registry', amTitle: 'የስጦታ መዝገብ',
    description: 'Manage registry entries and review gift contribution records.', amDescription: 'የስጦታ መዝገቦችንና የስጦታ አስተዋጽኦ መረጃዎችን ያስተዳድሩ።',
    endpoint: '/api/admin/gifts',
    fields: [{ name: 'title', label: 'Gift or registry title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: false },
    { name: 'amount', label: 'Amount (optional)', type: 'number', required: false },
    { name: 'payment_reference', label: 'Payment/reference details', type: 'text', required: false }],
    readOnly: false,
  }} />;
}
