import { SetMetadata } from '@nestjs/common';

/** Skip ApiResult envelope (binary streams, etc.). */
export const RAW_RESPONSE_KEY = 'rawResponse';
export const RawResponse = () => SetMetadata(RAW_RESPONSE_KEY, true);
