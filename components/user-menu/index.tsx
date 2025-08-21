import {
  ChartSpline,
  CirclePlus,
  FolderCode,
  Import,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks";
import { cn } from "@/lib/utils";

export const UserMenu = ({ className }: { className?: string }) => {
  const { logout, user } = useUser();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "relative flex items-center gap-2 px-2 py-1.5 h-auto font-normal hover:bg-[#F5F5F5] transition-all duration-200",
            className
          )}
        >
          <Avatar className="h-8 w-8 border-2 border-[#E0E0E0]">
            <AvatarImage src={user?.avatarUrl} alt={user?.fullname} />
            <AvatarFallback className="bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] text-white text-sm font-medium">
              {user?.fullname?.charAt(0).toUpperCase() ?? "E"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left max-lg:hidden">
            <span className="text-sm font-medium text-[#1E1E1E]">{user?.fullname}</span>
            <span className="text-xs text-[#666666]">{user?.email}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-[#666666] ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[320px] p-4" align="end">
        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg mb-3">
          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
            <AvatarImage src={user?.avatarUrl} alt={user?.fullname} />
            <AvatarFallback className="bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] text-white font-medium">
              {user?.fullname?.charAt(0).toUpperCase() ?? "E"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-[#1E1E1E]">{user?.fullname}</span>
            <span className="text-sm text-[#666666]">{user?.email}</span>
          </div>
        </div>
        
        <DropdownMenuSeparator className="my-3" />
        
        <div className="space-y-1">
          <Link href="/profile" className="block">
            <div className="flex items-center gap-3 p-3 rounded-md hover:bg-purple-50 transition-colors group cursor-pointer">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <User className="w-5 h-5 text-[#6D3FC8]" />
              </div>
              <div>
                <div className="text-sm font-medium leading-none mb-1 text-[#1E1E1E] group-hover:text-[#6D3FC8] transition-colors">
                  Mon profil
                </div>
                <p className="text-sm leading-snug text-[#666666] group-hover:text-[#1E1E1E] transition-colors">
                  Gérer mes informations
                </p>
              </div>
            </div>
          </Link>
          
          <Link href="/workspace/new" className="block">
            <div className="flex items-center gap-3 p-3 rounded-md hover:bg-purple-50 transition-colors group cursor-pointer">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <CirclePlus className="w-5 h-5 text-[#6D3FC8]" />
              </div>
              <div>
                <div className="text-sm font-medium leading-none mb-1 text-[#1E1E1E] group-hover:text-[#6D3FC8] transition-colors">
                  Nouveau projet
                </div>
                <p className="text-sm leading-snug text-[#666666] group-hover:text-[#1E1E1E] transition-colors">
                  Démarrer un nouveau projet business
                </p>
              </div>
            </div>
          </Link>
          
          <Link href="/workspace" className="block">
            <div className="flex items-center gap-3 p-3 rounded-md hover:bg-purple-50 transition-colors group cursor-pointer">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <FolderCode className="w-5 h-5 text-[#6D3FC8]" />
              </div>
              <div>
                <div className="text-sm font-medium leading-none mb-1 text-[#1E1E1E] group-hover:text-[#6D3FC8] transition-colors">
                  Mon espace de travail
                </div>
                <p className="text-sm leading-snug text-[#666666] group-hover:text-[#1E1E1E] transition-colors">
                  Tous mes projets business
                </p>
              </div>
            </div>
          </Link>
          
          <Link href="/usage" className="block">
            <div className="flex items-center gap-3 p-3 rounded-md hover:bg-purple-50 transition-colors group cursor-pointer">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <ChartSpline className="w-5 h-5 text-[#6D3FC8]" />
              </div>
              <div>
                <div className="text-sm font-medium leading-none mb-1 text-[#1E1E1E] group-hover:text-[#6D3FC8] transition-colors">
                  Utilisation
                </div>
                <p className="text-sm leading-snug text-[#666666] group-hover:text-[#1E1E1E] transition-colors">
                  Suivi de mes quotas
                </p>
              </div>
            </div>
          </Link>
          
          <Link href="/settings" className="block">
            <div className="flex items-center gap-3 p-3 rounded-md hover:bg-purple-50 transition-colors group cursor-pointer">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Settings className="w-5 h-5 text-[#6D3FC8]" />
              </div>
              <div>
                <div className="text-sm font-medium leading-none mb-1 text-[#1E1E1E] group-hover:text-[#6D3FC8] transition-colors">
                  Paramètres
                </div>
                <p className="text-sm leading-snug text-[#666666] group-hover:text-[#1E1E1E] transition-colors">
                  Configurer mon compte
                </p>
              </div>
            </div>
          </Link>
        </div>
        
        <DropdownMenuSeparator className="my-3" />
        
        <div
          onClick={() => {
            if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
              logout();
            }
          }}
          className="flex items-center gap-3 p-3 rounded-md hover:bg-red-50 transition-colors group cursor-pointer"
        >
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
            <LogOut className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="text-sm font-medium leading-none text-red-600">
              Déconnexion
            </div>
            <p className="text-sm leading-snug text-red-500 mt-1">
              Se déconnecter du compte
            </p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
