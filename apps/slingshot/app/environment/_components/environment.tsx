'use client';

import { Check, Copy, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { sanitizeEnvVars } from '@/lib/sanitize-headers';

type EnvironmentProps = {
  serverEnv: Record<string, string>;
};

export default function Environment({ serverEnv }: EnvironmentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('server');
  const [clientEnv, setClientEnv] = useState<Record<string, string>>({});

  // Vercel Framework Environment Variables for Next.js
  // Reference: https://vercel.com/docs/environment-variables/framework-environment-variables
  // Used for badge detection in the UI
  const VERCEL_ENV_VARIABLES = [
    'NEXT_PUBLIC_VERCEL_ENV',
    'NEXT_PUBLIC_VERCEL_TARGET_ENV',
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

  // Compute client env on the client side to get actual values
  // IMPORTANT: Next.js only bundles NEXT_PUBLIC_* variables that are STATICALLY referenced
  // Dynamic access like process.env[key] won't work - we must reference each variable directly
  useEffect(() => {
    const rawClientEnv: Record<string, string> = {};

    // Statically reference each variable so Next.js bundles them
    // Next.js uses static analysis to determine which env vars to bundle at build time
    const envVars: Record<string, string | undefined> = {
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_ENVIRONMENT_VARIABLE:
        process.env.NEXT_PUBLIC_ENVIRONMENT_VARIABLE,
      NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
      NEXT_PUBLIC_VERCEL_TARGET_ENV: process.env.NEXT_PUBLIC_VERCEL_TARGET_ENV,
      NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
      NEXT_PUBLIC_VERCEL_BRANCH_URL: process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL,
      NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL:
        process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
      NEXT_PUBLIC_VERCEL_AUTOMATION_BYPASS_SECRET:
        process.env.NEXT_PUBLIC_VERCEL_AUTOMATION_BYPASS_SECRET,
      NEXT_PUBLIC_VERCEL_GIT_PROVIDER:
        process.env.NEXT_PUBLIC_VERCEL_GIT_PROVIDER,
      NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG:
        process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG,
      NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER:
        process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER,
      NEXT_PUBLIC_VERCEL_GIT_REPO_ID:
        process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_ID,
      NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF:
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,
      NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA:
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
      NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE:
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE,
      NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_LOGIN:
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_LOGIN,
      NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_NAME:
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_NAME,
      NEXT_PUBLIC_VERCEL_GIT_PULL_REQUEST_ID:
        process.env.NEXT_PUBLIC_VERCEL_GIT_PULL_REQUEST_ID,
    };

    // Process each variable - only include variables that are actually bundled
    for (const [key, value] of Object.entries(envVars)) {
      if (value !== undefined) {
        rawClientEnv[key] = value;
      }
      // Skip variables that aren't bundled - don't display them
    }

    // Sanitize sensitive environment variables (NEXT_PUBLIC_* vars are skipped as they're safe)
    const sanitized = sanitizeEnvVars(rawClientEnv);
    setClientEnv(sanitized);
  }, []);

  const currentEnv = activeTab === 'server' ? serverEnv : clientEnv;

  const filteredEnv = Object.entries(currentEnv).filter(
    ([key, value]) =>
      key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      value.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <Card className="w-full border-2 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Environment Variables</CardTitle>
        <CardDescription className="mt-1">
          Inspect server and client-side environment variables
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="server">
              Server
              <Badge variant="secondary" className="ml-2">
                {Object.keys(serverEnv).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="client">
              Client
              <Badge variant="secondary" className="ml-2">
                {Object.keys(clientEnv).length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search environment variables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {filteredEnv.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No environment variables match your search
                </p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Variable Name</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="w-[100px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnv.map(([key, value]) => {
                      // Check if it's a Vercel framework variable
                      const isVercelFramework = (
                        VERCEL_ENV_VARIABLES as readonly string[]
                      ).includes(key);
                      // Check if it's a Vercel system variable (starts with VERCEL_ but not a framework variable)
                      const isVercelSystem =
                        (key === 'VERCEL' || key.startsWith('VERCEL_')) &&
                        !isVercelFramework;
                      return (
                        <TableRow key={key} className="group">
                          <TableCell className="font-medium font-mono text-sm">
                            <div className="flex items-center gap-2">
                              <span>{key}</span>
                              {isVercelSystem && (
                                <Badge variant="outline" className="text-xs">
                                  System
                                </Badge>
                              )}
                              {isVercelFramework && (
                                <Badge variant="outline" className="text-xs">
                                  Framework
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-2xl">
                              <pre className="whitespace-pre-wrap break-all text-sm font-mono bg-muted/50 p-2 rounded border">
                                {value || '(empty)'}
                              </pre>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(value, key)}
                              className="h-8 w-8 p-0"
                            >
                              {copiedKey === key ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
