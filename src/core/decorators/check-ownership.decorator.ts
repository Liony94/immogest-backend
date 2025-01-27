import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

export interface CheckOwnershipOptions {
  serviceClass: any;
  verifyMethod: string;
  idField?: string;
  errorMessage?: string;
  fromBody?: boolean;
}

let moduleRef: ModuleRef;

export function setModuleRef(ref: ModuleRef) {
  moduleRef = ref;
}

export const CheckOwnership = createParamDecorator(
  async (options: CheckOwnershipOptions, ctx: ExecutionContext) => {
    if (!options || !options.serviceClass || !options.verifyMethod) {
      throw new Error('CheckOwnership decorator requires serviceClass and verifyMethod options');
    }

    if (!moduleRef) {
      throw new Error('ModuleRef not set. Please call setModuleRef in your module');
    }

    const service = moduleRef.get(options.serviceClass);
    const request = ctx.switchToHttp().getRequest();
    const idField = options.idField || 'id';
    const userId = request.user.id;

    let id: number;
    if (options.fromBody) {
      id = parseInt(request.body[idField]);
    } else {
      id = parseInt(request.params[idField]);
    }

    const isOwner = await service[options.verifyMethod](id, userId);
    if (!isOwner) {
      throw new UnauthorizedException(
        options.errorMessage || 'Vous n\'êtes pas autorisé à effectuer cette action'
      );
    }

    return true;
  },
); 