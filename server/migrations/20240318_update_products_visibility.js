module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate(
      'Products',
      { isVisible: false },
      {
        id: {
          [Sequelize.Op.between]: [1, 28]
        }
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate(
      'Products',
      { isVisible: true },
      {
        id: {
          [Sequelize.Op.between]: [1, 28]
        }
      }
    );
  }
}; 