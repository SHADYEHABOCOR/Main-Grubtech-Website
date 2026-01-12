import { useEffect } from 'react';

interface StructuredDataProps {
  data: object | object[];
}

/**
 * Component to inject JSON-LD structured data into the page head
 */
export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    const schemas = Array.isArray(data) ? data : [data];
    const scriptElements: HTMLScriptElement[] = [];

    schemas.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `structured-data-${index}`;
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
      scriptElements.push(script);
    });

    return () => {
      // Cleanup: remove scripts when component unmounts
      scriptElements.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [data]);

  return null;
}
