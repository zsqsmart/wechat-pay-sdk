import mongoose, { Mongoose } from 'mongoose';
import { BootstrapService } from '../base';
import { APP_CONFIGS } from 'src/constants';

console.log(APP_CONFIGS);

class MongoDBService implements BootstrapService {
  client: Mongoose;
  async start() {
    this.client = await mongoose.connect(APP_CONFIGS.dbUrl);
  }
  async stop() {
    await this.client.disconnect();
  }
}

export const mongoDB = new MongoDBService();
