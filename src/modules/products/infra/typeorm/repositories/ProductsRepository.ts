import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import AppError from '@shared/errors/AppError';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findProduct = await this.ormRepository.findOne({
      where: {
        name,
      },
    });

    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsIds = products.map(product => product.id);

    const productList = await this.ormRepository.find({
      where: {
        id: In(productsIds),
      },
    });

    return productList;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsList = await this.findAllById(products);

    const productsAtt = productsList.reduce((acc: Product[], productList) => {
      const productsFinded = products.find(
        productOrder => productOrder.id === productList.id,
      );
      if (productsFinded) {
        if (productList.quantity < productsFinded.quantity) {
          throw new AppError(
            `${productsFinded.id}: Quantity invalid ${productsFinded.quantity}`,
          );
        }
        Object.assign(productList, {
          quantity: productList.quantity - productsFinded.quantity,
        });
        return acc.concat(productList);
      }
      return acc;
    }, []);

    await this.ormRepository.save(productsAtt);

    return productsAtt;
  }
}

export default ProductsRepository;
