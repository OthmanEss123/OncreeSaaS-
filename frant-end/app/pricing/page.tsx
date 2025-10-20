import { SharedLayout } from "@/components/shared-layout"
import { Button } from "@/components/ui/button"
import { CheckCircle, Star } from "lucide-react"

export default function Pricing() {
  return (
    <SharedLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
            Tarification <span className="text-primary">Simple et Transparente</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty max-w-3xl mx-auto">
            Choisissez le plan parfait pour votre entreprise. Commencez avec notre essai gratuit et passez à la version supérieure au fur et à mesure de votre croissance.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Starter Plan */}
            <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-card-foreground mb-2">Débutant</h3>
                <p className="text-muted-foreground mb-6">Parfait pour les petites équipes qui commencent</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-card-foreground">$29</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <Button variant="outline" className="w-full border-border hover:bg-muted bg-transparent">
                  Commencer l'Essai Gratuit
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Jusqu'à 5 membres d'équipe</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Gestion de projet de base</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Suivi du temps</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Facturation de base</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Support par email</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">5 Go de stockage</span>
                </div>
              </div>
            </div>

            {/* Pro Plan - Highlighted */}
            <div className="bg-primary p-8 rounded-2xl border-2 border-primary hover:shadow-xl transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-secondary text-secondary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Le Plus Populaire
                </div>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-primary-foreground mb-2">Pro</h3>
                <p className="text-primary-foreground/80 mb-6">Meilleur pour les entreprises en croissance</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary-foreground">$79</span>
                  <span className="text-primary-foreground/80">/month</span>
                </div>
                <Button variant="secondary" className="w-full bg-white text-primary hover:bg-gray-100">
                  Commencer l'Essai Gratuit
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                  <span className="text-primary-foreground">Jusqu'à 25 membres d'équipe</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                  <span className="text-primary-foreground">Gestion de projet avancée</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                  <span className="text-primary-foreground">Suivi du temps avancé et rapports</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                  <span className="text-primary-foreground">Facturation professionnelle</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                  <span className="text-primary-foreground">Fonctionnalités CRM complètes</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                  <span className="text-primary-foreground">Planification de rendez-vous</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                  <span className="text-primary-foreground">Support prioritaire</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                  <span className="text-primary-foreground">100 Go de stockage</span>
                </div>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-card-foreground mb-2">Entreprise</h3>
                <p className="text-muted-foreground mb-6">Pour les grandes organisations avec des besoins personnalisés</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-card-foreground">$199</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <Button variant="outline" className="w-full border-border hover:bg-muted bg-transparent">
                  Contacter les Ventes
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Membres d'équipe illimités</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Gestion de projet d'entreprise</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Analyses et rapports avancés</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Facturation et facturation personnalisées</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">CRM et automatisation avancés</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Accès API et intégrations</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Support dédié 24/7</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Stockage illimité</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Questions Fréquemment Posées</h2>
            <p className="text-lg text-muted-foreground">Tout ce que vous devez savoir sur notre tarification</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Puis-je changer de plan à tout moment ?</h3>
              <p className="text-muted-foreground">
                Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Les changements prennent effet immédiatement.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Y a-t-il un essai gratuit ?</h3>
              <p className="text-muted-foreground">
                Oui, nous offrons un essai gratuit de 14 jours pour tous les plans. Aucune carte de crédit requise pour commencer.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Quels modes de paiement acceptez-vous ?</h3>
              <p className="text-muted-foreground">
                Nous acceptons toutes les principales cartes de crédit, PayPal et les virements bancaires pour les plans Enterprise.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Offrez-vous des remises pour la facturation annuelle ?</h3>
              <p className="text-muted-foreground">
                Oui, économisez 20% lorsque vous choisissez la facturation annuelle sur n'importe quel plan. Contactez-nous pour des tarifs Enterprise personnalisés.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Prêt à commencer ?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'entreprises qui font confiance à OncreeSaaS pour rationaliser leurs opérations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="border-border hover:bg-muted bg-transparent">
              Planifier une Démo
            </Button>
          </div>
        </div>
      </section>
    </SharedLayout>
  )
}
