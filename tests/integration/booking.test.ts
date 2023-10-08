import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { TicketStatus } from '@prisma/client';
import {
  createUser,
  createTicketType,
  createHotel,
  createRoomWithHotelId,
  createEnrollmentWithAddress,
  createTicket,
  createBooking,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const res = await server.get('/booking');
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const res = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const res = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 if there is no booking for the user', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const res = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 and with booking and room data', async () => {

      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);


      const res = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(httpStatus.OK);
      expect(res.body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });
  });
});