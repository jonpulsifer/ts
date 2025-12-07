import { JwtDecoder } from '@/components/jwt-decoder';
import { PageHeader } from '@/components/page-header';

export default function JwtDecoderPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="JWT Decoder"
        description="Decode and inspect JSON Web Tokens (JWT) • View header, payload, and signature details"
      />
      <JwtDecoder />
    </div>
  );
}
