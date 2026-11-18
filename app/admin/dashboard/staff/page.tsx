import AdminModulePage from "@/components/admin/AdminModulePage";

export default function Page() {
  return <AdminModulePage config={{
    title: 'Staff & Access', amTitle: 'ሰራተኞች እና ፈቃድ',
    description: 'Create and manage individual staff accounts and access roles.', amDescription: 'የሰራተኞችን የግል መለያዎችና የመዳረሻ ሚናዎችን ይፍጠሩና ያስተዳድሩ።',
    endpoint: '/api/admin/staff',
    fields: [{ name: 'full_name', label: 'Staff full name', type: 'text', required: true },
    { name: 'email', label: 'Staff email', type: 'email', required: true },
    { name: 'password', label: 'Temporary password (min. 8 characters)', type: 'text', required: true },
    { name: 'role', label: 'Role (staff / supervisor)', type: 'text', required: true }],
    readOnly: false,
  }} />;
}
