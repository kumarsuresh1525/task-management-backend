import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

export class BaseRepository<T extends Document> {
  constructor(protected model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id);
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter);
  }

  async find(filter: FilterQuery<T>): Promise<T[]> {
    return this.model.find(filter);
  }

  async update(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true });
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id);
  }
} 