import PocketBase from 'pocketbase';

// Use environment variable, or current origin (for deployed), or localhost (for dev)
const pbUrl = import.meta.env.VITE_POCKETBASE_URL ||
  (typeof window !== 'undefined' && window.location.origin) ||
  'http://localhost:8090';

const pb = new PocketBase(pbUrl);

export default pb;
