const { Product } = require('./models');

(async () => {
  const products = await Product.findAll();
  let fixed = 0;
  for (const p of products) {
    if (Array.isArray(p.availableMaterials) && typeof p.availableMaterials[0] === 'object' && p.availableMaterials[0] !== null) {
      const ids = p.availableMaterials.map(m => m.value);
      await p.update({ availableMaterials: ids });
      console.log(`Fixed product ${p.id}`);
      fixed++;
    }
  }
  if (fixed === 0) {
    console.log('No products needed fixing.');
  } else {
    console.log(`Fixed ${fixed} products.`);
  }
  process.exit();
})(); 