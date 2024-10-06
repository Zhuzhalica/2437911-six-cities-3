import {HousingType} from './housing-type.enum.js';
import {HousingConveniences} from './housing-conveniences.enum.js';
import {Coordinates} from './coordinates.type.js';

export type RentOffer = {
  title: string,
  description: string,
  createdDate: Date,
  city: string,
  previewImage: string,
  housingPhoto: string,
  isPremium: boolean,
  isFavorite: boolean,
  rating: number,
  housingType: HousingType,
  roomsCount: number,
  guestsCount: number,
  price: number,
  conveniences: HousingConveniences[],
  author: string,
  commentsCount: number,
  coordinates: Coordinates
}
