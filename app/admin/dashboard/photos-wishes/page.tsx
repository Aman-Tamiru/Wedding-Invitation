import AdminModulePage from "@/components/admin/AdminModulePage";

export default function Page() {
  return <AdminModulePage config={{
    title: 'Photos & Wishes', amTitle: 'ፎቶዎች እና ምኞቶች',
    description: 'Review guest-submitted photos and personal wedding wishes.', amDescription: 'እንግዶች የላኳቸውን ፎቶዎችና የግል የሠርግ ምኞቶችን ይመልከቱ።',
    endpoint: '/api/admin/photos-wishes',
    fields: [],
    readOnly: true,
  }} />;
}
