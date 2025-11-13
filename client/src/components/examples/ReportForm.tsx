import { ReportForm } from "../ReportForm";
import { useToast } from "@/hooks/use-toast";

export default function ReportFormExample() {
  const { toast } = useToast();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <ReportForm
        onSubmit={(report) => {
          console.log("Report submitted:", report);
          toast({
            title: "Report Submitted",
            description: "Your water issue has been reported. We'll investigate shortly.",
          });
        }}
      />
    </div>
  );
}
