import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface SkuBarcodeProps {
  value: string;
  height?: number;
  width?: number;
  displayValue?: boolean;
  fontSize?: number;
  className?: string;
  format?: 'CODE128' | 'EAN13' | 'CODE39';
  lineColor?: string;
  background?: string;
}

export const SkuBarcode: React.FC<SkuBarcodeProps> = ({
  value,
  height = 32,
  width = 1.3,
  displayValue = false,
  fontSize = 9,
  className = '',
  format = 'CODE128',
  lineColor = '#000000',
  background = 'transparent'
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        // Sanitize code string: remove extra leading/trailing whitespace
        const cleanValue = value.trim();
        
        // If EAN13 format is explicitly requested but string length isn't 12 or 13, fallback to CODE128
        let targetFormat = format;
        if (format === 'EAN13' && !/^\d{12,13}$/.test(cleanValue)) {
          targetFormat = 'CODE128';
        }

        JsBarcode(svgRef.current, cleanValue, {
          format: targetFormat,
          width,
          height,
          displayValue,
          fontSize,
          font: 'monospace',
          textMargin: 2,
          margin: 0,
          background,
          lineColor
        });
      } catch (err) {
        console.warn('Barcode generation warning for SKU:', value, err);
      }
    }
  }, [value, height, width, displayValue, fontSize, format, lineColor, background]);

  if (!value) return null;

  return (
    <svg
      ref={svgRef}
      className={`max-w-full ${className}`}
      style={{ shapeRendering: 'crispEdges' }}
    />
  );
};
