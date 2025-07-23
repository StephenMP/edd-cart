import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

/**
 * Postgres/Prisma throws an error when a record to be deleted isn't found.
 * This function handles mapping it to a proper HTTP response
 * @param error
 */
export function mapBadDeleteResult(error: Error) {
  if (error instanceof PrismaClientKnownRequestError) {
    const prismaError = error as PrismaClientKnownRequestError;
    if (prismaError.code === 'P2025') {
      return new NotFoundException();
    }
  }

  return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
}
