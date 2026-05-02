/**
 * Address Service
 * Provides methods for managing customer addresses
 */

import { addressApi, Address, AddressWithId } from './api-client';

export class AddressService {
  /**
   * Get all addresses for the current customer
   */
  static async getAddresses(): Promise<AddressWithId[]> {
    return addressApi.getAddresses();
  }

  /**
   * Create a new address
   */
  static async createAddress(address: Address): Promise<AddressWithId> {
    return addressApi.createAddress(address);
  }

  /**
   * Update an existing address
   */
  static async updateAddress(
    id: string,
    address: Address,
  ): Promise<AddressWithId> {
    return addressApi.updateAddress(id, address);
  }

  /**
   * Delete an address
   */
  static async deleteAddress(id: string): Promise<void> {
    return addressApi.deleteAddress(id);
  }

  /**
   * Set an address as the default billing address
   */
  static async setDefaultBilling(id: string): Promise<AddressWithId> {
    return addressApi.setDefaultBilling(id);
  }

  /**
   * Set an address as the default shipping address
   */
  static async setDefaultShipping(id: string): Promise<AddressWithId> {
    return addressApi.setDefaultShipping(id);
  }
}

