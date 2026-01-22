import { zodResolver } from '@hookform/resolvers/zod';
import { FileCode, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
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
import type { Iso, Profile } from '~/db/schema';
import { buildIsoIpxeScript } from '~/lib/ipxe';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  content: z.string().min(1, 'Content is required'),
  variables: z.string().optional(),
  isoId: z.string().optional(),
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

interface ProfileFormProps {
  profile?: Profile;
  isos: Iso[];
}

export function ProfileForm({ profile, isos }: ProfileFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile?.name || '',
      content: profile?.content || '#!ipxe\n\n',
      variables: profile?.variables || '',
      isoId: profile?.isoId?.toString() ?? 'none',
    },
  });

  const variablesValue = form.watch('variables');
  const variablesValid = isValidJson(variablesValue || '');

  function applySelectedIsoTemplate() {
    const isoId = form.getValues('isoId');
    if (!isoId || isoId === 'none') return;
    const iso = isos.find((i) => i.id.toString() === isoId);
    if (!iso) return;
    form.setValue('content', buildIsoIpxeScript(iso.url, iso.name), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isValidJson(values.variables || '')) {
      form.setError('variables', { message: 'Invalid JSON format' });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.set('name', values.name);
      formData.set('content', values.content);
      formData.set('variables', values.variables || '');
      formData.set('isoId', values.isoId || 'none');
      formData.set('intent', profile ? 'update' : 'create');
      if (profile) {
        formData.set('id', profile.id.toString());
      }

      const url = profile ? `/profiles/${profile.id}` : '/profiles/new';
      await fetch(url, {
        method: 'POST',
        body: formData,
      });

      navigate('/profiles');
    } catch (error) {
      console.error('Failed to save profile', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!profile || !confirm('Are you sure you want to delete this profile?'))
      return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.set('intent', 'delete');
      formData.set('id', profile.id.toString());

      await fetch(`/profiles/${profile.id}`, {
        method: 'POST',
        body: formData,
      });

      navigate('/profiles');
    } catch (error) {
      console.error('Failed to delete profile', error);
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileCode className="h-5 w-5 text-primary" />
          <CardTitle>
            {profile ? 'Edit Boot Profile' : 'Create Boot Profile'}
          </CardTitle>
        </div>
        <CardDescription>
          {profile
            ? 'Update the iPXE script and configuration for this profile.'
            : 'Define a new iPXE boot script for your network hosts.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ubuntu 22.04 Install" {...field} />
                  </FormControl>
                  <FormDescription>
                    A friendly name to identify this boot profile.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ISO (optional)</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const current = form.getValues('content')?.trim();
                      const looksEmpty =
                        !current ||
                        current === '#!ipxe' ||
                        current === '#!ipxe\n';
                      if (looksEmpty) {
                        setTimeout(applySelectedIsoTemplate, 0);
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an ISO" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {isos.map((iso) => (
                        <SelectItem key={iso.id} value={iso.id.toString()}>
                          {iso.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Pick an ISO to generate a starting iPXE script. You can edit
                    it below.
                  </FormDescription>
                  <FormMessage />
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (
                          form.formState.isDirty &&
                          !confirm(
                            'Replace the current script with the ISO template?',
                          )
                        ) {
                          return;
                        }
                        applySelectedIsoTemplate();
                      }}
                      disabled={
                        isLoading ||
                        !form.getValues('isoId') ||
                        form.getValues('isoId') === 'none'
                      }
                    >
                      Use ISO template
                    </Button>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>iPXE Script</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="#!ipxe&#10;echo Booting...&#10;chain http://boot.example.com/install.ipxe"
                      className="font-mono min-h-[400px] text-sm bg-muted/30"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The iPXE script content that will be served to hosts
                    assigned to this profile. Use{' '}
                    <code className="text-xs">
                      {'$'}
                      {'{variable}'}
                    </code>{' '}
                    syntax for templating.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="variables"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Variables (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        '{\n  "kernel_args": "console=ttyS0",\n  "nfs_server": "192.168.1.1"\n}'
                      }
                      className={`font-mono min-h-[120px] text-sm bg-muted/30 ${
                        !variablesValid ? 'border-destructive' : ''
                      }`}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Define default variables for this profile. These can be
                    referenced in the script using{' '}
                    <code className="text-xs">
                      {'$'}
                      {'{variableName}'}
                    </code>{' '}
                    syntax. Host-specific variables will override these.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'Saving...'
                  : profile
                    ? 'Update Profile'
                    : 'Create Profile'}
              </Button>

              {profile && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
