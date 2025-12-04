'use client';

import { formatDistanceToNow } from 'date-fns';
import { Clock } from 'lucide-react';
import { useActionState, useId, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { performNetworkAction } from '../actions';

type Tool = 'dns' | 'whois' | 'ping' | 'ssl';

interface ToolHistory {
  id: string;
  timestamp: Date;
  tool: Tool;
  target: string;
  result: any;
  duration: number;
}

export default function NetworkTools() {
  const toolId = useId();
  const targetId = useId();
  const [tool, setTool] = useState<Tool>('dns');
  const [history, setHistory] = useState<ToolHistory[]>([]);
  const [state, formAction] = useActionState(performNetworkAction, null);

  const handleSubmit = async (formData: FormData) => {
    const startTime = performance.now();
    const result = await formAction(formData);
    const endTime = performance.now();

    const historyItem: ToolHistory = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      tool: formData.get('tool') as Tool,
      target: formData.get('target') as string,
      result,
      duration: Math.round(endTime - startTime),
    };

    setHistory((prev) => [historyItem, ...prev]);
  };

  const renderResult = (result: any, tool: Tool) => {
    console.log('*********');
    console.log(result);
    if (result instanceof Error) {
      return (
        <Alert variant="destructive">
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      );
    }

    if (!result) {
      return null;
    }

    switch (tool) {
      case 'dns':
        return (
          <div className="space-y-4">
            {Object.entries(result.result).map(
              ([recordType, records]: [string, any]) => (
                <div key={recordType}>
                  <h3 className="font-semibold">{recordType} Records:</h3>
                  {records.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {records.map((record: any, index: number) => (
                        <li key={index}>
                          {typeof record === 'object'
                            ? `Priority: ${record.priority}, Exchange: ${record.exchange}`
                            : record}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No records found</p>
                  )}
                </div>
              ),
            )}
          </div>
        );

      case 'whois':
      case 'ping':
      case 'ssl':
        return (
          <pre className="bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap font-mono text-sm">
            {result.result}
          </pre>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full border-2 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Network Diagnostics</CardTitle>
        <CardDescription className="mt-1">
          Perform DNS lookups, WHOIS queries, ping tests, and SSL certificate
          inspections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1 flex flex-col space-y-2">
              <Label htmlFor={toolId}>Tool</Label>
              <Select
                name="tool"
                value={tool}
                onValueChange={(value: Tool) => setTool(value)}
              >
                <SelectTrigger id={toolId}>
                  <SelectValue placeholder="Select tool" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dns">DNS Lookup</SelectItem>
                  <SelectItem value="whois">WHOIS Lookup</SelectItem>
                  <SelectItem value="ping">Ping</SelectItem>
                  <SelectItem value="ssl">SSL Certificate Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3 flex flex-col space-y-2">
              <Label htmlFor={targetId}>Target Domain/IP</Label>
              <Input
                id={targetId}
                name="target"
                placeholder="example.com or 8.8.8.8"
                required
                className="font-mono"
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full md:w-auto">
            Run Tool
          </Button>
        </form>

        {state && (
          <div className="mt-4 p-4 rounded-lg border-2 bg-muted/30">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              Latest Result
              <Badge variant="outline">{tool.toUpperCase()}</Badge>
            </h3>
            {renderResult(state, tool)}
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">History</h3>
              <Badge variant="secondary">{history.length} queries</Badge>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {history.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border rounded-lg mb-2 px-4 hover:bg-muted/50 transition-colors"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4 flex-1 text-left">
                      <Badge variant="outline" className="font-semibold">
                        {item.tool.toUpperCase()}
                      </Badge>
                      <span className="font-medium font-mono">
                        {item.target}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
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
                            Duration
                          </div>
                          <div className="font-mono bg-muted/50 p-2 rounded border">
                            {item.duration}ms
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Target
                          </div>
                          <div className="font-mono bg-muted/50 p-2 rounded border">
                            {item.target}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-semibold">Results:</div>
                        {renderResult(item.result, item.tool)}
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
