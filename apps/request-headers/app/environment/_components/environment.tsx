"use client";

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

type EnvironmentProps = {
  serverEnv: Record<string, string>;
};

export default function Environment({ serverEnv }: EnvironmentProps) {
  const clientEnv: Record<string, string> = {
    NEXT_PUBLIC_ENVIRONMENT_VARIABLE:
      process.env.NEXT_PUBLIC_ENVIRONMENT_VARIABLE || "",
    POD_NAME: process.env.POD_NAME || "",
  };

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
        <Tabs defaultValue="server">
          <TabsList>
            <TabsTrigger value="server">Server Environment</TabsTrigger>
            <TabsTrigger value="client">Client Environment</TabsTrigger>
          </TabsList>
          <TabsContent value="server">
            <h3 className="text-lg font-semibold mb-2">
              Server Environment Variables
            </h3>
            {renderObject(serverEnv)}
          </TabsContent>
          <TabsContent value="client">
            <h3 className="text-lg font-semibold mb-2">Client Environment</h3>
            {renderObject(clientEnv)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
