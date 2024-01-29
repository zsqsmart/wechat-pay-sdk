import { Injectable } from '@nestjs/common';
import { Product } from 'src/utils/services/mongo/models/product';

@Injectable()
export class ProductService {
  findAll() {
    return Product.find();
  }
}
