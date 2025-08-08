"use client";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useUser } from "@/hooks";
import { Project } from "@/types";
import { redirect } from "next/navigation";
import { ProjectCard } from "./project-card";
import { LoadProject } from "./load-project";

export function MyProjects({
  projects: initialProjects,
}: {
  projects: Project[];
}) {
  const { user } = useUser();
  if (!user) {
    redirect("/");
  }
  const [projects, setProjects] = useState<Project[]>(initialProjects || []);
  return (
    <>
      <section className="max-w-[86rem] py-12 px-4 mx-auto min-h-screen">
        <header className="flex items-center justify-between max-lg:flex-col gap-4">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-[#1E1E1E]">
              <span className="capitalize">{user.fullname}</span>&apos;s
              Ezia Projects
            </h1>
            <p className="text-[#666666] text-base mt-1 max-w-xl">
              Create, manage, and explore your Ezia projects.
            </p>
          </div>
          <LoadProject
            fullXsBtn
            onSuccess={(project: Project) => {
              setProjects((prev) => [...prev, project]);
            }}
          />
        </header>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <Link
            href="/projects/new"
            className="bg-white rounded-xl h-44 flex items-center justify-center text-[#666666] border border-[#E0E0E0] hover:shadow-lg hover:text-[#6D3FC8] transition-all duration-200 shadow-md"
          >
            <Plus className="size-5 mr-1.5" />
            Create Project
          </Link>
          {projects.map((project: Project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      </section>
    </>
  );
}
