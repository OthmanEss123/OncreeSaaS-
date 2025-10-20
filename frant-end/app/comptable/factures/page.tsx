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
  FileText,
  Calendar,
  Euro
} from "lucide-react"

export default function FacturesPage() {
  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Gestion des Factures</h1>
            <p className="text-muted-foreground">Créez, gérez et suivez vos factures</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Facture
            </Button>
          </div>
        </div>

        {/* Menu de navigation rapide */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Toutes les Factures
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            En Attente
          </Button>
          <Button variant="outline" size="sm">
            <Euro className="h-4 w-4 mr-2" />
            Payées
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            En Retard
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
                    placeholder="Rechercher par numéro, client, montant..." 
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
                  Statut
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
              <CardTitle className="text-sm font-medium">Total Factures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                +12% ce mois-ci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
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
              <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">23</div>
              <p className="text-xs text-muted-foreground">
                €32,150
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Payées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">133</div>
              <p className="text-xs text-muted-foreground">
                €213,530
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des factures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Liste des Factures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* En-têtes du tableau */}
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-3">
                <div className="col-span-2">Numéro</div>
                <div className="col-span-3">Client</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Montant</div>
                <div className="col-span-2">Statut</div>
                <div className="col-span-1">Actions</div>
              </div>
              
              {/* Lignes des factures */}
              {[
                {
                  numero: "FAC-2024-001",
                  client: "Entreprise ABC",
                  date: "15/01/2024",
                  montant: "€2,500.00",
                  statut: "payée",
                  couleur: "green"
                },
                {
                  numero: "FAC-2024-002", 
                  client: "Société XYZ",
                  date: "18/01/2024",
                  montant: "€4,200.00",
                  statut: "en attente",
                  couleur: "orange"
                },
                {
                  numero: "FAC-2024-003",
                  client: "Client Corp",
                  date: "20/01/2024", 
                  montant: "€1,800.00",
                  statut: "en cours",
                  couleur: "blue"
                },
                {
                  numero: "FAC-2024-004",
                  client: "Startup Tech",
                  date: "22/01/2024",
                  montant: "€3,600.00", 
                  statut: "payée",
                  couleur: "green"
                },
                {
                  numero: "FAC-2024-005",
                  client: "Groupe Alpha",
                  date: "25/01/2024",
                  montant: "€5,200.00",
                  statut: "en attente",
                  couleur: "orange"
                }
              ].map((facture, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 text-sm items-center py-3 border-b hover:bg-muted/50 rounded-lg px-2">
                  <div className="col-span-2 font-medium">{facture.numero}</div>
                  <div className="col-span-3">{facture.client}</div>
                  <div className="col-span-2 text-muted-foreground">{facture.date}</div>
                  <div className="col-span-2 font-medium">{facture.montant}</div>
                  <div className="col-span-2">
                    <Badge 
                      variant={facture.couleur === "green" ? "default" : facture.couleur === "orange" ? "secondary" : "outline"}
                      className={
                        facture.couleur === "green" ? "bg-green-100 text-green-800" :
                        facture.couleur === "orange" ? "bg-orange-100 text-orange-800" :
                        "bg-blue-100 text-blue-800"
                      }
                    >
                      {facture.statut}
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
                Affichage de 1 à 5 sur 156 factures
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

