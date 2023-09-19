import { ApplicationError } from '@/protocols';

export function inexistentError(details: string): ApplicationError {
  return {
    name: 'BadRequest',
    message: `Invalid data: ${details}`,
  };
}
