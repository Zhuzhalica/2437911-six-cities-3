import {DocumentType, types} from '@typegoose/typegoose';
import {CreateRentOfferDto} from './dto/create-rent-offer.dto.js';
import {PatchRentOfferDto} from './dto/patch-rent-offer.dto.js';
import {RentOfferEntity} from './rent-offer.entity.js';

export interface RentOfferService {
  create(dto: CreateRentOfferDto): Promise<DocumentType<RentOfferEntity>>;

  findById(id: string): Promise<DocumentType<RentOfferEntity> | null>;

  find(limit?: number): Promise<DocumentType<RentOfferEntity>[]>;

  delete(id: string): Promise<types.DocumentType<RentOfferEntity> | null>;

  findPremiumByCity(city: string): Promise<types.DocumentType<RentOfferEntity>[]>;

  patch(rentOfferId: string, dto: PatchRentOfferDto): Promise<types.DocumentType<RentOfferEntity> | null>;

  addFavorite(rentOfferId: string, userId: string): Promise<void>;

  deleteFavorite(rentOfferId: string, userId: string): Promise<void>;

  calculateRating(oldRating: number, newRating: number, ratingsCount: number, offerId: string): Promise<void>;

  incCommentCount(offerId: string): Promise<DocumentType<RentOfferEntity> | null>;

  exists(documentId: string): Promise<boolean>;
}
