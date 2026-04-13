export class BulkSaveBrandsDto {
  brands!: Array<{
    id?: string;
    name: string;
    color: string;
    sortOrder: number;
  }>;
}