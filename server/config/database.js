const { Sequelize } = require("sequelize")
const dotenv = require("dotenv")

// Load environment variables
dotenv.config()

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || "mobilux",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
)

module.exports = sequelize
