/**
 * Unified API Client routed through the API Gateway Engine
 */
import { gatewayRequest } from './gatewayEngine';

export function api(endpoint, options = {}) {
  return gatewayRequest(endpoint, {
    method: options.method || 'GET',
    headers: options.headers || {},
    body: options.body || null,
    apiId: 'api_01'
  });
}

export default api;
