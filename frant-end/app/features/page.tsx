import { SharedLayout } from "@/components/shared-layout"
import { Button } from "@/components/ui/button"
import {
  Users,
  Clock,
  Calendar,
  FileText,
  CreditCard,
  CheckCircle,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react"

export default function Features() {
  return (
    <SharedLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
            Fonctionnalités Puissantes pour les <span className="text-primary">Entreprises Modernes</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty max-w-3xl mx-auto">
            Tout ce dont vous avez besoin pour gérer efficacement vos opérations commerciales. De la gestion de projet aux relations
            clients, nous avons tout couvert.
          </p>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Missions/Project Management */}
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-4">Gestion des Missions</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Organisez et suivez vos projets de la conception à la réalisation. Définissez des jalons, assignez des tâches et
                surveillez les progrès en temps réel.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Gestion de la chronologie des projets
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Attribution et suivi des tâches
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Surveillance des progrès
                </li>
              </ul>
            </div>

            {/* Time Tracking */}
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-4">Suivi du Temps</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Suivez le temps passé sur les projets et tâches avec précision. Générez des rapports détaillés et optimisez la
                productivité de votre équipe.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Suivi automatique du temps
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Rapports de temps détaillés
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Analyses de productivité
                </li>
              </ul>
            </div>

            {/* Appointments */}
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-4">Rendez-vous</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Planifiez et gérez les rendez-vous avec les clients en toute simplicité. Envoyez des rappels automatisés et synchronisez avec votre
                calendrier.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Système de réservation en ligne
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Rappels automatisés
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Intégration calendrier
                </li>
              </ul>
            </div>

            {/* Invoicing */}
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-4">Facturation</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Créez et envoyez des factures professionnelles avec des fonctionnalités de facturation automatisées. Suivez les paiements et gérez vos
                finances sans effort.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Modèles de factures professionnels
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Facturation automatisée
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Suivi des paiements
                </li>
              </ul>
            </div>

            {/* CRM */}
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-4">CRM</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Gérez efficacement vos relations clients avec nos puissants outils CRM. Suivez les interactions et nourrissez
                les prospects.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Gestion des contacts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Suivi des prospects
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Historique des communications
                </li>
              </ul>
            </div>

            {/* Analytics */}
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-4">Analyses et Rapports</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Obtenez des informations sur les performances de votre entreprise avec des analyses complètes et des rapports personnalisables.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Tableaux de bord de performance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Rapports personnalisés
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Visualisation des données
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Conçu pour les Équipes Modernes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fonctionnalités supplémentaires qui font d'OncreeSaaS le choix parfait pour votre entreprise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Sécurité d'Entreprise</h3>
              <p className="text-muted-foreground">
                Sécurité de niveau bancaire avec chiffrement de bout en bout et conformité aux normes industrielles.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Ultra Rapide</h3>
              <p className="text-muted-foreground">
                Optimisé pour la vitesse et les performances, garantissant que votre équipe reste productive.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Collaboration d'Équipe</h3>
              <p className="text-muted-foreground">
                Outils de collaboration intégrés pour garder votre équipe connectée et alignée.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Prêt à découvrir ces fonctionnalités ?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Commencez votre essai gratuit aujourd'hui et voyez comment OncreeSaaS peut transformer vos opérations commerciales.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
            Commencer l'Essai Gratuit
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>
    </SharedLayout>
  )
}
