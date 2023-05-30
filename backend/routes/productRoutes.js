import express from 'express';
import Product from '../models/productModel.js';
import { isAdmin, isAuth } from '../utils.js';

const productRouter = express.Router();

// Request for import of all products
productRouter.get('/', async (req, res) => {
    const products = await Product.find();
    res.send(products);
});

// Request to add a new product by admin
productRouter.post('/', isAuth, isAdmin, async (req, res) => {

    const newProduct = new Product({
        name: 'sample name ' + Date.now(),
        slug: 'sample-name-' + Date.now(),
        image: '/images/p1.jpg',
        price: 0,
        category: 'sample category',
        brand: 'sample brand',
        countInStock: 0,
        rating: 0,
        numReviews: 0,
        description: 'sample description',
    });

    const product = await newProduct.save();
    res.send({ message: 'Product Created', product });
}
);

// Request to update an existing product by admin
productRouter.put('/product/:id', isAuth, isAdmin, async (req, res) => {

    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
        product.name = req.body.name;
        product.slug = req.body.slug;
        product.price = req.body.price;
        product.image = req.body.image;
        product.images = req.body.images;
        product.category = req.body.category;
        product.brand = req.body.brand;
        product.countInStock = req.body.countInStock;
        product.description = req.body.description;
        await product.save();
        res.send({ message: 'Product Updated' });
    } else {
        res.status(404).send({ message: 'Product Not Found' });
    }
}
);

// Declaration of the number of products to be displayed on the page
const PAGE_SIZE_ADMIN = 5;

// Request to the server to display a list of products to the admin
productRouter.get('/admin', isAuth, isAdmin, async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE_ADMIN;

    const products = await Product.find()
        .skip(pageSize * (page - 1))
        .limit(pageSize);
    const countProducts = await Product.countDocuments();
    res.send({
        products,
        countProducts,
        page,
        pages: Math.ceil(countProducts / pageSize),
    });
}
);

// Declaration of the number of products to be displayed on the page
const PAGE_SIZE = 2;

// Search request for products
productRouter.get('/search', async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

    const queryFilter =
        searchQuery && searchQuery !== 'all'
            ? {
                name: {
                    $regex: searchQuery,
                    $options: 'i',
                },
            }
            : {};
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const ratingFilter =
        rating && rating !== 'all'
            ? {
                rating: {
                    $gte: Number(rating),
                },
            }
            : {};
    const priceFilter =
        price && price !== 'all'
            ? {
                // 50-200
                price: {
                    $gte: Number(price.split('-')[0]),
                    $lte: Number(price.split('-')[1]),
                },
            }
            : {};
    const sortOrder =
        order === 'featured'
            ? { featured: -1 }
            : order === 'lowest'
                ? { price: 1 }
                : order === 'highest'
                    ? { price: -1 }
                    : order === 'toprated'
                        ? { rating: -1 }
                        : order === 'newest'
                            ? { createdAt: -1 }
                            : { _id: -1 };

    const products = await Product.find({
        ...queryFilter,
        ...categoryFilter,
        ...priceFilter,
        ...ratingFilter,
    })
        .sort(sortOrder)
        .skip(pageSize * (page - 1))
        .limit(pageSize);

    const countProducts = await Product.countDocuments({
        ...queryFilter,
        ...categoryFilter,
        ...priceFilter,
        ...ratingFilter,
    });
    res.send({
        products,
        countProducts,
        page,
        pages: Math.ceil(countProducts / pageSize),
    });
}
);

// Request to import categories
productRouter.get('/categories', async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
});

// Request to import one product
productRouter.get('/:slug', async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug });//slug:(added)
    if (product) {
        res.send(product);
    } else {
        res.status(404).send({ message: 'Product Not Found' });
    }
});

// Request to import a product by ID
productRouter.get('/product/:id', async (req, res) => {//product(added)
    const product = await Product.findById(req.params.id);//findById(findOne)
    if (product) {
        res.send(product);
    } else {
        res.status(404).send({ message: 'Product Not Found' });
    }
});

// Request to delete an existing product by admin
productRouter.delete('/product/:id', isAuth, isAdmin, async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        await product.deleteOne();
        res.send({ message: 'Product Deleted' });
    } else {
        res.status(404).send({ message: 'Product Not Found' });
    }
}
);

export default productRouter;
