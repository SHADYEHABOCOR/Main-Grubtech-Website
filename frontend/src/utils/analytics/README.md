# Analytics Utilities

This folder contains all analytics and tracking utilities.

## Files

- `analytics.ts` - Core analytics engine (GA4, Mixpanel, Hotjar, Clarity)
- `useScrollTracking.ts` - React hooks for scroll and time tracking
- `index.ts` - Main export file

## Usage

### Initialize Analytics

Analytics auto-initializes when imported. Just import it:

```typescript
import { analytics } from './utils/analytics';
```

### Track Events

```typescript
import { analytics } from './utils/analytics';

// Track any event
analytics.track('button_click', {
  button_name: 'demo_cta',
  page: window.location.pathname
});

// Track page view
analytics.pageView('/pricing', 'Pricing Page');

// Track form submission
analytics.trackFormSubmit('contact', {
  restaurant_type: 'regional_chain'
});

// Track CTA click
analytics.trackCTA('Schedule Demo', 'hero_section');
```

### Use Tracking Hooks

In any React component:

```typescript
import { useScrollTracking, useTimeTracking } from './utils/analytics';

function MyPage() {
  useScrollTracking();  // Auto-tracks scroll depth
  useTimeTracking();    // Auto-tracks time on page

  return <div>...</div>;
}
```

## Event Types

See `analytics.ts` for full list of tracked events:
- Page views
- CTA clicks
- Form interactions
- Scroll depth
- Time on page
- Lead captures
- Video interactions
- Navigation clicks

## Configuration

Set in `.env.local`:

```bash
# Google Analytics 4
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Mixpanel
VITE_MIXPANEL_TOKEN=your_token

# Hotjar
VITE_HOTJAR_ID=your_id
VITE_HOTJAR_SV=6

# Microsoft Clarity
VITE_CLARITY_PROJECT_ID=your_id

# Feature flags
VITE_ENABLE_ANALYTICS=true
```

## Testing

Check browser console for:
```
✅ Google Analytics 4 initialized
✅ Hotjar initialized
✅ Analytics initialized
📊 Analytics Event: page_view {...}
```
