"use client";

import { useActionState, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { performNetworkAction } from "@/app/actions";

type Tool = "dns" | "whois" | "ping" | "ssl";

export default function NetworkTools() {
  const [tool, setTool] = useState<Tool>("dns");
  const [state, formAction] = useActionState(
    (prevState: any, formData: FormData) => performNetworkAction(formData),
    null
  );

  const renderResult = () => {
    if (!state) return null;

    switch (tool) {
      case "dns":
        return (
          <div className="space-y-4">
            {Object.entries(state).map(
              ([recordType, records]: [string, any]) => (
                <div key={recordType}>
                  <h3 className="font-semibold">{recordType} Records:</h3>
                  {records.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {records.map((record: any, index: number) => (
                        <li key={index}>
                          {typeof record === "object"
                            ? `Priority: ${record.priority}, Exchange: ${record.exchange}`
                            : record}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No records found</p>
                  )}
                </div>
              )
            )}
          </div>
        );

      case "whois":
      case "ping":
      case "ssl":
        return (
          <pre className="bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
            {state.result}
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
      <CardContent>
        <form action={formAction} className="space-y-4">
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

        {state instanceof Error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {state && !(state instanceof Error) && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Results:</h3>
            {renderResult()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
