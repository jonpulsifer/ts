'use client';

import { AlertCircle, CheckCircle2, Copy, FileJson, Key } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  rawHeader: string;
  rawPayload: string;
  isValid: boolean;
  error?: string;
}

const codeStyle = {
  ...dracula,
  'pre[class*="language-"]': {
    ...(dracula['pre[class*="language-"]'] as object),
    background: 'transparent',
    margin: 0,
  },
  'code[class*="language-"]': {
    ...(dracula['code[class*="language-"]'] as object),
    background: 'transparent',
  },
};

const codeCustomStyle = {
  background: 'transparent',
  margin: 0,
  padding: '1rem',
  fontSize: '13px',
  fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
  lineHeight: '20px',
};

function decodeBase64Url(base64Url: string): string {
  try {
    // Replace URL-safe characters
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

    // Decode
    return decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => {
          return `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`;
        })
        .join(''),
    );
  } catch (_error) {
    throw new Error('Invalid base64url encoding');
  }
}

function decodeJwt(token: string): DecodedJwt {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid JWT format. Expected 3 parts separated by dots.');
  }

  const [headerPart, payloadPart, signaturePart] = parts;

  try {
    const rawHeader = decodeBase64Url(headerPart);
    const rawPayload = decodeBase64Url(payloadPart);

    const header = JSON.parse(rawHeader);
    const payload = JSON.parse(rawPayload);

    return {
      header,
      payload,
      signature: signaturePart,
      rawHeader,
      rawPayload,
      isValid: true,
    };
  } catch (error) {
    return {
      header: {},
      payload: {},
      signature: signaturePart,
      rawHeader: '',
      rawPayload: '',
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

function getClaimDescription(key: string): string | null {
  const descriptions: Record<string, string> = {
    iss: 'Issuer - Identifies the principal that issued the JWT',
    sub: 'Subject - Identifies the principal that is the subject of the JWT',
    aud: 'Audience - Identifies the recipients that the JWT is intended for',
    exp: 'Expiration Time - Identifies the expiration time on or after which the JWT must not be accepted',
    nbf: 'Not Before - Identifies the time before which the JWT must not be accepted',
    iat: 'Issued At - Identifies the time at which the JWT was issued',
    jti: 'JWT ID - Provides a unique identifier for the JWT',
    alg: 'Algorithm - Identifies the cryptographic algorithm used to secure the JWT',
    typ: 'Type - Declares the media type of the JWT',
    kid: 'Key ID - Hints which key was used to secure the JWT',
  };
  return descriptions[key] || null;
}

export function JwtDecoder() {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);

  // Auto-decode on token change
  useEffect(() => {
    if (!token.trim()) {
      setDecoded(null);
      return;
    }

    try {
      const result = decodeJwt(token.trim());
      setDecoded(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setDecoded({
        header: {},
        payload: {},
        signature: '',
        rawHeader: '',
        rawPayload: '',
        isValid: false,
        error: errorMessage,
      });
    }
  }, [token]);

  const jwtParts = useMemo(() => {
    if (!token.trim()) return [];
    return token.trim().split('.');
  }, [token]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const headerJson = useMemo(() => {
    if (!decoded?.rawHeader) return '';
    try {
      return JSON.stringify(JSON.parse(decoded.rawHeader), null, 2);
    } catch {
      return decoded.rawHeader;
    }
  }, [decoded?.rawHeader]);

  const payloadJson = useMemo(() => {
    if (!decoded?.rawPayload) return '';
    try {
      return JSON.stringify(JSON.parse(decoded.rawPayload), null, 2);
    } catch {
      return decoded.rawPayload;
    }
  }, [decoded?.rawPayload]);

  const isExpired = useMemo(() => {
    if (!decoded?.payload?.exp) return null;
    const exp = decoded.payload.exp as number;
    return Date.now() / 1000 > exp;
  }, [decoded?.payload]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            JWT Token Input
          </CardTitle>
          <CardDescription>
            Paste your JWT token below to decode and inspect its contents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jwt-input">JWT Token</Label>
            <Input
              id="jwt-input"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="font-mono text-sm"
            />
            {jwtParts.length === 3 && (
              <div className="p-3 bg-muted/30 rounded-md border border-border/50 font-mono text-xs break-all">
                {jwtParts.map((part, i) => (
                  <span key={i}>
                    {i > 0 && <span className="text-primary font-bold">.</span>}
                    <span
                      className={
                        i === 0
                          ? 'text-blue-400'
                          : i === 1
                            ? 'text-green-400'
                            : 'text-purple-400'
                      }
                    >
                      {part}
                    </span>
                  </span>
                ))}
              </div>
            )}
            {decoded && !decoded.isValid && decoded.error && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                {decoded.error}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {decoded?.isValid ? (
        <div className="space-y-4">
          {/* Decoded Sections */}
          <Tabs defaultValue="payload" className="w-full">
            <div className="flex items-center justify-between gap-4 mb-4">
              <TabsList className="inline-flex h-9">
                <TabsTrigger value="header" className="px-3">
                  Header
                </TabsTrigger>
                <TabsTrigger value="payload" className="px-3">
                  Payload
                </TabsTrigger>
                <TabsTrigger value="signature" className="px-3">
                  Signature
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                {isExpired !== null && (
                  <Badge
                    variant={isExpired ? 'destructive' : 'default'}
                    className="text-xs"
                  >
                    {isExpired ? (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Expired
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Valid
                      </>
                    )}
                  </Badge>
                )}
                {decoded?.payload?.exp != null && (
                  <Badge variant="outline" className="text-xs font-normal">
                    Exp: {formatDate(decoded.payload.exp as number)}
                  </Badge>
                )}
              </div>
            </div>

            <TabsContent value="header" className="mt-0">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Header</CardTitle>
                      <CardDescription className="text-xs">
                        Contains metadata about the token and the signing
                        algorithm
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(headerJson, 'Header')}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ScrollArea className="h-[400px] rounded-md border border-border/50">
                      <SyntaxHighlighter
                        language="json"
                        style={codeStyle}
                        customStyle={codeCustomStyle}
                        showLineNumbers
                        wrapLongLines
                      >
                        {headerJson}
                      </SyntaxHighlighter>
                    </ScrollArea>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Claims:</p>
                      <div className="space-y-1">
                        {Object.entries(decoded.header).map(([key, value]) => {
                          const description = getClaimDescription(key);
                          return (
                            <div
                              key={key}
                              className="flex items-start gap-2 text-sm"
                            >
                              <code className="font-mono bg-muted px-2 py-0.5 rounded text-xs">
                                {key}
                              </code>
                              <span className="text-muted-foreground">:</span>
                              <span className="font-mono text-xs">
                                {typeof value === 'string'
                                  ? `"${value}"`
                                  : String(value)}
                              </span>
                              {description && (
                                <span className="text-muted-foreground text-xs ml-2">
                                  • {description}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payload" className="mt-0">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Payload</CardTitle>
                      <CardDescription className="text-xs">
                        Contains the claims (data) of the token
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(payloadJson, 'Payload')}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ScrollArea className="h-[400px] rounded-md border border-border/50">
                      <SyntaxHighlighter
                        language="json"
                        style={codeStyle}
                        customStyle={codeCustomStyle}
                        showLineNumbers
                        wrapLongLines
                      >
                        {payloadJson}
                      </SyntaxHighlighter>
                    </ScrollArea>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Claims:</p>
                      <div className="space-y-1">
                        {Object.entries(decoded.payload).map(([key, value]) => {
                          const description = getClaimDescription(key);
                          let displayValue: string;

                          // Format special claim types
                          if (key === 'exp' || key === 'nbf' || key === 'iat') {
                            displayValue = formatDate(value as number);
                          } else if (
                            typeof value === 'object' &&
                            value !== null
                          ) {
                            displayValue = JSON.stringify(value);
                          } else {
                            displayValue = String(value);
                          }

                          return (
                            <div
                              key={key}
                              className="flex items-start gap-2 text-sm flex-wrap"
                            >
                              <code className="font-mono bg-muted px-2 py-0.5 rounded text-xs">
                                {key}
                              </code>
                              <span className="text-muted-foreground">:</span>
                              <span className="font-mono text-xs break-all">
                                {typeof value === 'string'
                                  ? `"${displayValue}"`
                                  : displayValue}
                              </span>
                              {description && (
                                <span className="text-muted-foreground text-xs ml-2">
                                  • {description}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signature" className="mt-0">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Signature</CardTitle>
                      <CardDescription className="text-xs">
                        Used to verify the token hasn't been tampered with
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(decoded.signature, 'Signature')}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-md border border-border/50">
                      <code className="text-xs font-mono break-all">
                        {decoded.signature}
                      </code>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        The signature is a base64url-encoded string that
                        verifies the integrity of the token. It is created by
                        signing the header and payload with a secret key using
                        the algorithm specified in the header.
                      </p>
                      <p className="mt-2">
                        <strong>Note:</strong> This decoder does not verify the
                        signature. To verify a JWT, you need the secret key or
                        public key used to sign it.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center text-center">
              <FileJson className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-sm">
                Paste a JWT token above to decode and inspect its contents
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
