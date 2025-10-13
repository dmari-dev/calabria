import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Affiliates = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Programma Affiliazione</h1>
            <p className="text-xl text-muted-foreground">
              Guadagna condividendo Itinerari Intelligenti
            </p>
          </div>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Diventa Affiliato</CardTitle>
              <CardDescription>Guadagna commissioni sui referral</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Unisciti al nostro programma di affiliazione e guadagna commissioni
                ogni volta che un utente si iscrive tramite il tuo link personale.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Commissione del 20% su ogni abbonamento</li>
                <li>Dashboard dedicata per monitorare le tue performance</li>
                <li>Materiali marketing pronti all'uso</li>
                <li>Pagamenti mensili garantiti</li>
              </ul>
              <Button asChild className="w-full">
                <Link to="/auth">Inizia Ora</Link>
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>1. Registrati</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Crea il tuo account e accedi al programma affiliazione
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Condividi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Usa il tuo link personale per promuovere il servizio
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Guadagna</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ricevi commissioni per ogni nuovo utente registrato
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Affiliates;
