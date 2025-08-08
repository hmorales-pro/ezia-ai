import Link from "next/link";
import { formatDistance } from "date-fns";
import { EllipsisVertical, Settings } from "lucide-react";

import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="text-[#1E1E1E] space-y-4 group cursor-pointer">
      <Link
        href={`/projects/${project.space_id}`}
        className="relative bg-white rounded-2xl overflow-hidden h-44 w-full flex items-center justify-end flex-col px-3 border border-[#E0E0E0] shadow-md hover:shadow-lg transition-all"
      >
        <iframe
          src={`/preview/${project.space_id}`}
          frameBorder="0"
          className="absolute inset-0 w-full h-full top-0 left-0 group-hover:brightness-75 transition-all duration-200 pointer-events-none"
        ></iframe>

        <Button
          variant="default"
          className="w-full transition-all duration-200 translate-y-full group-hover:-translate-y-3"
        >
          Ouvrir le projet
        </Button>
      </Link>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[#1E1E1E] text-base font-semibold line-clamp-1">
            {project.space_id}
          </p>
          <p className="text-sm text-[#666666]">
            Mis à jour{" "}
            {formatDistance(
              new Date(project._updatedAt || Date.now()),
              new Date(),
              {
                addSuffix: true,
              }
            )}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisVertical className="text-[#666666] size-5 hover:text-[#1E1E1E] transition-colors duration-200 cursor-pointer" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuGroup>
              <a
                href={`https://huggingface.co/spaces/${project.space_id}/settings`}
                target="_blank"
              >
                <DropdownMenuItem>
                  <Settings className="size-4 text-[#666666]" />
                  Project Settings
                </DropdownMenuItem>
              </a>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
