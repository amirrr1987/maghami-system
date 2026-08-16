import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProductCodePattern } from '../product-code-patterns/product-code-pattern.entity';
import { Product } from './product.entity';

const GLOBAL_PREFIX = 'PRD';
const GLOBAL_SEPARATOR = '-';
const GLOBAL_LENGTH = 6;

@Injectable()
export class SkuGeneratorService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ProductCodePattern)
    private readonly patterns: Repository<ProductCodePattern>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  /**
   * Allocates the next SKU for a category using its active code pattern,
   * or a global PRD-###### fallback when no pattern exists.
   */
  async generateForCategory(categoryId: string): Promise<string> {
    return this.dataSource.transaction(async (manager) => {
      const patternRepo = manager.getRepository(ProductCodePattern);
      const productRepo = manager.getRepository(Product);

      const pattern = await patternRepo.findOne({
        where: { categoryId, isActive: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (pattern) {
        const sequence = pattern.nextSequence;
        pattern.nextSequence = sequence + 1;
        await patternRepo.save(pattern);
        return this.formatSku(
          pattern.prefix,
          pattern.separator,
          pattern.length,
          sequence,
        );
      }

      const count = await productRepo.count();
      let sequence = count + 1;
      let sku = this.formatSku(
        GLOBAL_PREFIX,
        GLOBAL_SEPARATOR,
        GLOBAL_LENGTH,
        sequence,
      );
      while (await productRepo.exist({ where: { sku } })) {
        sequence += 1;
        sku = this.formatSku(
          GLOBAL_PREFIX,
          GLOBAL_SEPARATOR,
          GLOBAL_LENGTH,
          sequence,
        );
      }
      return sku;
    });
  }

  /** Preview without allocating (uses current nextSequence / count+1). */
  async previewForCategory(categoryId: string): Promise<string> {
    const pattern = await this.patterns.findOne({
      where: { categoryId, isActive: true },
    });
    if (pattern) {
      return this.formatSku(
        pattern.prefix,
        pattern.separator,
        pattern.length,
        pattern.nextSequence,
      );
    }
    const count = await this.products.count();
    return this.formatSku(
      GLOBAL_PREFIX,
      GLOBAL_SEPARATOR,
      GLOBAL_LENGTH,
      count + 1,
    );
  }

  private formatSku(
    prefix: string,
    separator: string,
    length: number,
    sequence: number,
  ): string {
    const padded = String(sequence).padStart(length, '0');
    if (padded.length > length) {
      throw new BadRequestException(
        `SKU sequence ${sequence} exceeds configured length ${length}`,
      );
    }
    return `${prefix}${separator}${padded}`;
  }
}
