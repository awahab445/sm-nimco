import { CreateManualOrderDto } from './create-manual-order.dto';

/**
 * Body for editing an existing manual order.
 * Same shape as create — items, addresses, customer, and fee/discount overrides.
 */
export class UpdateManualOrderDto extends CreateManualOrderDto {}
