export class ApiResponseDto<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}
