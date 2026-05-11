import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import { ensureAdminRbacSeeded } from '../seed/ensure-admin-rbac';

/**
 * Runs the idempotent admin-RBAC seed on every backend boot.
 *
 * Why: `ensureAdminRbacSeeded` upserts the permission catalog (e.g. adding
 * newly-introduced keys like `products.manage`) and rebuilds the three system
 * roles (`super-admin` / `manager` / `support`) from
 * `MANAGER_PERMISSION_KEYS` / `SUPPORT_PERMISSION_KEYS`. Running it on boot
 * means a deploy with new permission keys doesn't require anyone to remember
 * to `npx prisma db seed` — the catalog catches up automatically.
 *
 * Safety:
 *   - Custom (non-system) roles are untouched. Their permission grants are
 *     only ever modified via the admin UI.
 *   - Failures are logged but never crash boot; a manual seed remains the
 *     fallback.
 */
@Injectable()
export class AdminRbacBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AdminRbacBootstrapService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    try {
      await ensureAdminRbacSeeded(this.prisma);
      this.logger.log('Admin RBAC catalog is up to date.');
    } catch (err) {
      this.logger.error(
        'Failed to ensure admin RBAC seed on boot — run `npx prisma db seed` manually to retry.',
        err instanceof Error ? err.stack : String(err),
      );
    }
  }
}
