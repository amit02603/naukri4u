import { Model, Document, FilterQuery, UpdateQuery, Types } from 'mongoose';

/**
 * Generic base repository implementing common CRUD operations
 * with soft-delete support.
 *
 * All domain repositories extend this class and inherit:
 * - findById / findOne / find / create / updateById
 * - Soft delete (marks isDeleted=true instead of removing)
 * - Automatic exclusion of soft-deleted records
 * - Counting with soft-delete awareness
 *
 * @template T - The Mongoose document type
 */
export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  /**
   * Finds a document by its ObjectId.
   * Excludes soft-deleted records unless includeDeleted is true.
   */
  async findById(id: string | Types.ObjectId, includeDeleted = false): Promise<T | null> {
    const filter: FilterQuery<T> = { _id: id } as FilterQuery<T>;
    if (!includeDeleted) {
      (filter as Record<string, unknown>).isDeleted = { $ne: true };
    }
    return this.model.findOne(filter).exec();
  }

  /**
   * Finds a single document matching the filter.
   * Excludes soft-deleted records unless includeDeleted is true.
   */
  async findOne(filter: FilterQuery<T>, includeDeleted = false): Promise<T | null> {
    const query = { ...filter } as Record<string, unknown>;
    if (!includeDeleted) {
      query.isDeleted = { $ne: true };
    }
    return this.model.findOne(query as FilterQuery<T>).exec();
  }

  /**
   * Finds multiple documents matching the filter.
   * Supports pagination, sorting, and soft-delete filtering.
   */
  async find(
    filter: FilterQuery<T>,
    options: {
      skip?: number;
      limit?: number;
      sort?: Record<string, 1 | -1>;
      includeDeleted?: boolean;
      populate?: string | string[];
    } = {},
  ): Promise<T[]> {
    const query = { ...filter } as Record<string, unknown>;
    if (!options.includeDeleted) {
      query.isDeleted = { $ne: true };
    }

    let queryBuilder = this.model.find(query as FilterQuery<T>);

    if (options.sort) {
      queryBuilder = queryBuilder.sort(options.sort);
    }
    if (options.skip !== undefined) {
      queryBuilder = queryBuilder.skip(options.skip);
    }
    if (options.limit !== undefined) {
      queryBuilder = queryBuilder.limit(options.limit);
    }
    if (options.populate) {
      const fields = Array.isArray(options.populate) ? options.populate : [options.populate];
      for (const field of fields) {
        queryBuilder = queryBuilder.populate(field);
      }
    }

    return queryBuilder.exec();
  }

  /**
   * Creates a new document.
   */
  async create(data: Partial<T>): Promise<T> {
    const doc = new this.model(data);
    return doc.save();
  }

  /**
   * Updates a document by its ObjectId and returns the updated document.
   */
  async updateById(id: string | Types.ObjectId, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
  }

  /**
   * Updates a single document matching the filter.
   */
  async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
    return this.model
      .findOneAndUpdate(filter, update, { new: true, runValidators: true })
      .exec();
  }

  /**
   * Soft-deletes a document by setting isDeleted=true and deletedAt=now.
   */
  async softDelete(id: string | Types.ObjectId): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        {
          $set: { isDeleted: true, deletedAt: new Date() },
        } as UpdateQuery<T>,
        { new: true },
      )
      .exec();
  }

  /**
   * Restores a soft-deleted document.
   */
  async restore(id: string | Types.ObjectId): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        {
          $set: { isDeleted: false, deletedAt: null },
        } as UpdateQuery<T>,
        { new: true },
      )
      .exec();
  }

  /**
   * Counts documents matching the filter.
   * Excludes soft-deleted records unless includeDeleted is true.
   */
  async count(filter: FilterQuery<T> = {} as FilterQuery<T>, includeDeleted = false): Promise<number> {
    const query = { ...filter } as Record<string, unknown>;
    if (!includeDeleted) {
      query.isDeleted = { $ne: true };
    }
    return this.model.countDocuments(query as FilterQuery<T>).exec();
  }

  /**
   * Checks if a document exists matching the filter.
   */
  async exists(filter: FilterQuery<T>, includeDeleted = false): Promise<boolean> {
    const count = await this.count(filter, includeDeleted);
    return count > 0;
  }
}
