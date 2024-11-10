"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type InfoProps = {
  serverHeaders: Record<string, string>;
  serverEnv: Record<string, string>;
};

export default function RequestHeaders({
  serverHeaders,
  serverEnv,
}: InfoProps) {
  const [clientEnv, setClientEnv] = useState<Record<string, string>>({});

  useEffect(() => {
    const publicEnv = Object.fromEntries(
      Object.entries(process.env).filter(([key]) =>
        key.startsWith("NEXT_PUBLIC_")
      )
    ) as Record<string, string>;
    setClientEnv(publicEnv);
  }, []);

  const renderObject = (obj: Record<string, string>) => (
    <Accordion type="single" collapsible className="w-full">
      {Object.entries(obj).map(([key, value]) => (
        <AccordionItem key={key} value={key}>
          <AccordionTrigger>{key}</AccordionTrigger>
          <AccordionContent>
            <pre className="whitespace-pre-wrap break-all">{value}</pre>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Request Information</CardTitle>
        <CardDescription>
          View headers and environment variables
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="headers">
          <TabsList>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="env">Environment Variables</TabsTrigger>
          </TabsList>
          <TabsContent value="headers">
            <h3 className="text-lg font-semibold mb-2">Request Headers</h3>
            {renderObject(serverHeaders)}
          </TabsContent>
          <TabsContent value="env">
            <h3 className="text-lg font-semibold mb-2">
              Server Environment Variables
            </h3>
            {renderObject(serverEnv)}
            <h3 className="text-lg font-semibold mt-4 mb-2">
              Client Environment Variables
            </h3>
            {renderObject(clientEnv)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
