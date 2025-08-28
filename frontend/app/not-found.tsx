import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <Card className="max-w-md w-full p-6 text-center shadow-lg rounded-2xl">
        <CardContent>
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-600 mb-6">
            Oops! The page you’re looking for doesn’t exist.
          </p>
          <Link href="/" passHref>
            <Button className="rounded-xl px-6 py-2">Go Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
