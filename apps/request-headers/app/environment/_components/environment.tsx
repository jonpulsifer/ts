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

type EnvironmentProps = {
  serverEnv: Record<string, string>;
};

export default function Environment({ serverEnv }: EnvironmentProps) {
  const MY_NEXTJS_BUNDLED_ENVIRONMENT_VARIABLES = [
    'NEXT_PUBLIC_ENVIRONMENT_VARIABLE',
  ];
  const VERCEL_ENV_VARIABLES = [
    'NEXT_PUBLIC_VERCEL_ENV',
    'NEXT_PUBLIC_VERCEL_URL',
    'NEXT_PUBLIC_VERCEL_BRANCH_URL',
    'NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL',
    'NEXT_PUBLIC_VERCEL_AUTOMATION_BYPASS_SECRET',
    'NEXT_PUBLIC_VERCEL_GIT_PROVIDER',
    'NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG',
    'NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER',
    'NEXT_PUBLIC_VERCEL_GIT_REPO_ID',
    'NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF',
    'NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA',
    'NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE',
    'NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_LOGIN',
    'NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_NAME',
    'NEXT_PUBLIC_VERCEL_GIT_PULL_REQUEST_ID',
  ] as const;

  const clientEnv: Record<string, string> = Object.fromEntries(
    [...MY_NEXTJS_BUNDLED_ENVIRONMENT_VARIABLES, ...VERCEL_ENV_VARIABLES].map(
      (key) => [key, process.env[key] || ''],
    ),
  );

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
        <CardTitle>Environment Variables</CardTitle>
        <CardDescription>
          View server and client environment variables
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
