import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);
  
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    this.logger.debug(`Roles requis: ${roles}`);
    this.logger.debug(`Utilisateur: ${JSON.stringify(user)}`);
    
    return roles.some(role => 
      role.toLowerCase() === (user?.type || '').toLowerCase()
    );
  }
} 