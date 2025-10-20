// Le layout est géré par le RoleLayout dans layout.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  BarChart3,
  Calendar,
  Euro,
  TrendingUp,
  FileText,
  PieChart,
  LineChart
} from "lucide-react"

export default function RapportsPage() {
  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Rapports Financiers</h1>
            <p className="text-muted-foreground">Analysez vos données financières et générez des rapports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Rapport
            </Button>
          </div>
        </div>

        {/* Menu de navigation rapide */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Tous les Rapports
          </Button>
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Revenus
          </Button>
          <Button variant="outline" size="sm">
            <PieChart className="h-4 w-4 mr-2" />
            Analyses
          </Button>
          <Button variant="outline" size="sm">
            <LineChart className="h-4 w-4 mr-2" />
            Évolutions
          </Button>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Rechercher par nom, type, période..." 
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Période
                </Button>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Type
                </Button>
                <Button variant="outline">
                  <Euro className="h-4 w-4 mr-2" />
                  Montant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Rapports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +3 ce mois-ci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenus Analysés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€245,680</div>
              <p className="text-xs text-muted-foreground">
                +8% ce mois-ci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">5</div>
              <p className="text-xs text-muted-foreground">
                Rapports en préparation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Finalisés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">19</div>
              <p className="text-xs text-muted-foreground">
                Rapports terminés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des rapports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Liste des Rapports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* En-têtes du tableau */}
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-3">
                <div className="col-span-3">Nom du Rapport</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Période</div>
                <div className="col-span-2">Montant</div>
                <div className="col-span-2">Statut</div>
                <div className="col-span-1">Actions</div>
              </div>
              
              {/* Lignes des rapports */}
              {[
                {
                  nom: "Rapport Mensuel Janvier",
                  type: "Revenus",
                  periode: "Jan 2024",
                  montant: "€45,200.00",
                  statut: "finalisé",
                  couleur: "green"
                },
                {
                  nom: "Analyse Clients Q1", 
                  type: "Analyse",
                  periode: "Q1 2024",
                  montant: "€125,400.00",
                  statut: "en cours",
                  couleur: "blue"
                },
                {
                  nom: "Rapport TVA",
                  type: "Fiscal", 
                  periode: "Jan 2024",
                  montant: "€8,900.00",
                  statut: "finalisé",
                  couleur: "green"
                },
                {
                  nom: "Évolution Chiffre d'Affaires",
                  type: "Évolution",
                  periode: "2023-2024",
                  montant: "€245,680.00", 
                  statut: "finalisé",
                  couleur: "green"
                },
                {
                  nom: "Analyse Rentabilité",
                  type: "Analyse",
                  periode: "Q4 2023",
                  montant: "€89,200.00",
                  statut: "en cours",
                  couleur: "blue"
                }
              ].map((rapport, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 text-sm items-center py-3 border-b hover:bg-muted/50 rounded-lg px-2">
                  <div className="col-span-3 font-medium">{rapport.nom}</div>
                  <div className="col-span-2">{rapport.type}</div>
                  <div className="col-span-2 text-muted-foreground">{rapport.periode}</div>
                  <div className="col-span-2 font-medium">{rapport.montant}</div>
                  <div className="col-span-2">
                    <Badge 
                      variant={rapport.couleur === "green" ? "default" : "secondary"}
                      className={
                        rapport.couleur === "green" ? "bg-green-100 text-green-800" :
                        "bg-blue-100 text-blue-800"
                      }
                    >
                      {rapport.statut}
                    </Badge>
                  </div>
                  <div className="col-span-1 flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-muted-foreground">
                Affichage de 1 à 5 sur 24 rapports
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Précédent</Button>
                <Button variant="outline" size="sm">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">Suivant</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}