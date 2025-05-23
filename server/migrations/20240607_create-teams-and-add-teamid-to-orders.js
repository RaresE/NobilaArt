module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Teams', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
    await queryInterface.addColumn('Orders', 'teamId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Teams',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Orders', 'teamId')
    await queryInterface.dropTable('Teams')
  },
} 