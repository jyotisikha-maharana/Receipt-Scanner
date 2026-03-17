import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | SmartReceipt`;
    return () => { document.title = 'SmartReceipt'; };
  }, [title]);
}
