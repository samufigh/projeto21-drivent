import { AuthenticatedRequest } from "@/middlewares";
import { hotelsService } from "@/services/hotels-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req :AuthenticatedRequest, res :Response){
    const {userId} = req
    const hotels = await hotelsService.findHotels(userId)
    res.status(httpStatus.OK).send(hotels)
}