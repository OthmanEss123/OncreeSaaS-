import { SharedLayout } from "@/components/shared-layout"
import { Button } from "@/components/ui/button"
import { Users, Target, Heart, Zap, ArrowRight } from "lucide-react"
export default function About() {
  return (
    <SharedLayout>
      {/* Hero Section  */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                À propos d'<span className="text-primary">OncreeSaaS</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty">
                Nous avons pour mission de simplifier les opérations commerciales pour les équipes du monde entier. Fondée avec la vision de
                créer une plateforme tout-en-un qui grandit avec votre entreprise.
              </p>
            </div>
            <div className="relative">
              <div className="bg-card rounded-xl shadow-2xl border border-border p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">10K+</div>
                    <div className="text-sm text-muted-foreground">Utilisateurs Actifs</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">50+</div>
                    <div className="text-sm text-muted-foreground">Pays</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">99.9%</div>
                    <div className="text-sm text-muted-foreground">Disponibilité</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">24/7</div>
                    <div className="text-sm text-muted-foreground">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Notre Mission</h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            "Donner aux entreprises de toutes tailles des outils intuitifs et puissants qui rationalisent les opérations, améliorent
            la productivité et stimulent la croissance. Nous croyons que les grands logiciels doivent être accessibles, fiables et conçus
            avec l'utilisateur à l'esprit."
          </p>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Nos Valeurs</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Les principes qui guident tout ce que nous faisons chez OncreeSaaS
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Client d'Abord</h3>
              <p className="text-muted-foreground">
                Chaque décision que nous prenons est guidée par ce qui est le mieux pour nos clients et leur succès.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Innovation</h3>
              <p className="text-muted-foreground">
                Nous innovons continuellement pour rester en avance sur la courbe et fournir des solutions de pointe.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Intégrité</h3>
              <p className="text-muted-foreground">
                Nous construisons la confiance par la transparence, l'honnêteté et des pratiques commerciales éthiques.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Excellence</h3>
              <p className="text-muted-foreground">
                Nous visons l'excellence dans tout ce que nous faisons, de la qualité du produit au service client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Notre Histoire</h2>
          </div>

          <div className="space-y-8">
            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">2020</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">Le Début</h3>
                  <p className="text-muted-foreground">
                    OncreeSaaS a été fondé par une équipe d'entrepreneurs qui ont vécu de première main les défis de
                    la gestion de multiples outils commerciaux. Nous nous sommes lancés dans la création d'une plateforme unifiée qui éliminerait le
                    besoin de dizaines d'applications séparées.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">2022</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">Croissance et Expansion</h3>
                  <p className="text-muted-foreground">
                    Nous avons atteint nos premiers 1 000 clients et étendu notre équipe à l'échelle mondiale. Notre plateforme a évolué pour inclure
                    des fonctionnalités CRM avancées, la facturation automatisée et des outils complets de gestion de projet.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">2024</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">L'Innovation Continue</h3>
                  <p className="text-muted-foreground">
                    Aujourd'hui, nous servons plus de 10 000 entreprises dans le monde avec notre plateforme SaaS complète. Nous continuons
                    d'innover avec des fonctionnalités alimentées par l'IA, des analyses avancées et des intégrations transparentes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Rencontrez Notre Équipe</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Les individus passionnés derrière OncreeSaaS qui travaillent sans relâche pour rendre vos opérations commerciales fluides
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-1">Sarah Johnson</h3>
              <p className="text-primary mb-2">PDG et Fondatrice</p>
              <p className="text-muted-foreground text-sm">
                Ancienne consultante McKinsey avec plus de 15 ans d'expérience en opérations et stratégie commerciales.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-1">Michael Chen</h3>
              <p className="text-primary mb-2">CTO et Co-Fondateur</p>
              <p className="text-muted-foreground text-sm">
                Ancien ingénieur Google spécialisé dans les systèmes évolutifs et la conception d'expérience utilisateur.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-1">Emily Rodriguez</h3>
              <p className="text-primary mb-2">Responsable Produit</p>
              <p className="text-muted-foreground text-sm">
                Experte en gestion de produit avec une passion pour créer des expériences utilisateur intuitives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Rejoignez Notre Voyage</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Faites partie des milliers d'entreprises qui ont transformé leurs opérations avec OncreeSaaS.
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
