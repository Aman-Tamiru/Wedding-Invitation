import AdminModulePage from "@/components/admin/AdminModulePage";

export default function Page() {
  return <AdminModulePage config={{
    title: 'Website Editor', amTitle: 'የድረ-ገጽ አርታዒ',
    description: 'Edit the public wedding website content in English and Amharic.', amDescription: 'የህዝብ የሠርግ ድረ-ገጽ ይዘትን በእንግሊዝኛና በአማርኛ ያርትዑ።',
    endpoint: '/api/admin/website-content',
    fields: [{ name: 'section', label: 'Section key', type: 'text', required: true },
    { name: 'title_en', label: 'English title', type: 'text', required: false },
    { name: 'title_am', label: 'Amharic title', type: 'text', required: false },
    { name: 'body_en', label: 'English content', type: 'textarea', required: false },
    { name: 'body_am', label: 'Amharic content', type: 'textarea', required: false }],
    readOnly: false,
  }} />;
}
