import React, { useEffect } from 'react';
import { Product, Gender } from '../types/resale';
import { TAXONOMY } from '../data/initialCatalog';

interface SEOManagerProps {
  selectedProduct: Product | null;
  selectedCategory: string;
  selectedGender: Gender | 'ALL';
  totalProductsCount: number;
}

export const SEOManager: React.FC<SEOManagerProps> = ({
  selectedProduct,
  selectedCategory,
  selectedGender,
  totalProductsCount
}) => {
  useEffect(() => {
    // ------------------------------------------------------------------------
    // Helper to safely set or create <meta> tags in <head>
    // ------------------------------------------------------------------------
    const setMeta = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to set or create canonical link
    const setCanonical = (url: string) => {
      let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    };

    // Helper to set or create Schema.org JSON-LD structured data script
    const setJsonLd = (data: object) => {
      let script = document.getElementById('schema-jsonld') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'schema-jsonld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(data, null, 2);
    };

    const currentOrigin = window.location.origin;
    const currentPath = window.location.pathname;
    const canonicalUrl = `${currentOrigin}${currentPath}`;

    // ------------------------------------------------------------------------
    // CASE A: Specific 1-of-1 Archival Product Selected (PDP View)
    // ------------------------------------------------------------------------
    if (selectedProduct) {
      const conditionLabel = selectedProduct.condition.replace(/_/g, ' ');
      const priceFormatted = `৳${selectedProduct.priceBDT.toLocaleString('en-IN')}`;
      const eraFormatted = selectedProduct.era.replace('ERA_', '').replace(/_/g, ' ');

      // Precise SEO Title: [Brand] [Title] - [Size] - [Price] | SAIRAT COUTURE
      const pageTitle = `${selectedProduct.brand} ${selectedProduct.title} (${selectedProduct.sizeTag}) · ${priceFormatted} | SAIRAT COUTURE`;
      document.title = pageTitle;

      // Meta Description incorporating measurements and authenticity
      const metaDescription = `Verified 1-of-1 archival ${selectedProduct.brand} piece from ${eraFormatted}. Condition: ${conditionLabel}. Tagged ${selectedProduct.sizeTag}. Guaranteed authentic with atomic 10-min reservation lease at SAIRAT COUTURE.`;

      const coverImageUrl = selectedProduct.images?.[0] || `${currentOrigin}/assets/fallback_hero.jpg`;

      // Standard Meta
      setMeta('name', 'description', metaDescription);
      setCanonical(`${canonicalUrl}?item=${selectedProduct.slug}`);

      // OpenGraph
      setMeta('property', 'og:site_name', 'SAIRAT COUTURE');
      setMeta('property', 'og:type', 'product');
      setMeta('property', 'og:title', pageTitle);
      setMeta('property', 'og:description', metaDescription);
      setMeta('property', 'og:url', `${canonicalUrl}?item=${selectedProduct.slug}`);
      setMeta('property', 'og:image', coverImageUrl);
      setMeta('property', 'og:image:alt', selectedProduct.title);
      setMeta('property', 'og:price:amount', selectedProduct.priceBDT.toString());
      setMeta('property', 'og:price:currency', 'BDT');
      setMeta(
        'property',
        'og:availability',
        selectedProduct.status === 'SOLD' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock'
      );

      // Twitter Cards
      setMeta('name', 'twitter:card', 'summary_large_image');
      setMeta('name', 'twitter:site', '@SairatCouture');
      setMeta('name', 'twitter:title', pageTitle);
      setMeta('name', 'twitter:description', metaDescription);
      setMeta('name', 'twitter:image', coverImageUrl);
      setMeta('name', 'twitter:label1', 'Condition & Authenticity');
      setMeta('name', 'twitter:data1', `${conditionLabel} · Verified`);
      setMeta('name', 'twitter:label2', 'Price & Availability');
      setMeta('name', 'twitter:data2', `${priceFormatted} · ${selectedProduct.status === 'SOLD' ? 'Sold' : '1 of 1 Available'}`);

      // Schema.org Product Rich Snippet
      const schemaConditionMap: Record<string, string> = {
        BRAND_NEW_TAGS: 'https://schema.org/NewCondition',
        EXCELLENT_VINTAGE: 'https://schema.org/UsedCondition',
        MINOR_FLAWS: 'https://schema.org/DamagedCondition'
      };

      const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: selectedProduct.title,
        sku: selectedProduct.sku,
        mpn: selectedProduct.sku,
        image: selectedProduct.images || [coverImageUrl],
        description: selectedProduct.description,
        brand: {
          '@type': 'Brand',
          name: selectedProduct.brand
        },
        category: selectedProduct.categoryName,
        itemCondition: schemaConditionMap[selectedProduct.condition] || 'https://schema.org/UsedCondition',
        offers: {
          '@type': 'Offer',
          url: `${canonicalUrl}?item=${selectedProduct.slug}`,
          priceCurrency: 'BDT',
          price: selectedProduct.priceBDT.toFixed(2),
          availability:
            selectedProduct.status === 'SOLD'
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock',
          itemCondition: schemaConditionMap[selectedProduct.condition] || 'https://schema.org/UsedCondition',
          seller: {
            '@type': 'Organization',
            name: 'SAIRAT COUTURE Archive & Resale'
          }
        },
        additionalProperty: [
          {
            '@type': 'PropertyValue',
            name: 'Era',
            value: selectedProduct.era
          },
          {
            '@type': 'PropertyValue',
            name: 'Tagged Size',
            value: selectedProduct.sizeTag
          },
          {
            '@type': 'PropertyValue',
            name: 'Authenticity Status',
            value: selectedProduct.authenticityStatus
          }
        ]
      };

      setJsonLd(productSchema);
    } else {
      // ----------------------------------------------------------------------
      // CASE B: Category / Collection View / Homepage
      // ----------------------------------------------------------------------
      let departmentName = '';
      if (selectedGender === 'WOMEN') departmentName = "Women's ";
      else if (selectedGender === 'MEN') departmentName = "Men's ";

      let categoryName = 'Archival & Runway Resale';
      if (selectedCategory !== 'ALL') {
        const catObj = TAXONOMY.find((c) => c.id === selectedCategory);
        if (catObj) {
          categoryName = catObj.name;
        } else {
          // Check subcategories
          for (const parent of TAXONOMY) {
            const sub = parent.subcategories?.find((s) => s.id === selectedCategory);
            if (sub) {
              categoryName = `${parent.name} – ${sub.name}`;
              break;
            }
          }
        }
      }

      const pageTitle = `${departmentName}${categoryName} Vault (${totalProductsCount} Pieces) | SAIRAT COUTURE`;
      document.title = pageTitle;

      const metaDescription = `Browse ${totalProductsCount} verified 1-of-1 luxury and archival consignment pieces from Raf Simons, Maison Margiela, The Row, and Undercover. Protected by atomic 10-minute cart leases.`;

      setMeta('name', 'description', metaDescription);
      setCanonical(canonicalUrl);

      // OpenGraph
      setMeta('property', 'og:site_name', 'SAIRAT COUTURE');
      setMeta('property', 'og:type', 'website');
      setMeta('property', 'og:title', pageTitle);
      setMeta('property', 'og:description', metaDescription);
      setMeta('property', 'og:url', canonicalUrl);
      setMeta('property', 'og:image', `${currentOrigin}/assets/hero_editorial.jpg`);

      // Twitter Cards
      setMeta('name', 'twitter:card', 'summary_large_image');
      setMeta('name', 'twitter:site', '@SairatCouture');
      setMeta('name', 'twitter:title', pageTitle);
      setMeta('name', 'twitter:description', metaDescription);
      setMeta('name', 'twitter:image', `${currentOrigin}/assets/hero_editorial.jpg`);

      // Schema.org CollectionPage / WebSite JSON-LD
      const collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: pageTitle,
        description: metaDescription,
        url: canonicalUrl,
        provider: {
          '@type': 'Organization',
          name: 'SAIRAT COUTURE',
          url: currentOrigin,
          logo: `${currentOrigin}/logo.png`,
          sameAs: [
            'https://twitter.com/SairatCouture',
            'https://instagram.com/SairatCouture'
          ]
        },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: totalProductsCount,
          itemListElement: []
        }
      };

      setJsonLd(collectionSchema);
    }
  }, [selectedProduct, selectedCategory, selectedGender, totalProductsCount]);

  return null;
};
