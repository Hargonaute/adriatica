'use client';

import { type BlockData, type FormBlockData } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Collection {
    id: string;
    name: string;
}

// --- Editor Component ---
export function FormEditor({
  block,
  onChange,
}: {
  block: BlockData & { type: 'form' };
  onChange: (updates: Partial<BlockData>) => void;
}) {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    fetch('/api/collections')
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) setCollections(data);
      });
  }, []);

  return (
    <div className="space-y-4 p-4 border rounded-md bg-background">
       <div className="space-y-2">
           <Label>Select Collection</Label>
           <Select 
             value={block.collectionId} 
             onValueChange={(val) => onChange({ collectionId: val })}
           >
             <SelectTrigger>
               <SelectValue placeholder="Choose a collection..." />
             </SelectTrigger>
             <SelectContent>
                {collections.map(col => (
                    <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
                ))}
             </SelectContent>
           </Select>
           <p className="text-xs text-muted-foreground">
              Submissions will be saved to this collection.
           </p>
       </div>

       <div className="space-y-2">
           <Label>Submit Button Label</Label>
           <Input 
             value={block.submitLabel || 'Submit'} 
             onChange={(e) => onChange({ submitLabel: e.target.value })} 
           />
       </div>

       <div className="space-y-2">
           <Label>Success Message</Label>
           <Input 
             value={block.successMessage || "Thank you! We'll be in touch."} 
             onChange={(e) => onChange({ successMessage: e.target.value })} 
           />
       </div>
    </div>
  );
}

// --- Preview / Public Component ---
export function FormPreview({
  block,
  className
}: {
  block: BlockData & { type: 'form' };
  className?: string;
}) {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
      if (!block.collectionId) return;
      setLoading(true);
      fetch(`/api/collections/${block.collectionId}`)
          .then(res => res.json())
          .then(data => {
              if (data.fields) setFields(data.fields);
              setLoading(false);
          })
          .catch(() => setLoading(false));
  }, [block.collectionId]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      try {
          const res = await fetch('/api/entries/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  collectionId: block.collectionId,
                  data: formData
              }),
          });
          
          if (!res.ok) throw new Error('Submission failed');
          
          setSuccess(true);
          setFormData({});
          toast.success('Form submitted successfully');
      } catch (error) {
          toast.error('Failed to submit form');
      } finally {
          setSubmitting(false);
      }
  };

  if (!block.collectionId) {
      return <div className="p-4 border border-dashed rounded text-center text-muted-foreground">Select a collection to display form.</div>;
  }

  if (loading) return <div className="p-4 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></div>;

  if (success) {
      return (
          <div className="p-8 text-center bg-green-50 text-green-800 rounded-lg border border-green-200">
              <h3 className="text-lg font-bold mb-2">Success!</h3>
              <p>{block.successMessage || 'Thank you!'}</p>
              <Button variant="link" onClick={() => setSuccess(false)} className="mt-4">Submit another</Button>
          </div>
      );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
        <div className="space-y-4">
            {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                    <Label>
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    
                    {field.type === 'textarea' ? (
                        <Textarea 
                            required={field.required}
                            value={formData[field.key] || ''}
                            onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                        />
                    ) : field.type === 'checkbox' ? (
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id={field.key}
                                checked={formData[field.key] || false}
                                onCheckedChange={(checked: boolean | string) => setFormData({...formData, [field.key]: checked})}
                            />
                            <label htmlFor={field.key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Yes
                            </label>
                        </div>
                    ) : (
                        <Input 
                            type={field.type}
                            required={field.required}
                            value={formData[field.key] || ''}
                            onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                        />
                    )}
                </div>
            ))}
            
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {block.submitLabel || 'Submit'}
            </Button>
        </div>
    </form>
  );
}
