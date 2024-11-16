'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type InfoProps = {
  requestHeaders: Record<string, string>;
};

export default function RequestHeaders({ requestHeaders }: InfoProps) {
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
          View request headers by clicking on the headers
        </CardDescription>
      </CardHeader>
      <CardContent>{renderObject(requestHeaders)}</CardContent>
    </Card>
  );
}
