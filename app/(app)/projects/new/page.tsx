import { ProjectForm } from "@/components/forms/project-form";
import { PageHeader } from "@/components/layout/page-header";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New project"
        description="Add a commissioned song and start tracking the writing workflow from intake to submission."
      />
      <ProjectForm />
    </div>
  );
}
