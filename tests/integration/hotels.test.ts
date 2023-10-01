import httpStatus from 'http-status';
import supertest from 'supertest';
import app, { init } from '@/app';
import { cleanDb, generateValidToken } from "../helpers";
import * as jwt from 'jsonwebtoken';
import faker from '@faker-js/faker';
import { createEnrollmentWithAddress, createHotel, createTicket, createTicketType, createTicketTypeAux, createUser } from '../factories';
import { TicketStatus } from '@prisma/client';

const server = supertest(app);

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

  describe('GET /hotels', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.get('/hotels');
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();
  
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    describe('when token is valid', () => {
      it('should respond with status 404 when there are no enrollments registered', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
  
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it('should respond with status 404 when there are no tickets registered', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user)
  
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it('should respond with status 404 when there are no hotels registered', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketTypeAux(false, true)
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
  
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it('should respond with status 402 when the ticket is not paid', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketTypeAux(false, true)
        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)
        await createHotel()

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
      });

      it('should respond with status 402 when the ticket is remote', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketTypeAux(true, true)
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
        await createHotel()

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
      });

      it('should respond with status 402 when the ticket does not include a hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketTypeAux(false, false)
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
        await createHotel()

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
      });

      it('should respond with status 200 and with existing hotels data', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketTypeAux(false, true)
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
        await createHotel("name1", "image1")
  
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        const hotelWithRooms = response.body
  
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual(expect.arrayContaining(hotelWithRooms));
      });
    });
    
  });