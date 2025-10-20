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
  CreditCard,
  Calendar,
  Euro,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react"

export default function PaiementsPage() {
  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Gestion des Paiements</h1>
            <p className="text-muted-foreground">Suivez et gérez tous vos paiements</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Paiement
            </Button>
          </div>
        </div>

        {/* Menu de navigation rapide */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <CreditCard className="h-4 w-4 mr-2" />
            Tous les Paiements
          </Button>
          <Button variant="outline" size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirmés
          </Button>
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            En Attente
          </Button>
          <Button variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Échoués
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
                    placeholder="Rechercher par référence, client, montant..." 
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
              <CardTitle className="text-sm font-medium">Total Paiements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                +15% ce mois-ci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€189,450</div>
              <p className="text-xs text-muted-foreground">
                +12% ce mois-ci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">7</div>
              <p className="text-xs text-muted-foreground">
                €15,200
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Confirmés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">82</div>
              <p className="text-xs text-muted-foreground">
                €174,250
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des paiements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Liste des Paiements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* En-têtes du tableau */}
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-3">
                <div className="col-span-2">Référence</div>
                <div className="col-span-3">Client</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Montant</div>
                <div className="col-span-2">Statut</div>
                <div className="col-span-1">Actions</div>
              </div>
              
              {/* Lignes des paiements */}
              {[
                {
                  reference: "PAY-2024-001",
                  client: "Entreprise ABC",
                  date: "15/01/2024",
                  montant: "€2,500.00",
                  statut: "confirmé",
                  couleur: "green"
                },
                {
                  reference: "PAY-2024-002", 
                  client: "Société XYZ",
                  date: "18/01/2024",
                  montant: "€4,200.00",
                  statut: "en attente",
                  couleur: "orange"
                },
                {
                  reference: "PAY-2024-003",
                  client: "Client Corp",
                  date: "20/01/2024", 
                  montant: "€1,800.00",
                  statut: "échoué",
                  couleur: "red"
                },
                {
                  reference: "PAY-2024-004",
                  client: "Startup Tech",
                  date: "22/01/2024",
                  montant: "€3,600.00", 
                  statut: "confirmé",
                  couleur: "green"
                },
                {
                  reference: "PAY-2024-005",
                  client: "Groupe Alpha",
                  date: "25/01/2024",
                  montant: "€5,200.00",
                  statut: "en attente",
                  couleur: "orange"
                }
              ].map((paiement, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 text-sm items-center py-3 border-b hover:bg-muted/50 rounded-lg px-2">
                  <div className="col-span-2 font-medium">{paiement.reference}</div>
                  <div className="col-span-3">{paiement.client}</div>
                  <div className="col-span-2 text-muted-foreground">{paiement.date}</div>
                  <div className="col-span-2 font-medium">{paiement.montant}</div>
                  <div className="col-span-2">
                    <Badge 
                      variant={paiement.couleur === "green" ? "default" : paiement.couleur === "orange" ? "secondary" : "destructive"}
                      className={
                        paiement.couleur === "green" ? "bg-green-100 text-green-800" :
                        paiement.couleur === "orange" ? "bg-orange-100 text-orange-800" :
                        "bg-red-100 text-red-800"
                      }
                    >
                      {paiement.statut}
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
                Affichage de 1 à 5 sur 89 paiements
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