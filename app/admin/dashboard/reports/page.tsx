import AdminModulePage from "@/components/admin/AdminModulePage";

export default function Page() {
  return <AdminModulePage config={{
    title: 'Reports', amTitle: 'ሪፖርቶች',
    description: 'Review RSVP totals, attendance, invitations and check-in summaries.', amDescription: 'የRSVP ድምር፣ ተሳትፎ፣ ግብዣዎችና የመግቢያ ማረጋገጫ ማጠቃለያዎችን ይመልከቱ።',
    endpoint: '/api/admin/reports',
    fields: [],
    readOnly: true,
  }} />;
}
