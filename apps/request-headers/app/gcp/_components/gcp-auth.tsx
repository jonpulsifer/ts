'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>GCP OIDC Authentication Demo</CardTitle>
          <CardDescription>BigQuery example using Workload Identity Federation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Authentication</h3>
            <p className="text-sm font-mono bg-muted p-3 rounded-md">
              {isVercel ? 'principal://iam.googleapis.com/projects/629296473058/locations/global/workloadIdentityPools/homelab/subject/owner:jonpulsifers-projects:project:request-headers:environment:production' : 'Application Default Credentials (gcloud auth login --update-adc)'}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">BigQuery Results</h3>
            {bigQuery.success && bigQuery.rows ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Query</p>
                  <p className="text-sm font-mono bg-muted p-3 rounded-md">
                    {bigQuery.query}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">
                    Results ({bigQuery.totalRows} rows)
                  </p>
                  <div className="bg-muted p-4 rounded-md overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {bigQuery.rows.length > 0 &&
                            Object.keys(bigQuery.rows[0]).map((key) => (
                              <th key={key} className="text-left p-2 font-semibold">
                                {key}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bigQuery.rows.map((row, idx) => (
                          <tr key={idx} className="border-b">
                            {Object.values(row).map((value: any, colIdx) => (
                              <td key={colIdx} className="p-2">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Query Failed</p>
                {bigQuery.error && (
                  <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
                    <p className="text-sm text-destructive">{bigQuery.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
