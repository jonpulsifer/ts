'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type BigQueryData = {
  success: boolean;
  query?: string;
  rows?: any[];
  totalRows?: number;
  error?: string;
};

type GcpAuthProps = {
  isVercel: boolean;
  bigQuery: BigQueryData;
};

export default function GcpAuth({ isVercel, bigQuery }: GcpAuthProps) {
  return (
    <div className="space-y-6">
      <Card className="w-full border-2 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Authentication Method</CardTitle>
          <CardDescription className="mt-1">
            {isVercel
              ? 'Using Workload Identity Federation with Vercel OIDC'
              : 'Using Application Default Credentials'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Principal
            </div>
            <p className="text-sm font-mono bg-gradient-to-r from-muted to-muted/50 p-4 rounded-lg border break-all">
              {isVercel
                ? 'principal://iam.googleapis.com/projects/629296473058/locations/global/workloadIdentityPools/homelab/subject/owner:jonpulsifers-projects:project:request-headers:environment:production'
                : 'Application Default Credentials (gcloud auth login --update-adc)'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full border-2 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">BigQuery Results</CardTitle>
              <CardDescription className="mt-1">
                Query executed using authenticated GCP client
              </CardDescription>
            </div>
            {bigQuery.success && (
              <Badge variant="default" className="text-sm">
                Success
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {bigQuery.success && bigQuery.rows ? (
            <>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  SQL Query
                </div>
                <p className="text-sm font-mono bg-gradient-to-r from-muted to-muted/50 p-4 rounded-lg border">
                  {bigQuery.query}
                </p>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Query Results</div>
                  <Badge variant="secondary">
                    {bigQuery.totalRows} row
                    {bigQuery.totalRows !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {bigQuery.rows.length > 0 &&
                          Object.keys(bigQuery.rows[0]).map((key) => (
                            <TableHead key={key} className="font-semibold">
                              {key}
                            </TableHead>
                          ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bigQuery.rows.map((row, idx) => (
                        <TableRow key={idx}>
                          {Object.values(row).map((value: any, colIdx) => (
                            <TableCell
                              key={colIdx}
                              className="font-mono text-sm"
                            >
                              {value}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-destructive">
                Query Failed
              </div>
              {bigQuery.error && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-sm text-destructive font-mono">
                    {bigQuery.error}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
