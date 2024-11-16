'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Loader2 } from 'lucide-react';
import { useState } from 'react';

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
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RequestHistory[]>([]);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>API Tester</CardTitle>
        <CardDescription>
          Test API endpoints with different HTTP methods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="url">API Endpoint URL</Label>
            <Select
              value={url}
              onValueChange={(value: string) => setUrl(value)}
            >
              <SelectTrigger id="url">
                <SelectValue placeholder="Select API endpoint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="https://jsonplaceholder.typicode.com/posts">
                  https://jsonplaceholder.typicode.com/posts
                </SelectItem>
                <SelectItem value="https://jsonplaceholder.typicode.com/posts/1">
                  https://jsonplaceholder.typicode.com/posts/1
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="method">HTTP Method</Label>
            <Select
              value={method}
              onValueChange={(value: HttpMethod) => setMethod(value)}
            >
              <SelectTrigger id="method">
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
              <Label htmlFor="body">Request Body (JSON)</Label>
              <Textarea
                id="body"
                placeholder='{"key": "value"}'
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
              />
            </div>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Request'
            )}
          </Button>
        </form>

        {history.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Request History</h3>
            <Accordion type="single" collapsible className="w-full">
              {history.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          item.status >= 200 && item.status < 300
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {item.status || 'ERROR'}
                      </span>
                      <span className="font-mono">{item.method}</span>
                      <span className="truncate max-w-[300px]">{item.url}</span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(item.timestamp, {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Duration: {item.duration}ms
                      </div>
                      {item.body && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            Request Body:
                          </div>
                          <pre className="bg-muted p-2 rounded-md text-sm">
                            {item.body}
                          </pre>
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Response:</div>
                        <pre className="bg-muted p-2 rounded-md text-sm overflow-auto max-h-96">
                          {JSON.stringify(item.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
