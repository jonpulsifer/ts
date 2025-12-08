'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { Webhook } from '@/lib/types';
import { WebhookDiffInline } from './webhook-diff';

interface WebhookDiffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhooks: Webhook[];
  initialBaseId?: string | null;
  initialCompareId?: string | null;
}

export function WebhookDiffModal({
  open,
  onOpenChange,
  webhooks,
  initialBaseId,
  initialCompareId,
}: WebhookDiffModalProps) {
  const [baseId, setBaseId] = useState<string | null>(
    initialBaseId || (webhooks.length > 0 ? webhooks[0].id : null),
  );
  const [compareId, setCompareId] = useState<string | null>(
    initialCompareId || (webhooks.length > 1 ? webhooks[1].id : null),
  );

  // Reset to initial values when modal opens
  useEffect(() => {
    if (open) {
      setBaseId(initialBaseId || (webhooks.length > 0 ? webhooks[0].id : null));
      setCompareId(
        initialCompareId || (webhooks.length > 1 ? webhooks[1].id : null),
      );
    }
  }, [open, initialBaseId, initialCompareId, webhooks]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[95vw] w-[95vw] h-[95vh] max-h-[95vh] flex flex-col p-0 gap-0 rounded-xl border-border/50 shadow-2xl [&>button]:z-50 translate-x-[-50%] translate-y-[-50%] top-[50%] left-[50%] sm:!max-w-[95vw] md:!max-w-[95vw] lg:!max-w-[95vw] xl:!max-w-[95vw]">
        <DialogTitle className="sr-only">Compare Webhooks</DialogTitle>
        <div className="flex-1 min-h-0 overflow-hidden px-8 pb-8 pt-8 bg-background">
          <WebhookDiffInline
            webhooks={webhooks}
            baseId={baseId}
            compareId={compareId}
            onBaseChange={setBaseId}
            onCompareChange={setCompareId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
