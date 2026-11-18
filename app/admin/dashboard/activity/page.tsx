import AdminModulePage from "@/components/admin/AdminModulePage";

export default function Page() {
  return <AdminModulePage config={{
    title: 'Activity Log', amTitle: 'የእንቅስቃሴ መዝገብ',
    description: 'Review recorded owner, administrator and staff actions.', amDescription: 'የባለቤት፣ የአስተዳዳሪና የሰራተኛ እንቅስቃሴዎችን ይመልከቱ።',
    endpoint: '/api/admin/activity',
    fields: [],
    readOnly: true,
  }} />;
}
