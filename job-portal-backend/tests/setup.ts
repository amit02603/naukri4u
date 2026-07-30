import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Jest test setup.
 *
 * Uses MongoDB Memory Server to provide an isolated, in-memory
 * MongoDB instance for integration tests. Each test file gets
 * a clean database state.
 */

let mongoServer: MongoMemoryServer;

/**
 * Before all tests: Start MongoDB Memory Server and connect Mongoose.
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
});

/**
 * After each test: Clear all collections to ensure test isolation.
 */
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

/**
 * After all tests: Disconnect and stop the memory server.
 */
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
