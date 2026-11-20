
import AdminModulePage from "@/components/admin/AdminModulePage";

export default function Page() {
  return (
    <AdminModulePage
      config={{
        title: "Staff & Access",
        amTitle: "ሰራተኞች እና ፈቃድ",
        description:
          "Create and manage individual staff accounts and access roles.",
        amDescription:
          "የሰራተኞችን የግል መለያዎችና የመዳረሻ ሚናዎችን ይፍጠሩና ያስተዳድሩ።",
        endpoint: "/api/admin/staff",
        fields: [
          {
            name: "full_name",
            label: "Staff full name",
            type: "text",
            required: true,
            placeholder: "Enter full name",
          },
          {
            name: "username",
            label: "Staff username",
            type: "text",
            required: true,
            placeholder: "e.g. entrance01",
          },
          {
            name: "email",
            label: "Staff email",
            type: "email",
            required: true,
            placeholder: "Enter email address",
          },
          {
            name: "password",
            label: "Temporary password (minimum 8 characters)",
            type: "password",
            required: true,
            placeholder: "Create temporary password",
          },
          {
            name: "role",
            label: "Staff role",
            type: "select",
            required: true,
            options: [
              { label: "Staff", value: "staff" },
              { label: "Supervisor", value: "supervisor" },
            ],
          },
        ],
        readOnly: false,
      }}
    />
  );
}
