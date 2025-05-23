const { Sequelize } = require('sequelize');
const config = require('./config/database');

const sequelize = new Sequelize(config);

async function addColumn() {
  try {
    await sequelize.query('ALTER TABLE Products ADD COLUMN availableMaterials JSON NULL;');
    console.log('Coloana availableMaterials a fost adăugată cu succes!');
    process.exit(0);
  } catch (err) {
    if (err.original && err.original.code === 'ER_DUP_FIELDNAME') {
      console.log('Coloana availableMaterials există deja.');
      process.exit(0);
    } else if (err.original && err.original.code === 'ER_INVALID_JSON_TEXT') {
      // Dacă MySQL nu suportă JSON, încearcă TEXT
      try {
        await sequelize.query('ALTER TABLE Products ADD COLUMN availableMaterials TEXT NULL;');
        console.log('Coloana availableMaterials (TEXT) a fost adăugată cu succes!');
        process.exit(0);
      } catch (err2) {
        console.error('Eroare la adăugarea coloanei ca TEXT:', err2);
        process.exit(1);
      }
    } else {
      console.error('Eroare la adăugarea coloanei:', err);
      process.exit(1);
    }
  }
}

addColumn(); 