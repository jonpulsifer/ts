'use client';

import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCircle2, Clock, Copy, Loader2, XCircle } from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestHistory {
  id: string;
  timestamp: Date;
  url: string;
  method: HttpMethod;
  body?: string;
  response: any;
  status: number;
  duration: number;
}

export default function ApiTester() {
  const urlId = useId();
  const methodId = useId();
  const bodyId = useId();
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const startTime = performance.now();

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method !== 'GET' && body) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      const endTime = performance.now();

      const historyItem: RequestHistory = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        url,
        method,
        body: method !== 'GET' ? body : undefined,
        response: data,
        status: res.status,
        duration: Math.round(endTime - startTime),
      };

      setHistory((prev) => [historyItem, ...prev]);
      toast.success(`Request successful (${res.status})`);
    } catch (error) {
      const endTime = performance.now();
      const historyItem: RequestHistory = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        url,
        method,
        body: method !== 'GET' ? body : undefined,
        response: { error: (error as Error).message },
        status: 0,
        duration: Math.round(endTime - startTime),
      };
      setHistory((prev) => [historyItem, ...prev]);
      toast.error(`Request failed: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-2 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">API Request Builder</CardTitle>
        <CardDescription className="mt-1">
          Build and test API requests with custom methods, headers, and body
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 flex flex-col space-y-2">
              <Label htmlFor={urlId}>Endpoint URL</Label>
              <Input
                id={urlId}
                type="url"
                placeholder="https://api.example.com/endpoint"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor={methodId}>Method</Label>
              <Select
                value={method}
                onValueChange={(value: HttpMethod) => setMethod(value)}
              >
                <SelectTrigger id={methodId}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setUrl('https://jsonplaceholder.typicode.com/posts');
                setMethod('GET');
              }}
            >
              Quick Fill
            </Button>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor={methodId}>HTTP Method</Label>
            <Select
              value={method}
              onValueChange={(value: HttpMethod) => setMethod(value)}
            >
              <SelectTrigger id={methodId}>
                <SelectValue placeholder="Select HTTP method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {method !== 'GET' && (
            <div className="flex flex-col space-y-2">
              <Label htmlFor={bodyId}>Request Body (JSON)</Label>
              <Textarea
                id={bodyId}
                placeholder='{"key": "value"}'
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="font-mono"
              />
            </div>
          )}
          <Button
            type="submit"
            disabled={loading || !url}
            size="lg"
            className="w-full md:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Request...
              </>
            ) : (
              'Send Request'
            )}
          </Button>
        </form>

        {history.length > 0 && <Separator />}

        {history.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Request History</h3>
              <Badge variant="secondary">{history.length} requests</Badge>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {history.map((item) => {
                const isSuccess = item.status >= 200 && item.status < 300;
                return (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="border rounded-lg mb-2 px-4 hover:bg-muted/50 transition-colors"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-4 flex-1 text-left">
                        <div className="flex items-center gap-2">
                          {isSuccess ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <Badge
                            variant={isSuccess ? 'default' : 'destructive'}
                            className="font-semibold"
                          >
                            {item.status || 'ERROR'}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="font-mono">
                          {item.method}
                        </Badge>
                        <span className="text-sm font-mono flex-1 truncate">
                          {item.url}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{item.duration}ms</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(item.timestamp, {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Status
                            </div>
                            <div className="font-mono bg-muted/50 p-2 rounded border">
                              {item.status || 'ERROR'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Duration
                            </div>
                            <div className="font-mono bg-muted/50 p-2 rounded border">
                              {item.duration}ms
                            </div>
                          </div>
                        </div>
                        {item.body && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold">
                                Request Body
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(item.body!, `body-${item.id}`)
                                }
                                className="h-8 w-8 p-0"
                              >
                                {copiedId === `body-${item.id}` ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <pre className="bg-muted/50 p-4 rounded-lg text-sm border font-mono">
                              {item.body}
                            </pre>
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold">
                              Response
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  JSON.stringify(item.response, null, 2),
                                  `response-${item.id}`,
                                )
                              }
                              className="h-8 w-8 p-0"
                            >
                              {copiedId === `response-${item.id}` ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-auto max-h-96 border font-mono">
                            {JSON.stringify(item.response, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
