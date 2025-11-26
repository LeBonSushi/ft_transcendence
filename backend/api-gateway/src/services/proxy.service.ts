import { Injectable } from '@nestjs/common';
import axios, { Method } from 'axios';

@Injectable()
export class ProxyService {
  async forwardRequest(
    method: Method,
    url: string,
    data?: any,
    headers?: any,
  ) {
    const response = await axios({
      method,
      url,
      data,
      headers,
    });

    return response.data;
  }
}
