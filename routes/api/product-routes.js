const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [
        { 
          model: Category,
          // attributes: ['id', 'category_name'] 
        }, 
        { 
          model: Tag,
          as: 'product_tags',
          // attributes: ['id', 'tag_name'] 
        }
      ],
    });

    if (!productData) {
      res.status(404).json({ message: 'No products yet.'});
      return;
    }

    res.status(200).json(productData);
  } catch(err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [
        { 
          model: Category,
          // attributes: ['id', 'category_name'] 
        }, 
        { 
          model: Tag,
          as: 'product_tags',
          // attributes: ['id', 'tag_name'] 
        }
      ],
    });

    if (!productData) {
      res.status(404).json({ message: 'No product with that id.'});
      return;
    }
    res.status(200).json(productData);
  } catch(err) {
    // console.log(err);
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    // Create the product
    const productData = await Product.create(req.body);

    // If there are tagIds, create product-tag associations
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: productData.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }

    // Respond with the created product data
    res.status(200).json(productData);
  } catch (error) {
    // Handle errors
    // console.log(err);
    res.status(500).json(error);
  }
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {

        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
            .filter((tag_id) => !productTagIds.includes(tag_id))
            .map((tag_id) => {
              return {
                product_id: req.params.id,
                tag_id,
              };
            });

          // figure out which ones to remove
          const productTagsToRemove = productTags
            .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(`${product} product has been updated.`);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id,  
      },
    });
    if (!productData) {
      res.status(404).json({ message: 'No product with that id found.'});
      return;
    }

    res.status(200).json({message: `${productData} product has been deleted.`});
  } catch(err) {
    // console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
