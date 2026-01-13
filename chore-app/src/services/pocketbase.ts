import PocketBase from 'pocketbase';

// Use environment variable, or localhost for dev (production deploys should set VITE_POCKETBASE_URL)
const pbUrl = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

const pb = new PocketBase(pbUrl);

export default pb;
