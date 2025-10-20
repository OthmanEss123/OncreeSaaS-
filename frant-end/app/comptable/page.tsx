// Le layout est maintenant géré par le RoleLayout dans layout.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calculator, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt,
  CreditCard,
  PieChart,
  BarChart3,
  Calendar,
  Users,
  Building2
} from "lucide-react"

export default function ComptablePage() {
  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Tableau de Bord Comptable</h1>
          <p className="text-muted-foreground">Gérez vos finances, factures et rapports comptables</p>
        </div>

        {/* Stats principales */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">€125,430</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+15%</span> ce mois-ci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Factures En Attente</CardTitle>
              <Receipt className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">€32,150</div>
              <p className="text-xs text-muted-foreground">
                12 factures en attente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paiements Reçus</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">€93,280</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-500">+8%</span> ce mois-ci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bénéfice Net</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">€28,950</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-purple-500">+12%</span> ce mois-ci
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Créer une Facture
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Receipt className="h-4 w-4 mr-2" />
                Enregistrer un Paiement
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Building2 className="h-4 w-4 mr-2" />
                Ajouter un Client
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Planifier un Rendez-vous
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Répartition des Revenus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Consulting</span>
                  </div>
                  <span className="text-sm font-medium">€45,200 (36%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Formation</span>
                  </div>
                  <span className="text-sm font-medium">€32,800 (26%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Développement</span>
                  </div>
                  <span className="text-sm font-medium">€47,430 (38%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Évolution Mensuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Graphique d'évolution</p>
                  <p className="text-xs text-muted-foreground">Revenus des 12 derniers mois</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tableau des factures récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Factures Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                <div>Numéro</div>
                <div>Client</div>
                <div>Montant</div>
                <div>Statut</div>
                <div>Date</div>
              </div>
              
              <div className="grid grid-cols-5 gap-4 text-sm items-center py-2 border-b">
                <div className="font-medium">#FAC-2024-001</div>
                <div>Entreprise ABC</div>
                <div className="font-medium">€2,500</div>
                <div><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Payée</span></div>
                <div className="text-muted-foreground">15 Jan 2024</div>
              </div>
              
              <div className="grid grid-cols-5 gap-4 text-sm items-center py-2 border-b">
                <div className="font-medium">#FAC-2024-002</div>
                <div>Société XYZ</div>
                <div className="font-medium">€4,200</div>
                <div><span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">En Attente</span></div>
                <div className="text-muted-foreground">18 Jan 2024</div>
              </div>
              
              <div className="grid grid-cols-5 gap-4 text-sm items-center py-2 border-b">
                <div className="font-medium">#FAC-2024-003</div>
                <div>Client Corp</div>
                <div className="font-medium">€1,800</div>
                <div><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">En Cours</span></div>
                <div className="text-muted-foreground">20 Jan 2024</div>
              </div>
              
              <div className="grid grid-cols-5 gap-4 text-sm items-center py-2">
                <div className="font-medium">#FAC-2024-004</div>
                <div>Startup Tech</div>
                <div className="font-medium">€3,600</div>
                <div><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Payée</span></div>
                <div className="text-muted-foreground">22 Jan 2024</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertes et notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Alertes Comptables
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800">Factures en retard</p>
                <p className="text-xs text-orange-600">3 factures sont en retard de plus de 30 jours</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">Déclaration TVA</p>
                <p className="text-xs text-blue-600">La déclaration TVA est due dans 15 jours</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Paiement reçu</p>
                <p className="text-xs text-green-600">Nouveau paiement de €2,500 reçu aujourd'hui</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}

