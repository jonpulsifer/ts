import { zodResolver } from '@hookform/resolvers/zod';
import { Disc3, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
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
import type { Iso } from '~/db/schema';

const formSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    source: z.enum(['upload', 'url']),
    url: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.source === 'url' && !values.url?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['url'],
        message: 'ISO URL is required',
      });
    }
  });

interface IsoFormProps {
  iso?: Iso;
}

export function IsoForm({ iso }: IsoFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: iso?.name || '',
      source: iso?.source === 'upload' ? 'upload' : 'url',
      url: iso?.source === 'url' ? iso?.url || '' : '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.set('name', values.name);
      formData.set('source', values.source);
      formData.set('url', values.url || '');

      if (values.source === 'upload') {
        const file = fileRef.current?.files?.[0];
        if (file) {
          formData.set('file', file);
        }
      }

      if (iso) {
        formData.set('intent', 'update');
        formData.set('id', iso.id.toString());
        await fetch(`/isos/${iso.id}`, {
          method: 'POST',
          body: formData,
        });
      } else {
        formData.set('intent', 'create');
        await fetch('/isos/new', {
          method: 'POST',
          body: formData,
        });
      }

      navigate('/isos');
    } catch (error) {
      console.error('Failed to save ISO', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!iso || !confirm('Are you sure you want to delete this ISO record?'))
      return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.set('intent', 'delete');
      formData.set('id', iso.id.toString());

      await fetch(`/isos/${iso.id}`, {
        method: 'POST',
        body: formData,
      });

      navigate('/isos');
    } catch (error) {
      console.error('Failed to delete ISO', error);
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Disc3 className="h-5 w-5 text-primary" />
          <CardTitle>{iso ? 'Edit ISO' : 'Add ISO'}</CardTitle>
        </div>
        <CardDescription>
          {iso
            ? 'Update this ISO source. You can use it when creating boot profiles.'
            : 'Upload an ISO (preferred) or register an external URL.'}
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ubuntu 24.04 Live Server" {...field} />
                  </FormControl>
                  <FormDescription>
                    Friendly label for this ISO (used in the generated profile
                    name).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="upload">Upload to Spore</SelectItem>
                      <SelectItem value="url">External URL</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Spore serves uploaded ISOs over HTTP for iPXE.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('source') === 'upload' ? (
              <div className="space-y-2">
                <div className="text-sm font-medium">ISO file</div>
                <Input ref={fileRef} type="file" accept=".iso" />
                <p className="text-sm text-muted-foreground">
                  {iso?.source === 'upload'
                    ? 'Upload a new file to replace the existing one.'
                    : 'Choose an ISO file to upload.'}
                </p>
                {iso?.source === 'upload' ? (
                  <p className="text-xs text-muted-foreground">
                    Current: {iso.fileName || 'uploaded ISO'}
                  </p>
                ) : null}
              </div>
            ) : (
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISO URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://mirror.example.com/ubuntu.iso"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      HTTP(S) URL recommended. The iPXE script uses{' '}
                      <code>sanboot</code>.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-between pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : iso ? 'Update ISO' : 'Add ISO'}
              </Button>

              {iso ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              ) : null}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
