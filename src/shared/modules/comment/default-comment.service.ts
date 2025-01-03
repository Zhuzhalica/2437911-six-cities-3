import {types} from '@typegoose/typegoose';
import {inject, injectable} from 'inversify';
import {Logger} from '../../libs/logger/index.js';
import {Component} from '../../types/index.js';
import {SortType} from '../../types/sortType.js';
import {CommentService} from './comment-service.interface.js';
import {CommentsLimit} from './comment.constants.js';
import {CommentEntity} from './comment.entity.js';
import {CreateCommentDto} from './dto/create-comment.dto.js';

@injectable()
export class DefaultCommentService implements CommentService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>
  ) {
  }

  public async create(dto: CreateCommentDto): Promise<types.DocumentType<CommentEntity>> {
    this.logger.info(`Try created comment from: ${dto.authorId}`);

    const result = await this.commentModel.create(dto);

    this.logger.info('New comment created');

    return result;
  }


  public async findByRentOfferId(rentOfferId: string): Promise<types.DocumentType<CommentEntity>[]> {
    this.logger.info(`Try find comments for rentOffer=${rentOfferId}`);

    const result = await this.commentModel
      .find({rentOfferId})
      .sort({createdAt: SortType.Down})
      .limit(CommentsLimit)
      .populate('authorId');

    this.logger.info(`Find comments count=${result.length}`);

    return result;
  }

  public async deleteByRentOfferId(rentOfferId: string): Promise<number> {
    const result = await this.commentModel
      .deleteMany({rentOfferId: rentOfferId})
      .exec();

    return result.deletedCount;
  }
}
