import { SharedLayout } from "@/components/shared-layout"
import { HeroSection } from "@/components/hero-section"
import { Button } from "@/components/ui/button"
import { RoleSwitcher } from "@/components/shared/role-switcher"
import { ArrowRight, CheckCircle, Users, Clock, Calendar, FileText, CreditCard } from "lucide-react"

export default function Home() {
  return (
    <SharedLayout>
      <HeroSection />

      {/* Demo Navigation Section */}
      <section className="py-12 bg-primary/5 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Explorez les Différents Rôles Utilisateur</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Découvrez notre plateforme sous différents angles. Basculez entre les tableaux de bord Client, Consultant et Admin
              pour voir toutes les fonctionnalités en action.
            </p>
            <RoleSwitcher />
          </div>
        </div>
      </section>

      {/* Features Overview Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Tout ce dont vous avez besoin pour gérer votre entreprise
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Rationalisez vos opérations avec notre suite complète d'outils de gestion d'entreprise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Gestion CRM</h3>
              <p className="text-muted-foreground">
                Gérez efficacement vos clients et relations avec nos puissants outils CRM.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Suivi du Temps</h3>
              <p className="text-muted-foreground">Suivez le temps passé sur les projets et tâches avec précision et facilité.</p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Rendez-vous</h3>
              <p className="text-muted-foreground">Planifiez et gérez les rendez-vous avec les clients en toute simplicité.</p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Gestion de Projets</h3>
              <p className="text-muted-foreground">
                Organisez et suivez vos missions et projets du début à la fin.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Facturation</h3>
              <p className="text-muted-foreground">
                Créez et envoyez des factures professionnelles avec des fonctionnalités de facturation automatisées.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Gestion des Tâches</h3>
              <p className="text-muted-foreground">Restez organisé avec une gestion complète des tâches et des flux de travail.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Prêt à transformer votre entreprise ?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'entreprises qui font confiance à OncreeSaaS pour rationaliser leurs opérations et augmenter la productivité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
              Commencer l'Essai Gratuit
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="border-border hover:bg-muted bg-transparent">
              Planifier une Démo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Aucune carte de crédit requise • Essai gratuit de 14 jours • Annulez à tout moment
          </p>
        </div>
      </section>
    </SharedLayout>
  )
}
