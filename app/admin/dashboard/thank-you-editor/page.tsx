import AdminModulePage from "@/components/admin/AdminModulePage";

export default function Page() {
  return <AdminModulePage config={{
    title: 'Thank-You Page', amTitle: 'የምስጋና ገጽ',
    description: 'Manage the post-RSVP thank-you message and guest photo or wish prompt.', amDescription: 'ከRSVP በኋላ የሚታየውን የምስጋና መልዕክትና የእንግዳ ፎቶ/ምኞት ጥያቄ ያስተዳድሩ።',
    endpoint: '/api/admin/thank-you',
    fields: [{ name: 'heading_en', label: 'English heading', type: 'text', required: false },
    { name: 'heading_am', label: 'Amharic heading', type: 'text', required: false },
    { name: 'message_en', label: 'English message', type: 'textarea', required: false },
    { name: 'message_am', label: 'Amharic message', type: 'textarea', required: false }],
    readOnly: false,
  }} />;
}
