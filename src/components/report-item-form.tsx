'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { db, storage } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Sparkles } from 'lucide-react';
import { suggestCategory } from '@/ai/flows/suggest-category';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';


const itemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  category: z.string().min(1, 'Please select a category.'),
  status: z.enum(['lost', 'found'], { required_error: 'Please select a status.' }),
  location: z.string().min(3, 'Location is required.'),
  image: z.any().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

const categories = ['Electronics', 'Books', 'Clothing', 'Keys', 'Wallets', 'IDs', 'Other'];

export default function ReportItemForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      status: 'lost',
      location: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file));
      form.setValue('image', e.target.files);
    }
  };

  const handleSuggestCategory = async () => {
    const description = form.getValues('description');
    if (!description || description.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Description too short',
        description: 'Please enter a longer description to suggest a category.',
      });
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await suggestCategory({ description });
      if (result.category) {
        form.setValue('category', result.category, { shouldValidate: true });
        toast({
          title: 'Category Suggested!',
          description: `We've set the category to "${result.category}".`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Suggestion Failed',
        description: 'Could not suggest a category at this time. Make sure you have set up your GEMINI_API_KEY.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const onSubmit = async (data: ItemFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to report an item.' });
      return;
    }
    setIsSubmitting(true);
    try {
      let imageUrl = '';
      if (data.image && data.image.length > 0) {
        const file = data.image[0];
        
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        }
        
        const compressedFile = await imageCompression(file, options);
        
        const storageRef = ref(storage, `items/${Date.now()}_${compressedFile.name}`);
        const snapshot = await uploadBytes(storageRef, compressedFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const { image, ...itemData } = data;

      await addDoc(collection(db, 'items'), {
        ...itemData,
        imageUrl,
        userEmail: user.email,
        userName: user.displayName,
        timestamp: serverTimestamp(),
      });

      toast({ title: 'Success!', description: 'Your item has been reported.' });
      form.reset();
      setImagePreview(null);
    } catch (error) {
      console.error('Error reporting item:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to report item.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <PlusCircle className="mr-2 h-6 w-6" /> Report an Item
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Black iPhone 13 Pro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detailed description of the item" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                   <div className="flex items-center gap-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                     <Button type="button" variant="outline" size="icon" onClick={handleSuggestCategory} disabled={isSuggesting}>
                       <Sparkles className={`h-4 w-4 ${isSuggesting ? 'animate-spin' : ''}`} />
                       <span className="sr-only">Suggest Category</span>
                     </Button>
                   </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="lost" />
                        </FormControl>
                        <FormLabel className="font-normal">Lost</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="found" />
                        </FormControl>
                        <FormLabel className="font-normal">Found</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Library, 2nd Floor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image (Optional)</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" onChange={handleImageChange} />
                  </FormControl>
                  {imagePreview && (
                    <div className="mt-4">
                      <Image src={imagePreview} alt="Image preview" width={100} height={100} className="rounded-md object-cover" />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Submitting...' : 'Report Item'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
