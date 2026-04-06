"use client";

import Link from "next/link";
import type { Route } from "next";

import { Card, CardContent } from "@/components/ui/card";
import type { Project } from "@/types/project";

export function PortfolioProjectList({ projects }: { projects: Project[] }) {
  if (!projects.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-ink-soft">
          No portfolio pieces yet. Mark accepted projects as portfolio items from the project detail view.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <Link key={project.id} href={`/projects/${project.id}` as Route}>
          <Card className="rounded-[28px] border border-line bg-white shadow-none transition duration-150 hover:border-blue-muted">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold tracking-tight text-ink">{project.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {[project.artist, project.client].filter(Boolean).join(" • ") || "Independent project"}
                  </p>
                </div>
                <div className="rounded-full bg-success/15 px-3 py-1.5 text-sm font-semibold text-success">Accepted</div>
              </div>

              <div className="flex flex-wrap gap-2 text-sm">
                <div className="rounded-full bg-surface-soft px-3 py-1.5 text-ink-soft">{project.project_type}</div>
                <div className="rounded-full bg-surface-soft px-3 py-1.5 text-ink-soft">
                  Accepted {formatAcceptedDate(project.accepted_at ?? project.submitted_at)}
                </div>
              </div>

              {project.portfolio_note ? (
                <div className="rounded-[20px] bg-surface-soft px-4 py-3 text-sm leading-6 text-ink-soft">
                  {project.portfolio_note}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function formatAcceptedDate(value: string | null) {
  if (!value) return "recently";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

