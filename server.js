import 'dotenv/config';
import { db } from './src/db/db.config.js';
import { app } from './src/app.js';
import { initModel } from './src/db/initModel.js';

const PORT = process.env.PORT || 3031;

db.authenticate()
  .then(() => {
    console.log(`Database Synced 💪`);
    app.listen(PORT, () => {
      console.log(`App Running on Port ${PORT}`);
    });
  })
  .then(() => {
    console.log(`Database Authenticated! 👍`);
    return initModel();
  })
  .then(() => {
    return db.sync();
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });
