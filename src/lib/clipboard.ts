import { toast } from 'sonner';

export async function copyText(text: string, successMessage: string): Promise<boolean> {
  try {
    if (!text) throw new Error('No text to copy');
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
    return true;
  } catch {
    toast.error('Clipboard access failed. Allow clipboard permission and try again.');
    return false;
  }
}
