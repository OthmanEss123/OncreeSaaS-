import { SharedLayout } from "@/components/shared-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default function Contact() {
  return (
    <SharedLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
            Entrez en <span className="text-primary">Contact</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty max-w-3xl mx-auto">
            Vous avez des questions sur OncreeSaaS ? Nous aimerions avoir de vos nouvelles. Envoyez-nous un message et nous répondrons dès que
            possible.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Envoyez-nous un message</h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                      Prénom
                    </label>
                    <Input id="firstName" type="text" placeholder="Entrez votre prénom" className="w-full" required />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                      Nom
                    </label>
                    <Input id="lastName" type="text" placeholder="Entrez votre nom" className="w-full" required />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Adresse Email
                  </label>
                  <Input id="email" type="email" placeholder="Entrez votre adresse email" className="w-full" required />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                    Entreprise (Optionnel)
                  </label>
                  <Input id="company" type="text" placeholder="Entrez le nom de votre entreprise" className="w-full" />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Sujet
                  </label>
                  <Input id="subject" type="text" placeholder="De quoi s'agit-il ?" className="w-full" required />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Dites-nous en plus sur votre demande..."
                    className="w-full min-h-32"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Envoyer le Message
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Informations de Contact</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Écrivez-nous</h3>
                    <p className="text-muted-foreground mb-2">Notre équipe est là pour vous aider</p>
                    <a href="mailto:hello@oncreesaas.com" className="text-primary hover:underline">
                      hello@oncreesaas.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Appelez-nous</h3>
                    <p className="text-muted-foreground mb-2">Lun-Ven de 8h à 17h</p>
                    <a href="tel:+1234567890" className="text-primary hover:underline">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Visitez-nous</h3>
                    <p className="text-muted-foreground mb-2">Venez nous dire bonjour à notre bureau</p>
                    <address className="text-primary not-italic">
                      123 Business Street
                      <br />
                      Suite 100
                      <br />
                      San Francisco, CA 94105
                    </address>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Heures d'Ouverture</h3>
                    <div className="text-muted-foreground space-y-1">
                      <p>Lundi - Vendredi : 8h00 - 18h00</p>
                      <p>Samedi : 9h00 - 16h00</p>
                      <p>Dimanche : Fermé</p>
                    </div>
                  </div>
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
            <p className="text-lg text-muted-foreground">Réponses rapides aux questions courantes</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">À quelle vitesse répondez-vous ?</h3>
              <p className="text-muted-foreground">
                Nous répondons généralement à toutes les demandes dans les 24 heures pendant les jours ouvrables. Pour les questions urgentes, veuillez
                nous appeler directement.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Offrez-vous un support téléphonique ?</h3>
              <p className="text-muted-foreground">
                Oui, nous offrons un support téléphonique pour tous nos clients. Les clients Pro et Enterprise bénéficient d'un support téléphonique
                prioritaire.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Puis-je planifier une démo ?</h3>
              <p className="text-muted-foreground">
                Nous serions ravis de vous montrer comment OncreeSaaS peut aider votre entreprise. Contactez-nous pour planifier une
                démo personnalisée.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Offrez-vous des solutions personnalisées ?</h3>
              <p className="text-muted-foreground">
                Oui, nous travaillons avec les clients Enterprise pour créer des solutions personnalisées qui répondent à leurs besoins commerciaux
                spécifiques.
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
            N'attendez pas pour transformer vos opérations commerciales. Commencez votre essai gratuit aujourd'hui.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Commencer l'Essai Gratuit
          </Button>
        </div>
      </section>
    </SharedLayout>
  )
}
