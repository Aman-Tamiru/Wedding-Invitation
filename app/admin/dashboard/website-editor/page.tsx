
import AdminModulePage from "@/components/admin/AdminModulePage";

export default function Page() {
  return (
    <AdminModulePage
      config={{
        title: "Wedding Website Content",
        amTitle: "የሠርግ ድረ-ገጽ ይዘት",
        description:
          "Edit the public wedding website's English and Amharic text and section content.",
        amDescription:
          "በሕዝብ የሚታየውን የሠርግ ድረ-ገጽ የእንግሊዝኛና የአማርኛ ጽሑፎችን እና የክፍሎችን ይዘት ያስተካክሉ።",
        endpoint: "/api/admin/website-content",
        formTitle: "Add or Edit Website Content",
        amFormTitle: "የድረ-ገጽ ይዘት ያስገቡ ወይም ያስተካክሉ",
        submitLabel: "Save Website Content",
        amSubmitLabel: "የድረ-ገጽ ይዘትን አስቀምጥ",
        savingLabel: "Saving Website Content...",
        amSavingLabel: "የድረ-ገጽ ይዘት በመቀመጥ ላይ...",
        fields: [
          { name: "section", label: "Section key", type: "text", required: true },
          { name: "title_en", label: "English title", type: "text" },
          { name: "title_am", label: "Amharic title", type: "text" },
          { name: "body_en", label: "English content", type: "textarea" },
          { name: "body_am", label: "Amharic content", type: "textarea" },
        ],
        readOnly: false,
      }}
    />
  );
}
