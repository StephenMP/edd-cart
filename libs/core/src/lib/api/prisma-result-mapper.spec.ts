import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { mapBadDeleteResult } from './prisma-result-mapper';

describe('prisma-result-mapper', () => {
  describe('mapBadDeleteResult', () => {
    it('should map entity not found to NotFoundException', () => {
      const mockError = new PrismaClientKnownRequestError('test', {clientVersion: "1.0", code: "P202"});
      const result = mapBadDeleteResult(mockError);
      expect(result).toBeInstanceOf(HttpException);
    });

    it('should map unknown error to HttpException with Internal Server Error', () => {
      const mockError = new Error('test');
      const result = mapBadDeleteResult(mockError);
      expect(result).toBeInstanceOf(HttpException);

      const httpException = result as HttpException;
      expect(httpException.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(httpException.message).toBe('test');
    });
  });
});
