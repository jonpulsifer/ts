import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useFetcher } from 'react-router';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import type { Host, Profile } from '~/db/schema';

const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

const editFormSchema = z.object({
  hostname: z.string().optional(),
  profileId: z.string().optional(),
  variables: z.string().optional(),
});

const createFormSchema = editFormSchema.extend({
  macAddress: z
    .string()
    .min(1, 'MAC address is required')
    .regex(MAC_REGEX, 'Invalid MAC address format (e.g., 00:11:22:33:44:55)'),
});

function isValidJson(str: string): boolean {
  if (!str.trim()) return true;
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === 'object' && parsed !== null;
  } catch {
    return false;
  }
}

interface EditHostDialogProps {
  host?: Host | null;
  profiles: Profile[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditHostDialog({
  host,
  profiles,
  open,
  onOpenChange,
}: EditHostDialogProps) {
  const fetcher = useFetcher();
  const isLoading = fetcher.state !== 'idle';
  const isCreateMode = !host;

  const form = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(isCreateMode ? createFormSchema : editFormSchema),
    defaultValues: {
      macAddress: '',
      hostname: host?.hostname || '',
      profileId: host?.profileId?.toString() || 'none',
      variables: host?.variables || '',
    },
  });

  // Reset form when dialog opens/closes or host changes
  useEffect(() => {
    if (open) {
      form.reset({
        macAddress: '',
        hostname: host?.hostname || '',
        profileId: host?.profileId?.toString() || 'none',
        variables: host?.variables || '',
      });
    }
  }, [open, host, form]);

  const variablesValue = form.watch('variables');
  const variablesValid = isValidJson(variablesValue || '');

  // Close dialog when fetcher completes successfully
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      onOpenChange(false);
    }
  }, [fetcher.state, fetcher.data, onOpenChange]);

  function onSubmit(values: z.infer<typeof createFormSchema>) {
    if (!isValidJson(values.variables || '')) {
      form.setError('variables', { message: 'Invalid JSON format' });
      return;
    }

    const formData = new FormData();
    formData.set('hostname', values.hostname || '');
    formData.set('profileId', values.profileId || 'none');
    formData.set('variables', values.variables || '');

    if (isCreateMode) {
      formData.set('macAddress', values.macAddress);
      formData.set('intent', 'create');
    } else {
      formData.set('macAddress', host.macAddress);
      formData.set('intent', 'update');
    }

    fetcher.submit(formData, { method: 'POST', action: '/?index' });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCreateMode ? 'Add Host' : `Edit Host ${host.macAddress}`}
          </DialogTitle>
          <DialogDescription>
            {isCreateMode
              ? 'Add a new host by MAC address and assign a boot profile.'
              : 'Update hostname and assign a profile.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isCreateMode && (
              <FormField
                control={form.control}
                name="macAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MAC Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00:11:22:33:44:55"
                        className="font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="hostname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hostname</FormLabel>
                  <FormControl>
                    <Input placeholder="server-01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profileId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a profile" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {profiles.map((profile) => (
                        <SelectItem
                          key={profile.id}
                          value={profile.id.toString()}
                        >
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="variables"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host Variables (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={'{\n  "ip_address": "192.168.1.100"\n}'}
                      className={`font-mono min-h-[100px] text-sm ${
                        !variablesValid ? 'border-destructive' : ''
                      }`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'Saving...'
                  : isCreateMode
                    ? 'Add Host'
                    : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
