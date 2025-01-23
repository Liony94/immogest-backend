import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CheckOwnership = createParamDecorator(
  async (propertyService: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const propertyId = parseInt(request.params.id);
    const userId = request.user.id;

    const property = await propertyService.findOne(propertyId);
    if (property.owner.id !== userId) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à modifier cette propriété');
    }
    return property;
  },
); 