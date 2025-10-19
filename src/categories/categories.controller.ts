import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.categoriesService.findAll(paginationDto);
  }

  @Get('active')
  findAllActive(@Query() paginationDto: PaginationDto) {
    return this.categoriesService.findAllActive(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.categoriesService.findOne(term);
  }

  @Get(':term/products')
  findOneWithProducts(@Param('term') term: string) {
    return this.categoriesService.findOneWithProducts(term);
  }

  @Get(':id/count')
  countProducts(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.countProducts(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Patch(':id/activate')
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.activate(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
