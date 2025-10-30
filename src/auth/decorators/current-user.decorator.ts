import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador para obtener el usuario autenticado desde el request
 * 
 * Uso básico (obtener todo el usuario):
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUser() user: any) {
 *   return user; // { id, email, name, role }
 * }
 * ```
 * 
 * Uso avanzado (obtener un campo específico):
 * ```typescript
 * @Post('product')
 * create(
 *   @Body() dto: CreateProductDto,
 *   @CurrentUser('id') userId: string
 * ) {
 *   return this.productsService.create(dto, userId);
 * }
 * ```
 * 
 * El objeto user proviene de JwtStrategy.validate()
 */
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si se especifica un campo, retornar solo ese campo
    return data ? user?.[data] : user;
  },
);
