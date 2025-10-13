import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Info = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Informazioni</h1>
            <p className="text-xl text-muted-foreground">
              Scopri di più sul nostro servizio di itinerari intelligenti
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Chi Siamo</CardTitle>
                <CardDescription>La nostra missione</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Itinerari Intelligenti utilizza l'intelligenza artificiale per creare
                  esperienze di viaggio culturale uniche e personalizzate in Italia.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Come Funziona</CardTitle>
                <CardDescription>Semplice e veloce</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Seleziona la tua destinazione, le tue preferenze e lascia che la nostra
                  AI crei per te un itinerario su misura con attività culturali selezionate.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contatti</CardTitle>
                <CardDescription>Hai domande?</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Email: info@itinerariintelligenti.it<br />
                  Telefono: +39 123 456 7890
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy</CardTitle>
                <CardDescription>I tuoi dati sono al sicuro</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Rispettiamo la tua privacy e proteggiamo i tuoi dati personali
                  secondo le normative GDPR.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Info;
