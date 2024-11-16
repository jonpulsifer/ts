'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { formatDistanceToNow } from 'date-fns';
import { Clock } from 'lucide-react';
import { useActionState, useState } from 'react';
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Network Tools</CardTitle>
        <CardDescription>
          Perform network diagnostics and lookups
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="tool">Tool</Label>
            <Select
              name="tool"
              value={tool}
              onValueChange={(value: Tool) => setTool(value)}
            >
              <SelectTrigger id="tool">
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

          <div className="flex flex-col space-y-2">
            <Label htmlFor="target">Target Domain/IP</Label>
            <Input
              id="target"
              name="target"
              placeholder="example.com"
              required
            />
          </div>

          <Button type="submit">Run Tool</Button>
        </form>

        {state && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Latest Result:</h3>
            {renderResult(state, tool)}
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">History</h3>
            <Accordion type="single" collapsible className="w-full">
              {history.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium">
                        {item.tool.toUpperCase()}
                      </span>
                      <span className="font-medium">{item.target}</span>
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
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Results:</div>
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
