import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { Room, TicketStatus } from '@prisma/client';
import {
  createUser,
  createTicketType,
  createHotel,
  createRoomWithHotelId,
  createEnrollmentWithAddress,
  createTicket,
  createBooking,
  generateCreditCardData,
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

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 if the roomId doesnt exists ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const body = { ticketId: ticket.id, cardData: generateCreditCardData() };
      await server.post('/payments/process').set('Authorization', `Bearer ${token}`).send(body);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 89474 });
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 when user doestn have an enrrolment yet', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when user doestn have an ticket yet', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      await createEnrollmentWithAddress(user);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when the room is at max capacity', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      for (let i = 0; i < room.capacity; i++) {
        const newRoomOccupant = await createUser();
        await createBooking(newRoomOccupant.id, room.id);
      }
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when the ticket isnt Paid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when the user ticket type is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when the user ticket type doesnt include hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, false);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and return the bookingId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const sendBody = { roomId: room.id };
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(sendBody);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({ bookingId: expect.any(Number) });
    });
  });
});