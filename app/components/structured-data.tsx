export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Buna House",
    "image": "https://bunahouse.et/logo.png",
    "@id": "https://bunahouse.et",
    "url": "https://bunahouse.et",
    "telephone": "+251-11-662-3348",
    "priceRange": "Br 300 - Br 2000",
    "servesCuisine": "Coffee, Desserts, Beverages",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Bole Road",
      "addressLocality": "Addis Ababa",
      "addressRegion": "Addis Ababa",
      "postalCode": "1000",
      "addressCountry": "ET"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 8.9944,
      "longitude": 38.7891
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "08:00",
        "closes": "23:00"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "2000"
    },
    "sameAs": [
      "https://www.facebook.com/bunahouse",
      "https://www.instagram.com/bunahouse"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
