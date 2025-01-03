import {DocumentType, types} from '@typegoose/typegoose';
import {inject, injectable} from 'inversify';
import {Logger} from '../../libs/logger/index.js';
import {Component} from '../../types/index.js';
import {SortType} from '../../types/sortType.js';
import {CreateRentOfferDto} from './dto/create-rent-offer.dto.js';
import {PatchRentOfferDto} from './index.js';
import {RentOfferService} from './rent-offer-service.interface.js';
import {RentOffersLimit, RentOffersPremiumLimit} from './rent-offer.constants.js';
import {RentOfferEntity} from './rent-offer.entity.js';


@injectable()
export class DefaultRentOfferService implements RentOfferService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.RentOfferModel) private readonly rentOfferModel: types.ModelType<RentOfferEntity>
  ) {
  }

  public async create(dto: CreateRentOfferDto): Promise<types.DocumentType<RentOfferEntity>> {
    this.logger.info(`Try created rent offer: ${dto.title}`);

    const result = await this.rentOfferModel.create(dto);
    this.logger.info(`New rent offer created: ${dto.title}`);

    return result;
  }

  public async findById(id: string): Promise<types.DocumentType<RentOfferEntity> | null> {
    this.logger.info(`Try find rent offer with id=${id}`);
    const searchResult = await this.rentOfferModel.findById(id).populate('authorId').exec();
    if (searchResult) {
      this.logger.info(`Success find rent offer with id=${id}`);
    }

    return searchResult;
  }

  public async find(limit: number = RentOffersLimit): Promise<types.DocumentType<RentOfferEntity>[]> {
    this.logger.info('Try find rent offers');

    const searchResult = await this.rentOfferModel
      .aggregate([
        {$limit: limit},
        {$sort: {offerCount: SortType.Down}}
      ]);

    if (searchResult) {
      this.logger.info(`Success find rent offers count=${searchResult.length}`);
    }

    return searchResult;
  }

  public async delete(rentOfferId: string): Promise<types.DocumentType<RentOfferEntity> | null> {
    this.logger.info(`Try delete rent offer: ${rentOfferId}`);

    return this.rentOfferModel.findOneAndDelete({_id: rentOfferId}).exec();
  }

  public async patch(rentOfferId: string, dto: PatchRentOfferDto): Promise<types.DocumentType<RentOfferEntity> | null> {
    this.logger.info(`Try patch rent offer: ${rentOfferId}`);

    const result = await this.rentOfferModel.findByIdAndUpdate(rentOfferId, dto, {new: true});
    this.logger.info('Success patch');

    return result;
  }

  public async findPremiumByCity(city: string): Promise<types.DocumentType<RentOfferEntity>[]> {
    this.logger.info(`Try find premium rent offers by city=${city}`);

    const result = await this.rentOfferModel.find(
      {city: city, isPremium: true}, {}, {limit: RentOffersPremiumLimit}
    );

    this.logger.info(`Success find rent offers count=${result.length}`);

    return result;
  }

  public async addComment(rentOfferId: string, rating: number): Promise<DocumentType<RentOfferEntity> | null> {
    this.logger.info(`Add comment for rentOfferId=${rentOfferId}`);

    const rentOffer = await this.rentOfferModel
      .findByIdAndUpdate(rentOfferId, {
        '$inc': {
          commentsCount: 1,
        }
      }).exec();

    if (!rentOffer) {
      this.logger.warn('Fail add comment');
      return rentOffer;
    }

    await this.calculateRating(rentOffer.rating, rating, rentOffer.commentsCount + 1, rentOfferId);

    return rentOffer;
  }

  public async calculateRating(oldRating: number, newRating: number, ratingsCount: number, rentOfferId: string): Promise<void> {
    let rating = (newRating + (oldRating * (ratingsCount - 1))) / ratingsCount;
    rating = Math.round(10 * rating) / 10;

    await this.rentOfferModel
      .findByIdAndUpdate(rentOfferId,
        {rating: rating},
        {new: true});
  }

  public async exists(documentId: string): Promise<boolean> {
    return (await this.rentOfferModel
      .exists({_id: documentId})) !== null;
  }
}
