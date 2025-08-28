import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <Card className="max-w-md w-full p-6 text-center shadow-lg rounded-2xl">
        <CardContent>
          <h1 className="text-4xl font-bold mb-4">HOMIE</h1>
        </CardContent>
      </Card>
    </div>
  );
}
