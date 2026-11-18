import AdminModulePage from "@/components/admin/AdminModulePage";

export default function Page() {
  return <AdminModulePage config={{
    title: 'Settings', amTitle: 'ቅንብሮች',
    description: 'Manage wedding administration preferences and protected system settings.', amDescription: 'የሠርግ አስተዳደር ምርጫዎችንና የተጠበቁ የስርዓት ቅንብሮችን ያስተዳድሩ።',
    endpoint: '/api/admin/settings',
    fields: [{ name: 'wedding_title', label: 'Wedding title', type: 'text', required: false },
    { name: 'venue', label: 'Venue', type: 'text', required: false },
    { name: 'event_date', label: 'Wedding date', type: 'date', required: false },
    { name: 'contact_email', label: 'Contact email', type: 'email', required: false }],
    readOnly: false,
  }} />;
}
