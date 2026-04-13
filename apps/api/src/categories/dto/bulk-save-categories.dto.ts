export class BulkSaveCategoriesDto {
  categories!: Array<{
    name: string;
    sortOrder: number;
  }>;
}