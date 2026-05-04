import { environment } from '../../environments/environment';
import { getRuntimeApiBaseUrl } from './runtime-config';

export const API_BASE_URL = getRuntimeApiBaseUrl() || environment.apiBaseUrl;
