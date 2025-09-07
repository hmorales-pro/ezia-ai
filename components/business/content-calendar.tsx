"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, FileText, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ContentCalendarProps {
  businessId: string;
}

export default function ContentCalendar({ businessId }: ContentCalendarProps) {
  // Pour l'instant, on affiche un placeholder
  // Plus tard, on intégrera un vrai calendrier avec la gestion des publications
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendrier éditorial
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Planifier un article
            </Button>
          </CardTitle>
          <CardDescription>
            Planifiez et organisez vos publications de contenu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Aucun article programmé</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Commencez à planifier votre contenu pour maintenir une présence régulière
            </p>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Créer votre premier article
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions de fréquence */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommandations de publication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Fréquence idéale</h4>
              <p className="text-sm text-muted-foreground">
                Pour votre secteur, nous recommandons 2-3 articles par mois
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Meilleurs jours</h4>
              <p className="text-sm text-muted-foreground">
                Publiez de préférence les mardi, mercredi et jeudi
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Types de contenu suggérés */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Types de contenu recommandés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Guide</Badge>
                <span className="text-sm">Guides pratiques et tutoriels</span>
              </div>
              <span className="text-sm text-muted-foreground">1/mois</span>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Actualité</Badge>
                <span className="text-sm">Nouvelles du secteur</span>
              </div>
              <span className="text-sm text-muted-foreground">2/mois</span>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Étude de cas</Badge>
                <span className="text-sm">Succès clients et témoignages</span>
              </div>
              <span className="text-sm text-muted-foreground">1/trimestre</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}