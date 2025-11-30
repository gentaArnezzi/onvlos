"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, UserPlus, Crown, Shield, User } from "lucide-react";
import { addFlowMember } from "@/actions/flows";
import { Language } from "@/lib/i18n/translations";
import { useTranslation } from "@/lib/i18n/context";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface FlowMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: Date | null;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
}

interface Flow {
  id: string;
  members: FlowMember[];
}

interface FlowTeamsTabProps {
  flow: Flow;
  language: Language;
}

export function FlowTeamsTab({ flow, language }: FlowTeamsTabProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [addingMember, setAddingMember] = useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3" />;
      case "admin":
        return <Shield className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-700";
      case "admin":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="border border-[#EDEDED] shadow-lg bg-white h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-primary text-[#02041D]">
            {t("flows.teams", language)}
          </h3>
          <Button 
            size="sm" 
            className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white font-primary"
            onClick={() => setAddingMember(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {t("flows.addMember", language)}
          </Button>
        </div>

        <div className="space-y-3">
          {flow.members.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-primary text-[#606170] mb-4">
                {t("flows.noMembers", language)}
              </p>
              <Button 
                variant="outline" 
                className="font-primary"
                onClick={() => setAddingMember(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("flows.addFirstMember", language)}
              </Button>
            </div>
          ) : (
            flow.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-[#EDEDED] rounded-lg hover:bg-[#EDEDED] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.user?.image || undefined} />
                    <AvatarFallback className="bg-[#0A33C6] text-white">
                      {member.user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium font-primary text-[#02041D]">
                      {member.user?.name || "Unknown User"}
                    </p>
                    <p className="text-sm font-primary text-[#606170]">
                      {member.user?.email}
                    </p>
                  </div>
                </div>
                <Badge className={getRoleColor(member.role)}>
                  <span className="flex items-center gap-1">
                    {getRoleIcon(member.role)}
                    <span className="capitalize">{member.role}</span>
                  </span>
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

