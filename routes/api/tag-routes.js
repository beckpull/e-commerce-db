const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
   try {
    const tagData = await Tag.findAll({
      include: {
        model: Product,
        as: 'tagged_products'
      }
    });

    if (!tagData) {
      res.status(404).json({ message: "No tags found" });
      return;
    }

    res.status(200).json(tagData);

   } catch (error) {
    console.log(error);
    res.status(500).json(error);
   }
  // be sure to include its associated Product data
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  try {
    const tagData = await Tag.findOne({
      where: {
        id: req.params.id,
      },
      include: {
        model: Product,
        as: 'tagged_products'
      }
    });

    if (!tagData) {
      res.status(404).json({ message: "No tags found" });
      return;
    }

    res.status(200).json(tagData); 

  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
  // be sure to include its associated Product data
});

router.post('/', async (req, res) => {
  try {
    const tagData = await Tag.create(req.body);

    res.status(200).json(tagData);

  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
  // create a new tag
});

router.put('/:id', async (req, res) => {
  try {
    const tagData = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      }
    });

    if (!tagData) {
      res.status(404).json({ message: "No tag with that id found."});
      return;
    } 

    res.status(200).json(tagData);
    
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
  // update a tag's name by its `id` value
});

router.delete('/:id', async (req, res) => {
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!tagData) {
      res.status(404).json({ message: "No tag with that id found." });
      return;
    }
    
    res.status(200).json({ message: `${tagData} tag has been deleted.`});

  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
  // delete on tag by its `id` value
});

module.exports = router;
